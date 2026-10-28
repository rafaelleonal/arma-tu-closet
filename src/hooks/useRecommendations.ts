import { useMemo, useState } from 'react';
import { generateRecommendations, type Context } from '../domain';
import { createLocalData, type LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';

type Weather = ReturnType<typeof useWeather>;

/** Builds today's context and the top three outfits that were not dismissed. */
export function useRecommendations(data: LocalData | null, weather: Weather) {
  const [generation, setGeneration] = useState(0);
  const context = useMemo<Context>(
    () => ({
      ...(weather.effective?.context ||
        data?.context ||
        createLocalData().context),
      ...(data?.preferences || createLocalData().preferences),
      styleIds: data?.profile.styleIds ?? [],
      now: new Date().toISOString(),
    }),
    // weather.effective is rebuilt on every render: data.weather and its source capture the
    // changes that matter, and items/generation take a new `now` for rotation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data?.context,
      data?.weather,
      weather.effective?.source,
      data?.preferences,
      data?.profile.styleIds,
      data?.items,
      generation,
    ],
  );
  const result = useMemo(
    () => generateRecommendations(data?.items || [], context, { limit: 10 }),
    [data?.items, context],
  );
  const recommendations = result.outfits
    .filter((outfit) => !data?.dislikedOutfitIds.includes(outfit.id))
    .slice(0, 3);
  return {
    context,
    result,
    recommendations,
    regenerate: () => setGeneration((value) => value + 1),
  };
}
