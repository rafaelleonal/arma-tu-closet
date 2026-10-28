import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { parseAnalysisResult, rejectionMessages, type GarmentAnalyzer } from './analysis';
import { MAX_BODY_BYTES, parseImageRequest, RequestError } from './image';

export const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8082',
] as const;

export interface ServerOptions {
  analyze?: GarmentAnalyzer;
  limits?: Partial<{
    concurrent: number;
    perMinute: number;
    perSession: number;
    providerTimeoutMs: number;
    bodyTimeoutMs: number;
  }>;
  now?: () => number;
}

/** Loopback prototype only: Origin/Host checks are not production authentication. */
export function createGarmentServer({
  analyze,
  limits: overrides,
  now = Date.now,
}: ServerOptions = {}) {
  const limits = {
    concurrent: 2,
    perMinute: 6,
    perSession: 50,
    providerTimeoutMs: 20_000,
    bodyTimeoutMs: 10_000,
    ...overrides,
  };
  let active = 0;
  let sessionRequests = 0;
  let minuteRequests = 0;
  let windowStart = now();
  const server = createServer((request, response) => {
    void handle(request, response);
  });
  server.headersTimeout = 5_000;
  server.requestTimeout = 15_000;
  server.keepAliveTimeout = 5_000;

  async function handle(request: IncomingMessage, response: ServerResponse) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Vary', 'Origin');
    try {
      const port = request.socket.localPort;
      const loopback = (address: string | undefined) =>
        address === '127.0.0.1' || address === '::ffff:127.0.0.1' || address === '::1';
      if (
        !loopback(request.socket.localAddress) ||
        !loopback(request.socket.remoteAddress) ||
        ![`127.0.0.1:${port}`, `localhost:${port}`].includes(request.headers.host ?? '')
      ) {
        throw new RequestError(403, 'Este servidor solo acepta conexiones locales.');
      }
      const origin = request.headers.origin;
      if (origin !== undefined && !(ALLOWED_ORIGINS as readonly string[]).includes(origin))
        throw new RequestError(403, 'Este origen no está permitido.');
      if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
      const path = request.url?.split('?')[0];
      if (request.method === 'GET' && path === '/health')
        return send(response, 200, { status: 'ok', configured: !!analyze });
      if (path !== '/api/garment-analysis') throw new RequestError(404, 'Ruta no encontrada.');
      if (request.method === 'OPTIONS') {
        if (!origin) throw new RequestError(403, 'Este origen no está permitido.');
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return send(response, 204);
      }
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST, OPTIONS');
        throw new RequestError(405, 'Usa POST para analizar una foto.');
      }
      if (!analyze)
        throw new RequestError(
          503,
          'El análisis con IA aún no está activado. Puedes completar los datos a mano.',
        );
      if (
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
          request.headers['content-type'] ?? '',
        ) ||
        request.headers['content-encoding']
      ) {
        throw new RequestError(415, 'Envía la foto como JSON sin compresión.');
      }
      const body = await readBody(request, limits.bodyTimeoutMs);
      let input: unknown;
      try {
        input = JSON.parse(body);
      } catch {
        throw new RequestError(400, 'El cuerpo de la solicitud no es JSON válido.');
      }
      const image = parseImageRequest(input);
      if (now() - windowStart >= 60_000) {
        windowStart = now();
        minuteRequests = 0;
      }
      if (active >= limits.concurrent) {
        response.setHeader('Retry-After', '2');
        throw new RequestError(429, 'Hay un análisis en curso. Espera un momento.');
      }
      if (sessionRequests >= limits.perSession)
        throw new RequestError(
          429,
          'Se alcanzó el límite de análisis de esta sesión del servidor. Continúa a mano.',
        );
      if (minuteRequests >= limits.perMinute) {
        response.setHeader(
          'Retry-After',
          String(Math.max(1, Math.ceil((60_000 - (now() - windowStart)) / 1_000))),
        );
        throw new RequestError(
          429,
          'Se alcanzó el límite de análisis por minuto. Espera o continúa a mano.',
        );
      }
      active++;
      minuteRequests++;
      sessionRequests++;
      const controller = new AbortController();
      const timer = setTimeout(
        () =>
          controller.abort(
            new RequestError(
              504,
              'El análisis tardó demasiado. Intenta de nuevo o continúa a mano.',
            ),
          ),
        limits.providerTimeoutMs,
      );
      const onClose = () => {
        if (!response.writableEnded) controller.abort(new Error('Client disconnected'));
      };
      response.on('close', onClose);
      try {
        const analysis = Promise.resolve()
          .then(() => analyze(image, controller.signal))
          .finally(() => {
            active--;
          });
        const aborted = new Promise<never>((_, reject) =>
          controller.signal.addEventListener('abort', () => reject(controller.signal.reason), {
            once: true,
          }),
        );
        const result = parseAnalysisResult(await Promise.race([analysis, aborted]));
        if (result.status !== 'ok') throw new RequestError(422, rejectionMessages[result.status]);
        send(response, 200, { suggestion: result.suggestion });
      } finally {
        clearTimeout(timer);
        response.removeListener('close', onClose);
      }
    } catch (error) {
      if (response.destroyed || response.writableEnded) return;
      if (error instanceof RequestError) send(response, error.status, { error: error.message });
      else
        send(response, 502, {
          error: 'No se pudo analizar la foto. Intenta de nuevo o completa los datos a mano.',
        });
    }
  }
  return server;
}

function send(response: ServerResponse, status: number, body?: unknown) {
  response.statusCode = status;
  if (body === undefined) {
    response.end();
    return;
  }
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function readBody(request: IncomingMessage, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const length = request.headers['content-length'];
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
      request.resume();
      reject(
        new RequestError(413, 'La solicitud es demasiado grande. Elige una foto de hasta 4 MB.'),
      );
      return;
    }
    let size = 0;
    let chunks: Buffer[] = [];
    const timer = setTimeout(
      () => fail(new RequestError(408, 'La foto tardó demasiado en llegar. Intenta de nuevo.')),
      timeoutMs,
    );
    const cleanup = () => {
      clearTimeout(timer);
      request.removeListener('data', onData);
      request.removeListener('end', onEnd);
      request.removeListener('error', fail);
      request.removeListener('aborted', onAborted);
    };
    const fail = (error: Error) => {
      cleanup();
      chunks = [];
      request.resume();
      reject(error);
    };
    const onAborted = () =>
      fail(new RequestError(400, 'La carga de la foto se interrumpió. Intenta de nuevo.'));
    const onData = (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES)
        fail(
          new RequestError(413, 'La solicitud es demasiado grande. Elige una foto de hasta 4 MB.'),
        );
      else chunks.push(chunk);
    };
    const onEnd = () => {
      cleanup();
      resolve(Buffer.concat(chunks).toString('utf8'));
    };
    request.on('data', onData);
    request.once('end', onEnd);
    request.once('error', fail);
    request.once('aborted', onAborted);
  });
}
