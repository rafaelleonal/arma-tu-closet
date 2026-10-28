import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createOpenMeteoClient,
  WeatherRequestError,
  hasPrecipitation,
  nearestLocation,
  placeSearchTerms,
} from '../src/weather/openMeteo';
import {
  getEffectiveWeatherContext,
  getWeatherFreshness,
  shouldRefreshWeather,
} from '../src/weather/helpers';
import {
  isWeatherSettings,
  type WeatherLocation,
  type WeatherSettings,
} from '../src/weather/types';

const NOW = '2026-10-23T18:00:00.000Z';
const location: WeatherLocation = {
  id: 3530367,
  name: 'Comitán',
  country: 'México',
  admin1: 'Chiapas',
  latitude: 16.25,
  longitude: -92.13,
  timezone: 'America/Mexico_City',
};
const payload = () => ({
  latitude: 16.25,
  longitude: -92.12,
  utc_offset_seconds: 0,
  current: {
    time: Date.parse(NOW) / 1000,
    temperature_2m: 19.5,
    apparent_temperature: 17.2,
    precipitation: 0.3,
    weather_code: 61,
  },
});
const transport =
  (data: unknown): typeof fetch =>
  async () =>
    new Response(JSON.stringify(data), { status: 200 });
const clientWith = (data: unknown) =>
  createOpenMeteoClient({ fetcher: transport(data), now: () => new Date(NOW) });
const settings = (ageMinutes = 0): WeatherSettings => ({
  mode: 'automatic',
  location,
  snapshot: {
    locationId: location.id,
    temperatureC: 19.5,
    apparentTemperatureC: 17.2,
    raining: true,
    weatherCode: 61,
    observedAt: new Date(Date.parse(NOW) - ageMinutes * 60_000).toISOString(),
    fetchedAt: new Date(Date.parse(NOW) - ageMinutes * 60_000).toISOString(),
  },
});
const code = (expected: WeatherRequestError['code']) => (error: unknown) =>
  error instanceof WeatherRequestError && error.code === expected;

test('city search uses the fixed geocoding host, encoded query, Spanish labels and validated choices', async () => {
  let requested = '';
  const client = createOpenMeteoClient({
    fetcher: async (url) => {
      requested = String(url);
      return new Response(
        JSON.stringify({
          results: [
            location,
            { ...location, id: 2, country: 'Guatemala' },
            location,
          ],
        }),
      );
    },
  });
  const results = await client.searchLocations(' Comitán, México ');
  const url = new URL(requested);
  assert.equal(url.origin, 'https://geocoding-api.open-meteo.com');
  assert.equal(url.pathname, '/v1/search');
  assert.equal(url.searchParams.get('name'), 'Comitán, México');
  assert.equal(url.searchParams.get('language'), 'es');
  assert.equal(url.searchParams.get('count'), '8');
  assert.equal(results.length, 2);
  assert.deepEqual(results[0], location);
  assert.equal(results[1].country, 'Guatemala');
});

test('search handles no matches and short queries without making a request', async () => {
  let calls = 0;
  const client = createOpenMeteoClient({
    fetcher: async () => {
      calls++;
      return new Response('{}');
    },
  });
  assert.deepEqual(await client.searchLocations(' '), []);
  assert.deepEqual(await client.searchLocations('a'), []);
  assert.equal(calls, 0);
  assert.deepEqual(await client.searchLocations('NoExiste'), []);
  assert.equal(calls, 1);
  await assert.rejects(
    client.searchLocations('a'.repeat(121)),
    code('invalid'),
  );
});

test('weather requests only the selected location and parses unixtime as UTC without applying offsets', async () => {
  let requested = '';
  const data = payload();
  data.utc_offset_seconds = -21600;
  const client = createOpenMeteoClient({
    now: () => new Date(NOW),
    fetcher: async (url) => {
      requested = String(url);
      return new Response(JSON.stringify(data));
    },
  });
  const snapshot = await client.fetchWeather(location);
  const url = new URL(requested);
  assert.equal(url.origin, 'https://api.open-meteo.com');
  assert.equal(url.searchParams.get('latitude'), String(location.latitude));
  assert.equal(url.searchParams.get('longitude'), String(location.longitude));
  assert.equal(url.searchParams.get('timeformat'), 'unixtime');
  assert.equal(
    url.searchParams.get('current'),
    'temperature_2m,apparent_temperature,precipitation,weather_code',
  );
  assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
  assert.equal(snapshot.locationId, location.id);
  assert.equal(snapshot.observedAt, NOW);
  assert.equal(snapshot.fetchedAt, NOW);
  assert.equal(snapshot.temperatureC, 19.5);
  assert.equal(snapshot.apparentTemperatureC, 17.2);
  assert.equal(snapshot.raining, true);
});

