import {
  isFiniteNumber,
  isRecord,
  isWeatherLocation,
  isWeatherSnapshot,
  type WeatherLocation,
  type WeatherSnapshot,
} from './types';

// Current data are model estimates, not an observation from a personal weather station.
// https://open-meteo.com/en/docs and https://open-meteo.com/en/docs/geocoding-api
export const WEATHER_REQUEST_TIMEOUT_MS = 10_000;
export type WeatherRequestErrorCode =
  'network' | 'http' | 'invalid' | 'timeout' | 'aborted';
export class WeatherRequestError extends Error {
  constructor(
    public readonly code: WeatherRequestErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'WeatherRequestError';
  }
}

function invalid(): never {
  throw new WeatherRequestError(
    'invalid',
    'El servicio devolvió datos de clima incompletos.',
  );
}

async function requestJson(
  url: string,
  fetcher: typeof fetch,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<unknown> {
  if (signal?.aborted)
    throw new WeatherRequestError('aborted', 'Consulta cancelada.');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel: (() => void) | undefined;
  const stopped = new Promise<never>((_, reject) => {
    cancel = () => {
      reject(new WeatherRequestError('aborted', 'Consulta cancelada.'));
      controller.abort();
    };
    signal?.addEventListener('abort', cancel, { once: true });
    timer = setTimeout(() => {
      reject(
        new WeatherRequestError(
          'timeout',
          'El clima tardó demasiado. Vuelve a intentar.',
        ),
      );
      controller.abort();
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      (async () => {
        let response: Response;
        try {
          response = await fetcher(url, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          });
        } catch {
          throw new WeatherRequestError(
            'network',
            'No se pudo conectar con el servicio de clima.',
          );
        }
        if (!response.ok)
          throw new WeatherRequestError(
            'http',
            'El servicio de clima no está disponible.',
          );
        try {
          return (await response.json()) as unknown;
        } catch {
          return invalid();
        }
      })(),
      stopped,
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (cancel) signal?.removeEventListener('abort', cancel);
  }
}

function distanceKm(
  location: WeatherLocation,
  latitude: number,
  longitude: number,
): number {
  const radians = Math.PI / 180;
  const a =
    Math.sin(((latitude - location.latitude) * radians) / 2) ** 2 +
    Math.cos(location.latitude * radians) *
      Math.cos(latitude * radians) *
      Math.sin(((longitude - location.longitude) * radians) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Closest candidate within maxKm of the given point; used to match a device position to a geocoded city. */
export function nearestLocation(
  locations: WeatherLocation[],
  latitude: number,
  longitude: number,
  maxKm = 50,
): WeatherLocation | undefined {
  let best: { location: WeatherLocation; km: number } | undefined;
  for (const location of locations) {
    const km = distanceKm(location, latitude, longitude);
    if (km <= maxKm && (!best || km < best.km)) best = { location, km };
  }
  return best?.location;
}

/**
 * Search terms for a reverse-geocoded place. Official names such as «Comitán de Domínguez» may only
 * exist in the geocoder in their short form, so the part before « de »/« del » is tried after the full name.
 */
export function placeSearchTerms(
  names: Array<string | null | undefined>,
  limit = 4,
): string[] {
  const terms: string[] = [];
  for (const raw of names) {
    const name = raw?.split(',')[0].trim();
    if (!name) continue;
    for (const term of [name, name.split(/\s+del?\s+/i)[0].trim()]) {
      if (
        term.length >= 2 &&
        !terms.some((existing) => existing.toLowerCase() === term.toLowerCase())
      )
        terms.push(term);
    }
  }
  return terms.slice(0, limit);
}

const RAIN_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 97, 99,
]);
export function hasPrecipitation(
  weatherCode: number,
  precipitation: number,
): boolean {
  // precipitation includes rain, showers and snow; protect clothing for any wet conditions.
  return precipitation > 0 || RAIN_CODES.has(weatherCode);
}

/** Injectable transport/clock only for deterministic tests; production uses fixed HTTPS hosts. */
export function createOpenMeteoClient(
  options: {
    fetcher?: typeof fetch;
    timeoutMs?: number;
    now?: () => Date;
  } = {},
) {
  const fetcher: typeof fetch =
    options.fetcher ?? ((input, init) => fetch(input, init));
  const timeoutMs = options.timeoutMs ?? WEATHER_REQUEST_TIMEOUT_MS;
  const now = options.now ?? (() => new Date());
  return {
    async searchLocations(
      query: string,
      signal?: AbortSignal,
    ): Promise<WeatherLocation[]> {
      if (signal?.aborted)
        throw new WeatherRequestError('aborted', 'Consulta cancelada.');
      const term = query.trim();
      if (term.length < 2) return [];
      if (term.length > 120)
        throw new WeatherRequestError(
          'invalid',
          'Escribe una ciudad de hasta 120 caracteres.',
        );
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=8&language=es&format=json`;
      const raw = await requestJson(url, fetcher, timeoutMs, signal);
      if (
        !isRecord(raw) ||
        raw.error ||
        (raw.results !== undefined && !Array.isArray(raw.results))
      )
        return invalid();
      if (raw.results === undefined) return [];
      const locations: WeatherLocation[] = [];
      for (const candidate of raw.results) {
        if (!isRecord(candidate)) return invalid();
        const location = {
          id: candidate.id,
          name: candidate.name,
          country: candidate.country,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          timezone: candidate.timezone,
          ...(candidate.admin1 !== undefined && candidate.admin1 !== ''
            ? { admin1: candidate.admin1 }
            : {}),
        };
        if (!isWeatherLocation(location)) return invalid();
        if (!locations.some((existing) => existing.id === location.id))
          locations.push(location);
      }
      return locations.slice(0, 8);
    },
    async fetchWeather(
      location: WeatherLocation,
      signal?: AbortSignal,
    ): Promise<WeatherSnapshot> {
      if (!isWeatherLocation(location)) return invalid();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code&temperature_unit=celsius&precipitation_unit=mm&timeformat=unixtime&timezone=GMT&forecast_days=1`;
      const raw = await requestJson(url, fetcher, timeoutMs, signal);
      if (
        !isRecord(raw) ||
        raw.error ||
        !isRecord(raw.current) ||
        !isFiniteNumber(raw.latitude) ||
        Math.abs(raw.latitude) > 90 ||
        !isFiniteNumber(raw.longitude) ||
        Math.abs(raw.longitude) > 180 ||
        // Model grid coordinates can differ from the selected city's exact coordinates.
        distanceKm(location, raw.latitude, raw.longitude) > 100
      )
        return invalid();
      const current = raw.current;
      if (
        !isFiniteNumber(current.time) ||
        current.time <= 0 ||
        !isFiniteNumber(current.precipitation) ||
        current.precipitation < 0 ||
        !isFiniteNumber(current.weather_code)
      )
        return invalid();
      const observedDate = new Date(current.time * 1000);
      if (!Number.isFinite(observedDate.getTime())) return invalid();
      const snapshot = {
        locationId: location.id,
        temperatureC: current.temperature_2m,
        apparentTemperatureC: current.apparent_temperature,
        raining: hasPrecipitation(current.weather_code, current.precipitation),
        weatherCode: current.weather_code,
        observedAt: observedDate.toISOString(),
        fetchedAt: now().toISOString(),
      };
      if (!isWeatherSnapshot(snapshot)) return invalid();
      return snapshot;
    },
  };
}

const client = createOpenMeteoClient();
export const searchLocations = client.searchLocations;
export const fetchWeather = client.fetchWeather;
