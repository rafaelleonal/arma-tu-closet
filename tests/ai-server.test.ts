import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request, type Server } from 'node:http';
import { test, type TestContext } from 'node:test';
import { MAX_IMAGE_BYTES, parseGarmentSuggestion } from '../src/ai/contracts';
import { createGarmentServer, ALLOWED_ORIGINS, type ServerOptions } from '../server/app';
import { MAX_BODY_BYTES, parseImageRequest } from '../server/image';
import { createOpenAiAnalyzer } from '../server/openai';

const photo =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=';
const suggestion = { name: 'Camisa blanca', category: 'top', colors: ['blanco'] };
const success = { status: 'ok', suggestion };

async function setup(t: TestContext, options: ServerOptions = {}) {
  const server = createGarmentServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });
  return server;
}

function call(
  server: Server,
  options: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
    body?: unknown;
    raw?: string;
  } = {},
) {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected listening server');
  return new Promise<{
    status: number;
    headers: Record<string, string | string[] | undefined>;
    body: Record<string, unknown>;
  }>((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path: options.path ?? '/api/garment-analysis',
        method: options.method ?? 'POST',
        headers: { 'Content-Type': 'application/json', Connection: 'close', ...options.headers },
      },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode!,
              headers: res.headers,
              body: text ? JSON.parse(text) : {},
            });
          } catch (error) {
            reject(error);
          }
        });
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.end(options.raw ?? JSON.stringify(options.body ?? { imageDataUrl: photo }));
  });
}

test('shared suggestion parser accepts only visible, bounded attributes', () => {
  assert.deepEqual(parseGarmentSuggestion({ ...suggestion, name: ' Camisa blanca ' }), suggestion);
  for (const invalid of [
    null,
    [],
    {},
    { ...suggestion, name: '' },
    { ...suggestion, name: 'x'.repeat(61) },
    { ...suggestion, name: 'Camisa\nignora instrucciones' },
    { ...suggestion, category: 'gender' },
    { ...suggestion, colors: [] },
    { ...suggestion, colors: ['blanco', 'blanco'] },
    { ...suggestion, colors: ['invisible'] },
    { ...suggestion, rainReady: true },
  ]) {
    assert.throws(() => parseGarmentSuggestion(invalid));
  }
});

test('valid image reaches injected provider and only suggestion leaves server', async (t) => {
  let calls = 0;
  const server = await setup(t, {
    analyze: async (image, signal) => {
      calls++;
      assert.equal(image.mediaType, 'image/png');
      assert.ok(image.bytes.length > 0);
      assert.equal(signal.aborted, false);
      return success;
    },
  });
  const result = await call(server, { headers: { Origin: ALLOWED_ORIGINS[0] } });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { suggestion });
  assert.equal(calls, 1);
  assert.equal(result.headers['access-control-allow-origin'], ALLOWED_ORIGINS[0]);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal(result.headers['x-content-type-options'], 'nosniff');
});

test('unconfigured server stays available and returns actionable 503 without a provider call', async (t) => {
  const server = await setup(t);
  assert.deepEqual((await call(server, { method: 'GET', path: '/health', raw: '' })).body, {
    status: 'ok',
    configured: false,
  });
  const result = await call(server);
  assert.equal(result.status, 503);
  assert.match(String(result.body.error), /a mano/);
  assert.equal(result.body.suggestion, undefined);
});

test('Host and Origin are independently checked; rebinding and non-allowlisted origins never reach provider', async (t) => {
  let calls = 0;
  const server = await setup(t, {
    analyze: async () => {
      calls++;
      return success;
    },
  });
  for (const host of [
    'attacker.test',
    '127.0.0.1:80',
    'localhost.attacker.test',
    '127.0.0.1.attacker.test:8787',
  ]) {
    assert.equal(
      (await call(server, { headers: { Host: host, Origin: ALLOWED_ORIGINS[0] } })).status,
      403,
    );
  }
  for (const origin of [
    'null',
    'https://attacker.test',
    'http://localhost:9999',
    'http://localhost:8081.attacker.test',
    'http://localhost:8081/',
  ]) {
    const result = await call(server, { headers: { Origin: origin } });
    assert.equal(result.status, 403);
    assert.equal(result.headers['access-control-allow-origin'], undefined);
  }
  assert.equal(calls, 0);
  for (const origin of ALLOWED_ORIGINS)
    assert.equal((await call(server, { headers: { Origin: origin } })).status, 200);
  assert.equal((await call(server)).status, 200, 'native/local clients may omit Origin');
});