test('precipitation amount and WMO rain codes independently activate wet-weather context', () => {
  assert.equal(hasPrecipitation(0, 0), false);
  assert.equal(hasPrecipitation(3, 0.1), true);
  for (const weatherCode of [51, 57, 61, 67, 80, 82, 95, 96, 97, 99])
    assert.equal(hasPrecipitation(weatherCode, 0), true);
  assert.equal(hasPrecipitation(45, 0), false);
  assert.equal(hasPrecipitation(71, 0.2), true); // Provider precipitation also includes snow.
});

test('malformed geocoding responses and invalid coordinates never become choices', async () => {
  for (const data of [
    null,
    [],
    { error: true },
    { results: 'bad' },
    { results: [null] },
    { results: [{ ...location, id: -1 }] },
    { results: [{ ...location, latitude: 91 }] },
    { results: [{ ...location, timezone: '' }] },
    { results: [{ ...location, admin1: 0 }] },
  ]) {
    await assert.rejects(
      clientWith(data).searchLocations('Comitán'),
      code('invalid'),
    );
  }
});

test('malformed weather, distant model coordinates and impossible observation times reject', async () => {
  const cases = [
    null,
    [],
    { error: true },
    { current: {} },
    { ...payload(), latitude: 50 },
    { ...payload(), current: { ...payload().current, temperature_2m: null } },
    {
      ...payload(),
      current: { ...payload().current, apparent_temperature: 150 },
    },
    { ...payload(), current: { ...payload().current, precipitation: -1 } },
    { ...payload(), current: { ...payload().current, weather_code: 999 } },
    {
      ...payload(),
      current: { ...payload().current, time: '2026-10-23T18:00' },
    },
    {
      ...payload(),
      current: { ...payload().current, time: Date.parse(NOW) / 1000 + 86400 },
    },
  ];
  for (const data of cases)
    await assert.rejects(
      clientWith(data).fetchWeather(location),
      code('invalid'),
    );
  await assert.rejects(
    clientWith(payload()).fetchWeather({ ...location, latitude: NaN }),
    code('invalid'),
  );
});

test('HTTP, network and malformed JSON failures have recoverable error codes', async () => {
  const http = createOpenMeteoClient({
    fetcher: async () => new Response('{}', { status: 503 }),
  });
  const network = createOpenMeteoClient({
    fetcher: async () => {
      throw new TypeError('offline');
    },
  });
  const malformed = createOpenMeteoClient({
    fetcher: async () => new Response('{broken'),
  });
  await assert.rejects(http.fetchWeather(location), code('http'));
  await assert.rejects(network.fetchWeather(location), code('network'));
  await assert.rejects(malformed.fetchWeather(location), code('invalid'));
});

test('caller cancellation works before and during a request even if transport ignores AbortSignal', async () => {
  let calls = 0;
  const client = createOpenMeteoClient({
    fetcher: async () => {
      calls++;
      return new Promise<Response>(() => undefined);
    },
  });
  const already = new AbortController();
  already.abort();
  await assert.rejects(
    client.fetchWeather(location, already.signal),
    code('aborted'),
  );
  assert.equal(calls, 0);
  const controller = new AbortController();
  const request = client.searchLocations('Comitán', controller.signal);
  controller.abort();
  await assert.rejects(request, code('aborted'));
  assert.equal(calls, 1);
});

test('timeout bounds both a stalled fetch and stalled JSON body and aborts the transport', async () => {
  let innerSignal: AbortSignal | undefined;
  const stalledFetch = createOpenMeteoClient({
    timeoutMs: 5,
    fetcher: async (_, options) => {
      innerSignal = options?.signal ?? undefined;
      return new Promise<Response>(() => undefined);
    },
  });
  await assert.rejects(stalledFetch.fetchWeather(location), code('timeout'));
  assert.equal(innerSignal?.aborted, true);
  const stalledBody = createOpenMeteoClient({
    timeoutMs: 5,
    fetcher: async () =>
      ({
        ok: true,
        json: () => new Promise(() => undefined),
      }) as unknown as Response,
  });
  await assert.rejects(stalledBody.fetchWeather(location), code('timeout'));
});

