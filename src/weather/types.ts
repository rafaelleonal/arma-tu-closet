export interface WeatherLocation {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherSnapshot {
  locationId: number;
  temperatureC: number;
  apparentTemperatureC: number;
  raining: boolean;
  weatherCode: number;
  observedAt: string;
  fetchedAt: string;
}

export interface WeatherSettings {
  mode: 'manual' | 'automatic';
  location?: WeatherLocation;
  snapshot?: WeatherSnapshot;
}

export const WEATHER_CODES = [
  0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77,
  80, 81, 82, 85, 86, 95, 96, 97, 99,
] as const;
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && !!value.trim();
const positiveId = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isSafeInteger(value) && value > 0;
const instant = (value: unknown): value is string =>
  typeof value === 'string' &&
  /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value));
const validTemperature = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= -100 && value <= 100;

export function isWeatherLocation(value: unknown): value is WeatherLocation {
  return (
    isRecord(value) &&
    positiveId(value.id) &&
    nonempty(value.name) &&
    nonempty(value.country) &&
    (value.admin1 === undefined || nonempty(value.admin1)) &&
    isFiniteNumber(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    isFiniteNumber(value.longitude) &&
    Math.abs(value.longitude) <= 180 &&
    nonempty(value.timezone)
  );
}

export function isWeatherSnapshot(value: unknown): value is WeatherSnapshot {
  return (
    isRecord(value) &&
    positiveId(value.locationId) &&
    validTemperature(value.temperatureC) &&
    validTemperature(value.apparentTemperatureC) &&
    typeof value.raining === 'boolean' &&
    isFiniteNumber(value.weatherCode) &&
    (WEATHER_CODES as readonly number[]).includes(value.weatherCode) &&
    instant(value.observedAt) &&
    instant(value.fetchedAt) &&
    Date.parse(value.observedAt) <= Date.parse(value.fetchedAt) + 5 * 60_000
  );
}

export function isWeatherSettings(value: unknown): value is WeatherSettings {
  return (
    isRecord(value) &&
    (value.mode === 'manual' || value.mode === 'automatic') &&
    (value.location === undefined || isWeatherLocation(value.location)) &&
    (value.snapshot === undefined ||
      (isWeatherSnapshot(value.snapshot) &&
        isWeatherLocation(value.location) &&
        value.snapshot.locationId === value.location.id))
  );
}

export function createDefaultWeather(): WeatherSettings {
  return { mode: 'manual' };
}
