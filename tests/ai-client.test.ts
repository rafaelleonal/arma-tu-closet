import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  AiClientError,
  analyzeGarmentPhoto,
  imageMimeTypeFromBase64,
  resolveAiApiUrl,
  validateImageDataUrl,
} from '../src/ai/client';
import { MAX_IMAGE_BYTES } from '../src/ai/contracts';

const imageDataUrl = `data:image/png;base64,${readFileSync('tests/fixtures/photo.png').toString('base64')}`;
const suggestion = {
  name: 'Camisa blanca',
  category: 'top',
  colors: ['blanco'],
};
const apiUrl = 'http://127.0.0.1:8787/api/garment-analysis';
const errorCode = (code: AiClientError['code']) => (error: unknown) =>
  error instanceof AiClientError && error.code === code;
const jsonFetch =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

test('AI service defaults only on local web; native requires explicit configuration', () => {
  assert.equal(resolveAiApiUrl('web', '', 'localhost'), apiUrl);
  assert.equal(resolveAiApiUrl('web', '', '127.0.0.1'), apiUrl);
  assert.equal(
    resolveAiApiUrl('ios', 'http://192.168.1.4:8787/'),
    'http://192.168.1.4:8787/api/garment-analysis',
  );
  assert.throws(
    () => resolveAiApiUrl('android', ''),
    errorCode('configuration'),
  );
  assert.throws(
    () => resolveAiApiUrl('web', '', 'example.com'),
    errorCode('configuration'),
  );
  for (const url of [
    'file:///tmp/server',
    'https://user:secret@example.com',
    'not a URL',
  ])
    assert.throws(
      () => resolveAiApiUrl('web', url),
      errorCode('configuration'),
    );
});

test('image validation rejects remote URLs, unsupported formats, malformed data and oversized bytes', () => {
  validateImageDataUrl(imageDataUrl);
  assert.equal(imageMimeTypeFromBase64('/9j/2Q=='), 'image/jpeg');
  assert.equal(imageMimeTypeFromBase64('UklGRgAAAABXRUJQ'), 'image/webp');
  for (const input of [
    'https://example.com/photo.jpg',
    'data:image/heic;base64,AAAA',
    'data:image/png;base64,%%%%',
    'data:image/png;base64,AAAA',
    imageDataUrl.replace('image/png', 'image/jpeg'),
  ])
    assert.throws(() => validateImageDataUrl(input), errorCode('image'));
  const oversized = `data:image/png;base64,iVBORw0KGgoA${'A'.repeat(Math.ceil(MAX_IMAGE_BYTES / 3) * 4)}`;
  assert.throws(() => validateImageDataUrl(oversized), errorCode('image'));
});

test('analysis sends only the explicitly supplied image and parses a validated suggestion', async () => {
  let received: unknown;
  const result = await analyzeGarmentPhoto(imageDataUrl, {
    apiUrl,
    fetchImpl: async (url, options) => {
      assert.equal(url, apiUrl);
      assert.equal(options?.method, 'POST');
      assert.deepEqual(options?.headers, {
        'Content-Type': 'application/json',
      });
      received = JSON.parse(String(options?.body));
      return new Response(JSON.stringify({ suggestion }));
    },
  });
  assert.deepEqual(received, { imageDataUrl });
  assert.deepEqual(result, suggestion);
});

test('invalid suggestions and non-JSON responses never reach the editor', async () => {
  for (const body of [
    {},
    { suggestion: null },
    { suggestion: { ...suggestion, category: 'unknown' } },
    { suggestion: { ...suggestion, colors: [] } },
    { suggestion: { ...suggestion, name: '' } },
  ]) {
    await assert.rejects(
      analyzeGarmentPhoto(imageDataUrl, { apiUrl, fetchImpl: jsonFetch(body) }),
      errorCode('response'),
    );
  }
  await assert.rejects(
    analyzeGarmentPhoto(imageDataUrl, {
      apiUrl,
      fetchImpl: async () => new Response('<html>error</html>'),
    }),
    errorCode('response'),
  );
});

test('server and network errors are actionable without a fabricated result', async () => {
  await assert.rejects(
    analyzeGarmentPhoto(imageDataUrl, {
      apiUrl,
      fetchImpl: jsonFetch({ error: 'El análisis está desactivado.' }, 503),
    }),
    (error) =>
      error instanceof AiClientError &&
      error.code === 'server' &&
      error.message === 'El análisis está desactivado.',
  );
  await assert.rejects(
    analyzeGarmentPhoto(imageDataUrl, {
      apiUrl,
      fetchImpl: jsonFetch({}, 500),
    }),
    errorCode('server'),
  );
  await assert.rejects(
    analyzeGarmentPhoto(imageDataUrl, {
      apiUrl,
      fetchImpl: async () => {
        throw new TypeError('fetch failed');
      },
    }),
    errorCode('network'),
  );
});

test('timeout rejects even when transport ignores abort; transport receives cancellation', async () => {
  let requestSignal: AbortSignal | null | undefined;
  await assert.rejects(
    analyzeGarmentPhoto(imageDataUrl, {
      apiUrl,
      timeoutMs: 10,
      fetchImpl: async (_, options) => {
        requestSignal = options?.signal;
        return await new Promise<Response>(() => {});
      },
    }),
    errorCode('timeout'),
  );
  assert.equal(requestSignal?.aborted, true);
});

test('external abort rejects pending responses and already-aborted requests never fetch', async () => {
  const controller = new AbortController();
  const pending = analyzeGarmentPhoto(imageDataUrl, {
    apiUrl,
    signal: controller.signal,
    fetchImpl: async () => await new Promise<Response>(() => {}),
  });
  controller.abort();
  await assert.rejects(pending, errorCode('aborted'));
  let calls = 0;
  await assert.rejects(
    analyzeGarmentPhoto(imageDataUrl, {
      apiUrl,
      signal: controller.signal,
      fetchImpl: async () => {
        calls++;
        return new Response('{}');
      },
    }),
    errorCode('aborted'),
  );
  assert.equal(calls, 0);
});

test('invalid images fail before sending anything', async () => {
  let calls = 0;
  await assert.rejects(
    analyzeGarmentPhoto('https://example.com/photo.jpg', {
      apiUrl,
      fetchImpl: async () => {
        calls++;
        return new Response('{}');
      },
    }),
    errorCode('image'),
  );
  assert.equal(calls, 0);
});
