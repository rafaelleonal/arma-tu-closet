import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { occasionLabels, type Context } from '../domain';
import type { LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';
import { Button, useUI } from './ui';

type Weather = ReturnType<typeof useWeather>;

/** Today's weather and occasion. Manual weather is always labeled as manual. */
export function WeatherCard({
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
  const { palette, s } = useUI();
  const automatic = weather.effective?.source === 'automatic';
  return (
    <View style={[styles.card, { backgroundColor: palette.sand }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Editar clima y ocasión"
        onPress={onEdit}
        style={styles.summary}
      >
        <View style={[s.row, { flexShrink: 1 }]}>
          <Text style={{ fontSize: 31, color: palette.ink }}>
            {context.raining ? '☂' : '☼'}
          </Text>
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontSize: 19, color: palette.ink }}>
              {Math.round(
                automatic
                  ? data.weather.snapshot!.temperatureC
                  : context.temperatureC,
              )}
              °{' '}
              <Text style={{ fontSize: 13 }}>
                {weather.effective?.context.city || data.context.city}
              </Text>
            </Text>
            <Text style={[s.subtitle, { fontSize: 11 }]}>
              {automatic
                ? `Sensación ${Math.round(context.temperatureC)}° · ${context.raining ? 'Con precipitación' : 'Sin precipitación'}`
                : `Clima manual · ${data.context.season}`}
            </Text>
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 13, color: palette.ink }}>
            {occasionLabels[data.context.occasion]}
          </Text>
          <Text style={{ fontSize: 11, color: palette.rust, marginTop: 5 }}>
            Cambiar ↗
          </Text>
        </View>
      </Pressable>
      {data.weather.mode === 'automatic' ? (
        <AutomaticWeatherStatus data={data} weather={weather} />
      ) : null}
    </View>
  );
}

function AutomaticWeatherStatus({
  data,
  weather,
}: {
  data: LocalData;
  weather: Weather;
}) {
  const { palette, s } = useUI();
  return (
    <View style={{ marginTop: 12, gap: 8 }}>
      <Text style={[s.subtitle, { fontSize: 11 }]}>
        {weather.effective?.source === 'automatic'
          ? `Actualizado ${new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(data.weather.snapshot!.fetchedAt))}`
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
      <View
        style={[s.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}
      >
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL('https://open-meteo.com/')}
          style={{ paddingVertical: 10 }}
        >
          <Text
            style={{
              color: palette.green,
              fontSize: 11,
              textDecorationLine: 'underline',
            }}
          >
            Open-Meteo
          </Text>
        </Pressable>
        <Button
          small
          secondary
          label={weather.loading ? 'Actualizando…' : 'Actualizar clima'}
          disabled={weather.loading}
          onPress={weather.refresh}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    marginTop: 16,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
});
