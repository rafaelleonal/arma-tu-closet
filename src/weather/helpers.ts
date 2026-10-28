import { isWeatherSettings, type WeatherSettings } from './types';

export const WEATHER_REFRESH_MS = 30 * 60_000;
export const WEATHER_MAX_AGE_MS = 3 * 60 * 60_000;
export type WeatherFreshness = 'missing' | 'fresh' | 'refresh' | 'expired';

/** Both fetch age and model observation age matter; fetching old data cannot renew it. */
export function getWeatherFreshness(settings: WeatherSettings, now: string): WeatherFreshness {
  if (!isWeatherSettings(settings) || !settings.location || !settings.snapshot) return 'missing';
  const time = Date.parse(now);
  const fetchAge = time - Date.parse(settings.snapshot.fetchedAt);
  const observationAge = time - Date.parse(settings.snapshot.observedAt);
  if (
    !Number.isFinite(time) ||
    fetchAge < 0 ||
    observationAge < -5 * 60_000 ||
    Math.max(fetchAge, observationAge) >= WEATHER_MAX_AGE_MS
  )
    return 'expired';
  return fetchAge >= WEATHER_REFRESH_MS ? 'refresh' : 'fresh';
}

export function shouldRefreshWeather(settings: WeatherSettings, now: string): boolean {
  return (
    settings.mode === 'automatic' &&
    !!settings.location &&
    getWeatherFreshness(settings, now) !== 'fresh'
  );
}

/** Derives a copy; stored manual controls remain unchanged when switching modes. */
export function getEffectiveWeatherContext<
  T extends { temperatureC: number; raining: boolean; city?: string },
>(
  manual: T,
  settings: WeatherSettings,
  now: string,
): { context: T; source: 'manual' | 'automatic'; freshness: WeatherFreshness } {
  const freshness = getWeatherFreshness(settings, now);
  if (
    settings.mode !== 'automatic' ||
    !settings.location ||
    !settings.snapshot ||
    (freshness !== 'fresh' && freshness !== 'refresh')
  ) {
    return { context: { ...manual }, source: 'manual', freshness };
  }
  return {
    context: {
      ...manual,
      temperatureC: settings.snapshot.apparentTemperatureC,
      raining: settings.snapshot.raining,
      city: settings.location.name,
    },
    source: 'automatic',
    freshness,
  };
}
