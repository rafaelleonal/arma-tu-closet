import { Platform } from 'react-native';
import * as Location from 'expo-location';
import {
  nearestLocation,
  placeSearchTerms,
  searchLocations,
  WeatherRequestError,
  type WeatherRequestErrorCode,
} from './openMeteo';
import type { WeatherLocation } from './types';

export type DeviceCityFailure =
  'services-off' | 'position' | 'not-found' | WeatherRequestErrorCode;
export type DeviceCityResult =
  | { status: 'found'; location: WeatherLocation }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'failed'; reason: DeviceCityFailure };

// Reverse geocoding is only available on iOS and Android; web keeps the search by name.
export const deviceLocationSupported =
  Platform.OS === 'ios' || Platform.OS === 'android';
const POSITION_TIMEOUT_MS = 10_000;

/**
 * Asks for foreground location only after an explicit action. The device position is used once to
 * name the city; only the matched Open-Meteo city (its own coordinates) is returned and stored.
 */
export async function findDeviceCity(
  signal?: AbortSignal,
  language?: string,
): Promise<DeviceCityResult> {
  let permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted && permission.canAskAgain)
    permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted)
    return { status: 'denied', canAskAgain: permission.canAskAgain };
  if (!(await Location.hasServicesEnabledAsync()))
    return { status: 'failed', reason: 'services-off' };
  let coords: { latitude: number; longitude: number };
  let names: string[];
  try {
    // A fresh low-accuracy fix first: a cached one may belong to a city the person already left.
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      POSITION_TIMEOUT_MS,
    ).catch(() => Location.getLastKnownPositionAsync({ maxAge: 30 * 60_000 }));
    if (!position) throw new Error('position unavailable');
    coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const [address] = await Location.reverseGeocodeAsync(coords);
    names = placeSearchTerms([
      address?.city,
      address?.subregion,
      address?.district,
    ]);
  } catch {
    return { status: 'failed', reason: 'position' };
  }
  for (const name of names) {
    try {
      const match = nearestLocation(
        await searchLocations(name, signal, language),
        coords.latitude,
        coords.longitude,
      );
      if (match) return { status: 'found', location: match };
    } catch (cause) {
      if (cause instanceof WeatherRequestError && cause.code !== 'invalid')
        return { status: 'failed', reason: cause.code };
    }
  }
  return { status: 'failed', reason: 'not-found' };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}
