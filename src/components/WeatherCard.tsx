import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { occasionLabels, type Context } from '../domain';
import type { LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';
import { Button, useUI } from './ui';

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
  const automatic = weather.effective?.source === 'automatic';
  const degrees = Math.round(
    automatic ? data.weather.snapshot!.temperatureC : context.temperatureC,
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar clima y ocasión. ${degrees} grados${automatic ? '' : ', clima manual'}, ${occasionLabels[data.context.occasion]}`}
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
        {degrees}°{automatic ? '' : ' manual'} ·{' '}
        {occasionLabels[data.context.occasion]}
      </Text>
      <Text style={{ fontSize: 11, color: palette.muted }}>▾</Text>
    </Pressable>
  );
}

/** How fresh the automatic weather is and a way to refresh it; the manual one needs no status. */
export function WeatherStatus({
  data,
  context,
  weather,
}: {
  data: LocalData;
  context: Context;
  weather: Weather;
}) {
  const { palette, s } = useUI();
  const automatic = weather.effective?.source === 'automatic';
  const place = weather.effective?.context.city || data.context.city;
  return (
    <View style={styles.status}>
      <Text style={[s.subtitle, { fontSize: 11 }]}>
        {automatic
          ? `${place ? `${place} · ` : ''}Sensación ${Math.round(context.temperatureC)}° · ${context.raining ? 'Con precipitación' : 'Sin precipitación'} · Actualizado ${new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(data.weather.snapshot!.fetchedAt))}`
          : weather.loading
            ? 'Consultando clima. Por ahora se usa el manual.'
            : 'Sin clima reciente. Se usa el manual de respaldo.'}
      </Text>
      {weather.error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, fontSize: 12 }}
        >
          {weather.error}
        </Text>
      ) : null}
      <Button
        small
        secondary
        label={weather.loading ? 'Actualizando…' : 'Actualizar clima'}
        disabled={weather.loading}
        onPress={weather.refresh}
        style={{ alignSelf: 'flex-start' }}
      />
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
  status: { marginTop: 22, gap: 8 },
});
