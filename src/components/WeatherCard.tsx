import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Context } from '../domain';
import type { LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';
import { useUI } from './ui';
import { useCopy } from '../i18n';

type Weather = ReturnType<typeof useWeather>;

/** Today's weather and occasion in one line. Manual weather is always labeled as manual. */
export function WeatherPill({
  data,
  context,
  weather,
  onEdit,
}: {
  data: LocalData;
  context: Context;
  weather: Weather;
  onEdit: () => void;
}) {
  const { palette } = useUI();
  const t = useCopy();
  const automatic = weather.effective?.source === 'automatic';
  const occasion = t.occasions[data.context.occasion];
  const degrees = Math.round(
    automatic ? data.weather.snapshot!.temperatureC : context.temperatureC,
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.weather.pillLabel(degrees, automatic, occasion)}
      onPress={onEdit}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: palette.white, borderColor: palette.line },
        pressed && { opacity: 0.72 },
      ]}
    >
      <Text style={{ fontSize: 17, color: palette.rust }}>
        {context.raining ? '☂' : '☼'}
      </Text>
      <Text style={{ fontSize: 13, color: palette.ink }}>
        {degrees}°{automatic ? '' : ` ${t.weather.manualShort}`} · {occasion}
      </Text>
      <Text style={{ fontSize: 11, color: palette.muted }}>▾</Text>
    </Pressable>
  );
}

/**
 * Shown only while automatic weather has no recent data: says the manual one is in use and lets
 * the person ask again. With recent data the pill already says everything.
 */
export function WeatherNotice({ weather }: { weather: Weather }) {
  const { palette } = useUI();
  const t = useCopy();
  if (weather.effective?.source === 'automatic') return null;
  const failed = !weather.loading && !!weather.error;
  return (
    <View style={styles.notice}>
      <Text
        accessibilityRole={failed ? 'alert' : undefined}
        style={{
          flex: 1,
          fontSize: 12,
          lineHeight: 18,
          color: failed ? palette.rust : palette.muted,
        }}
      >
        {weather.loading
          ? t.weather.loading
          : t.weather.usingManual(
              weather.error ? t.weather.errors[weather.error] : '',
            )}
      </Text>
      {weather.loading ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.weather.refreshLabel}
          onPress={weather.refresh}
          style={styles.link}
        >
          <Text
            style={{ fontSize: 13, fontWeight: '600', color: palette.rust }}
          >
            {t.weather.refresh}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  link: { minHeight: 44, justifyContent: 'center' },
});