test('successful requests detach caller cancellation listeners', async () => {
  let innerSignal: AbortSignal | undefined;
  const caller = new AbortController();
  const client = createOpenMeteoClient({
    now: () => new Date(NOW),
    fetcher: async (_, options) => {
      innerSignal = options?.signal ?? undefined;
      return new Response(JSON.stringify(payload()));
    },
  });
  await client.fetchWeather(location, caller.signal);
  caller.abort();
  assert.equal(innerSignal?.aborted, false);
});

test('freshness refreshes after 30 minutes and expires both fetch and observation age at three hours', () => {
  assert.equal(getWeatherFreshness(settings(), NOW), 'fresh');
  assert.equal(getWeatherFreshness(settings(29.99), NOW), 'fresh');
  assert.equal(getWeatherFreshness(settings(30), NOW), 'refresh');
  assert.equal(getWeatherFreshness(settings(179), NOW), 'refresh');
  assert.equal(getWeatherFreshness(settings(180), NOW), 'expired');
  const oldObservation = settings();
  oldObservation.snapshot!.observedAt = '2026-10-23T14:00:00Z';
  assert.equal(getWeatherFreshness(oldObservation, NOW), 'expired');
  const futureFetch = settings(-10);
  assert.equal(getWeatherFreshness(futureFetch, NOW), 'expired');
  assert.equal(getWeatherFreshness(settings(), 'invalid'), 'expired');
});

test('snapshot for another location is unusable; automatic refresh requires a chosen location', () => {
  const wrong = settings();
  wrong.snapshot!.locationId += 1;
  assert.equal(isWeatherSettings(wrong), false);
  assert.equal(getWeatherFreshness(wrong, NOW), 'missing');
  assert.equal(shouldRefreshWeather(wrong, NOW), true);
  assert.equal(shouldRefreshWeather({ mode: 'automatic' }, NOW), false);
  assert.equal(shouldRefreshWeather({ mode: 'manual', location }, NOW), false);
  assert.equal(shouldRefreshWeather(settings(30), NOW), true);
  assert.equal(shouldRefreshWeather(settings(), NOW), false);
});

test('effective context uses apparent temperature without mutating manual controls or unrelated context', () => {
  const manual = {
    temperatureC: 26,
    raining: false,
    city: 'Ciudad manual',
    occasion: 'work',
    season: 'Otoño',
  };
  const snapshot = structuredClone(manual);
  const effective = getEffectiveWeatherContext(manual, settings(), NOW);
  assert.equal(effective.source, 'automatic');
  assert.deepEqual(effective.context, {
    ...manual,
    temperatureC: 17.2,
    raining: true,
    city: 'Comitán',
  });
  assert.deepEqual(manual, snapshot);
  for (const weather of [
    { ...settings(), mode: 'manual' as const },
    settings(180),
    { mode: 'automatic' as const },
    { mode: 'automatic' as const, location },
  ]) {
    const fallback = getEffectiveWeatherContext(manual, weather, NOW);
    assert.equal(fallback.source, 'manual');
    assert.deepEqual(fallback.context, manual);
    assert.notEqual(fallback.context, manual);
  }
  assert.equal(
    getEffectiveWeatherContext(manual, settings(120), NOW).source,
    'automatic',
  );
});

test('device position matches the closest same-name city and rejects distant homonyms', () => {
  const jalisco: WeatherLocation = {
    ...location,
    id: 4013704,
    admin1: 'Jalisco',
    latitude: 19.93,
    longitude: -103.57,
  };
  assert.equal(
    nearestLocation([jalisco, location], 16.24, -92.1)?.id,
    location.id,
  );
  assert.equal(nearestLocation([jalisco], 16.24, -92.1), undefined);
  assert.equal(nearestLocation([], 16.24, -92.1), undefined);
});

test('reverse-geocoded official names also search their short form without duplicates', () => {
  assert.deepEqual(
    placeSearchTerms([
      'Comitán de Domínguez',
      'Comitán de Domínguez',
      undefined,
    ]),
    ['Comitán de Domínguez', 'Comitán'],
  );
  assert.deepEqual(placeSearchTerms(['Ciudad de México']), [
    'Ciudad de México',
    'Ciudad',
  ]);
  assert.deepEqual(
    placeSearchTerms(['San Cristóbal de las Casas', ' ', null, 'Chiapas']),
    ['San Cristóbal de las Casas', 'San Cristóbal', 'Chiapas'],
  );
  assert.equal(
    placeSearchTerms(['Uno de Dos', 'Tres de Cuatro', 'Cinco de Seis']).length,
    4,
  );
});