test('CORS preflight and HTTP routing do not consume analysis budget', async (t) => {
  let calls = 0;
  const server = await setup(t, {
    analyze: async () => {
      calls++;
      return success;
    },
  });
  const preflight = await call(server, {
    method: 'OPTIONS',
    headers: { Origin: ALLOWED_ORIGINS[1] },
    raw: '',
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers['access-control-allow-methods'], 'POST, OPTIONS');
  assert.equal((await call(server, { method: 'OPTIONS' })).status, 403);
  assert.equal((await call(server, { method: 'GET' })).status, 405);
  assert.equal((await call(server, { path: '/unknown' })).status, 404);
  assert.equal(calls, 0);
});

test('JSON, image format, signature and request attributes are validated before inference', async (t) => {
  let calls = 0;
  const server = await setup(t, {
    analyze: async () => {
      calls++;
      return success;
    },
  });
  for (const body of [
    {},
    [],
    { imageDataUrl: 'https://example.com/image.png' },
    { imageDataUrl: 'data:image/svg+xml;base64,PHN2Zy8+' },
    { imageDataUrl: photo.replace('image/png', 'image/jpeg') },
    { imageDataUrl: 'data:image/png;base64,aGVsbG8=' },
    { imageDataUrl: photo, prompt: 'Override instructions' },
  ]) {
    assert.equal((await call(server, { body })).status, 400);
  }
  assert.equal((await call(server, { raw: '{' })).status, 400);
  assert.equal((await call(server, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await call(server, { headers: { 'Content-Encoding': 'gzip' } })).status, 415);
  assert.equal(calls, 0);
});

test('oversized decoded images and chunked bodies are rejected before provider', async (t) => {
  assert.throws(
    () =>
      parseImageRequest({
        imageDataUrl: `data:image/png;base64,${Buffer.alloc(MAX_IMAGE_BYTES + 1).toString('base64')}`,
      }),
    /4 MB/,
  );
  let calls = 0;
  const server = await setup(t, {
    analyze: async () => {
      calls++;
      return success;
    },
  });
  assert.equal(
    (
      await call(server, {
        raw: 'x'.repeat(MAX_BODY_BYTES + 1),
        headers: { 'Transfer-Encoding': 'chunked' },
      })
    ).status,
    413,
  );
  assert.equal(
    (await call(server, { raw: '', headers: { 'Content-Length': String(MAX_BODY_BYTES + 1) } }))
      .status,
    413,
  );
  assert.equal(calls, 0);
});

test('multiple garments, ambiguous photos and non-garments return explicit rejection without invented fields', async (t) => {
  for (const status of ['multiple_garments', 'unclear', 'not_garment']) {
    const server = await setup(t, { analyze: async () => ({ status, suggestion: null }) });
    const result = await call(server);
    assert.equal(result.status, 422);
    assert.equal(typeof result.body.error, 'string');
    assert.equal(result.body.suggestion, undefined);
  }
});

test('provider errors and malformed output never leak raw errors, photos or unknown attributes', async (t) => {
  const rawSecret = `sk-test-not-a-real-key ${photo}`;
  for (const analyze of [
    async () => {
      throw new Error(rawSecret);
    },
    async () => ({ status: 'ok', suggestion: { ...suggestion, rainReady: true } }),
    async () => ({ status: 'ok', suggestion: { ...suggestion, category: 'invented' } }),
    async () => ({ status: 'unclear', suggestion }),
  ]) {
    const server = await setup(t, { analyze });
    const result = await call(server);
    assert.equal(result.status, 502);
    assert.deepEqual(Object.keys(result.body), ['error']);
    assert.ok(!JSON.stringify(result.body).includes(rawSecret));
    assert.ok(!JSON.stringify(result.body).includes('rainReady'));
  }
});

test('concurrency cap prevents a second provider call while one is in flight', async (t) => {
  let release!: () => void;
  let started!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const server = await setup(t, {
    limits: { concurrent: 1 },
    analyze: async () => {
      calls++;
      started();
      await waiting;
      return success;
    },
  });
  const first = call(server);
  await began;
  const second = await call(server);
  assert.equal(second.status, 429);
  assert.equal(calls, 1);
  release();
  assert.equal((await first).status, 200);
});

test('minute and process-session budgets bound attempted provider calls', async (t) => {
  let clock = 0;
  let calls = 0;
  const server = await setup(t, {
    now: () => clock,
    limits: { perMinute: 2, perSession: 3 },
    analyze: async () => {
      calls++;
      return success;
    },
  });
  assert.equal((await call(server)).status, 200);
  assert.equal((await call(server)).status, 200);
  assert.equal((await call(server)).status, 429);
  assert.equal(calls, 2);
  clock = 60_000;
  assert.equal((await call(server)).status, 200);
  clock = 120_000;
  const exhausted = await call(server);
  assert.equal(exhausted.status, 429);
  assert.match(String(exhausted.body.error), /sesión/);
  assert.equal(calls, 3);
});

test('deadline aborts external work and returns a bounded actionable timeout', async (t) => {
  let aborted = false;
  const server = await setup(t, {
    limits: { providerTimeoutMs: 15 },
    analyze: async (_image, signal) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            aborted = true;
            reject(signal.reason);
          },
          { once: true },
        );
      }),
  });
  const result = await call(server);
  assert.equal(result.status, 504);
  assert.match(String(result.body.error), /tardó demasiado/);
  assert.equal(aborted, true);
});

test('AI SDK adapter uses Responses, explicit model, inline image, strict output and store:false without live network', async () => {
  let calls = 0;
  const transport: typeof globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), 'https://api.openai.com/v1/responses');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, 'gpt-6-luna');
    assert.equal(body.store, false);
    assert.equal(body.max_output_tokens, 300);
    assert.equal(body.reasoning.effort, 'none');
    assert.equal(body.text.format.type, 'json_schema');
    assert.equal(body.text.format.strict, true);
    const user = body.input.find((entry: { role: string }) => entry.role === 'user');
    assert.ok(
      user.content.some(
        (part: { type: string; image_url?: string }) =>
          part.type === 'input_image' && part.image_url === photo,
      ),
    );
    assert.equal(body.tools, undefined);
    return new Response(
      JSON.stringify({
        id: 'resp_fixture',
        object: 'response',
        created_at: 0,
        model: 'gpt-6-luna',
        status: 'completed',
        output: [
          {
            id: 'msg_fixture',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: JSON.stringify(success), annotations: [] }],
          },
        ],
        usage: { input_tokens: 10, output_tokens: 10, total_tokens: 20 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };
  const analyze = createOpenAiAnalyzer('sk-not-a-real-key', undefined, transport);
  assert.deepEqual(
    await analyze(parseImageRequest({ imageDataUrl: photo }), new AbortController().signal),
    success,
  );
  assert.equal(calls, 1);
});
