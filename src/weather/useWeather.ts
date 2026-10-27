import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { LocalData } from '../storage/schema';
import { fetchWeather } from './openMeteo';
import { getEffectiveWeatherContext, shouldRefreshWeather } from './helpers';

export function useWeather(data: LocalData | null, setData: React.Dispatch<React.SetStateAction<LocalData | null>>) {
  const latest = useRef(data);
  latest.current = data;
  const request = useRef<AbortController | null>(null);
  const lastAttempt = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date().toISOString());

  const refresh = useCallback(async (force = false) => {
    const settings = latest.current?.weather;
    const location = settings?.location;
    const currentTime = new Date().toISOString();
    setNow(currentTime);
    if (!latest.current?.onboarded || settings?.mode !== 'automatic' || !location || request.current) return;
    if (!force && (!shouldRefreshWeather(settings, currentTime) || Date.now() - lastAttempt.current < 300_000)) return;
    const controller = new AbortController();
    request.current = controller;
    lastAttempt.current = Date.now();
    setLoading(true);
    setError('');
    try {
      const snapshot = await fetchWeather(location, controller.signal);
      if (controller.signal.aborted) return;
      setData(current => current?.weather.mode === 'automatic' && current.weather.location?.id === location.id
        ? { ...current, weather: { ...current.weather, snapshot }, dislikedOutfitIds: [] } : current);
      setNow(new Date().toISOString());
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No pudimos actualizar el clima.');
    } finally {
      if (request.current === controller) { request.current = null; setLoading(false); }
    }
  }, [setData]);

  useEffect(() => {
    request.current?.abort();
    request.current = null;
    lastAttempt.current = 0;
    setLoading(false);
    setError('');
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => { clearInterval(timer); listener.remove(); request.current?.abort(); request.current = null; };
  }, [data?.onboarded, data?.weather.mode, data?.weather.location?.id, refresh]);

  const effective = data ? getEffectiveWeatherContext(data.context, data.weather, now) : null;
  return { effective, loading, error, refresh: () => void refresh(true) };
}
