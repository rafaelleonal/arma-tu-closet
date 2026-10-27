import { MAX_IMAGE_BYTES, parseGarmentSuggestion, type GarmentSuggestion } from './contracts';

export class AiClientError extends Error {
  constructor(public readonly code: 'configuration' | 'image' | 'network' | 'timeout' | 'aborted' | 'response' | 'server', message: string) {
    super(message); this.name = 'AiClientError';
  }
}
export type SupportedImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

/** Inspects only the local bytes; a URI or filename never determines the format. */
export function imageMimeTypeFromBase64(base64: string): SupportedImageMime {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  let bits = 0; let value = 0;
  for (const char of base64.slice(0, 24)) {
    const digit = alphabet.indexOf(char);
    if (digit < 0) break;
    value = (value << 6) | digit; bits += 6;
    if (bits >= 8) { bits -= 8; bytes.push((value >> bits) & 255); }
  }
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) return 'image/png';
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  throw new AiClientError('image', 'Usa una foto JPEG, PNG o WebP. No se envió la imagen.');
}

export function validateImageDataUrl(imageDataUrl: string): void {
  if (typeof imageDataUrl !== 'string') throw new AiClientError('image', 'Elige una foto local para analizar.');
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageDataUrl);
  if (!match || match[2].length % 4 !== 0) throw new AiClientError('image', 'Usa una foto JPEG, PNG o WebP. No se envió la imagen.');
  const base64 = match[2];
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  if (base64.length / 4 * 3 - padding > MAX_IMAGE_BYTES) throw new AiClientError('image', 'La foto supera 4 MiB. Elige una más pequeña para analizar.');
  if (imageMimeTypeFromBase64(base64) !== match[1]) throw new AiClientError('image', 'El formato de la foto no coincide con sus datos. Elige otra imagen.');
}

export function resolveAiApiUrl(platform: string, configuredUrl = process.env.EXPO_PUBLIC_AI_API_URL, hostname?: string): string {
  let base = configuredUrl?.trim();
  if (!base) {
    if (platform !== 'web') throw new AiClientError('configuration', 'El análisis no está configurado en este dispositivo. Puedes completar la prenda manualmente.');
    if (!hostname || ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)) base = 'http://127.0.0.1:8787';
    else throw new AiClientError('configuration', 'El análisis no está configurado para este sitio. Puedes completar la prenda manualmente.');
  }
  let url: URL;
  try { url = new URL(base); } catch { throw new AiClientError('configuration', 'La dirección del servicio de análisis no es válida.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new AiClientError('configuration', 'La dirección del servicio de análisis no es válida.');
  return `${url.toString().replace(/\/$/, '')}/api/garment-analysis`;
}

export interface AnalyzePhotoOptions {
  apiUrl: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export async function analyzeGarmentPhoto(imageDataUrl: string, { apiUrl, signal, timeoutMs = 30_000, fetchImpl = fetch }: AnalyzePhotoOptions): Promise<GarmentSuggestion> {
  validateImageDataUrl(imageDataUrl);
  if (signal?.aborted) throw new AiClientError('aborted', 'Análisis cancelado.');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new AiClientError('configuration', 'El tiempo límite del análisis no es válido.');
  const controller = new AbortController();
  let stopReason: AiClientError | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let abortListener: (() => void) | undefined;
  const stopped = new Promise<never>((_, reject) => {
    abortListener = () => { stopReason = new AiClientError('aborted', 'Análisis cancelado.'); controller.abort(); reject(stopReason); };
    signal?.addEventListener('abort', abortListener, { once: true });
    timeout = setTimeout(() => { stopReason = new AiClientError('timeout', 'El análisis tardó demasiado. Puedes reintentar o completar la prenda manualmente.'); controller.abort(); reject(stopReason); }, timeoutMs);
  });
  const request = async (): Promise<GarmentSuggestion> => {
    let response: Response;
    try { response = await fetchImpl(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageDataUrl }), signal: controller.signal }); }
    catch (error) {
      if (controller.signal.aborted) throw stopReason || error;
      throw new AiClientError('network', 'No pudimos conectar con el análisis. Puedes reintentar o completar la prenda manualmente.');
    }
    let body: unknown;
    try { body = await response.json(); } catch { throw new AiClientError('response', 'El servicio devolvió una respuesta no válida. Puedes reintentar.'); }
    if (!response.ok) {
      const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error.trim().slice(0, 240) : '';
      throw new AiClientError('server', message || 'No pudimos analizar la foto. Puedes reintentar o completar la prenda manualmente.');
    }
    try {
      if (!body || typeof body !== 'object' || !('suggestion' in body)) throw new Error('missing');
      return parseGarmentSuggestion(body.suggestion);
    } catch { throw new AiClientError('response', 'El análisis devolvió datos incompletos. No cambiamos tu formulario.'); }
  };
  try { return await Promise.race([request(), stopped]); }
  finally { if (timeout) clearTimeout(timeout); if (abortListener) signal?.removeEventListener('abort', abortListener); }
}
