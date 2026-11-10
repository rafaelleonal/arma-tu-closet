import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OCCASIONS, occasionLabels } from '../domain';
import type { LocalData } from '../storage/schema';
import type { Palette } from '../theme/ThemeProvider';
import type { WeatherSettings } from '../weather/types';
import { CityPicker, placeLabel } from './CityPicker';
import {
  ManualWeather,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
} from './context-editor/ManualWeather';
import { Segmented } from './Segmented';
import { Sheet } from './Sheet';
import { Button, Chip, FieldLabel, useUI } from './ui';

interface Props {
  value: LocalData['context'];
  weather: WeatherSettings;
  onSave: (context: LocalData['context'], weather: WeatherSettings) => void;
  onClose: () => void;
}

const MODES = [
  { id: 'automatic', label: 'Automático' },
  { id: 'manual', label: 'Manual' },
] as const;

/**
 * The occasion and the weather, in the order they change most. The manual city and the season
 * are no longer asked: no suggestion uses them, and their saved values are left as they are.
 */
export function ContextEditor({ value, weather, onSave, onClose }: Props) {
  const { palette } = useUI();
  const styles = createStyles(palette);
  const [draft, setDraft] = useState(value);
  const [settings, setSettings] = useState(weather);
  const [cityOpen, setCityOpen] = useState(!weather.location);
  const [backupOpen, setBackupOpen] = useState(false);
  const [error, setError] = useState('');
  const automatic = settings.mode === 'automatic';
  const manual = (
    <ManualWeather
      temperatureC={draft.temperatureC}
      raining={draft.raining}
      onTemperature={(delta) =>
        setDraft((current) => ({
          ...current,
          temperatureC: Math.max(
            MIN_TEMPERATURE,
            Math.min(MAX_TEMPERATURE, Math.round(current.temperatureC) + delta),
          ),
        }))
      }
      onRaining={(raining) => setDraft((current) => ({ ...current, raining }))}
    />
  );
  return (
    <Sheet
      title="Clima y ocasión"
      onClose={onClose}
      footer={
        <>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Button
            label="Aplicar"
            onPress={() => {
              if (automatic && !settings.location) {
                setCityOpen(true);
                setError('Elige una ciudad para el clima automático.');
                return;
              }
              onSave(draft, settings);
            }}
          />
        </>
      }
    >
      <FieldLabel>Ocasión</FieldLabel>
      <View style={styles.wrap}>
        {OCCASIONS.map((occasion) => (
          <Chip
            key={occasion}
            label={occasionLabels[occasion]}
            selected={draft.occasion === occasion}
            onPress={() => setDraft((current) => ({ ...current, occasion }))}
          />
        ))}
      </View>
      <FieldLabel>Clima</FieldLabel>
      <Segmented
        options={MODES}
        value={settings.mode}
        onChange={(mode) => {
          setSettings((current) => ({ ...current, mode }));
          setError('');
        }}
      />
      <View style={{ marginTop: 14 }}>
        {!automatic ? manual : null}
        {automatic && settings.location && !cityOpen ? (
          <View style={styles.city}>
            <Text numberOfLines={2} style={styles.cityName}>
              {placeLabel(settings.location)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cambiar de ciudad"
              onPress={() => setCityOpen(true)}
              style={styles.link}
            >
              <Text style={styles.linkText}>Cambiar</Text>
            </Pressable>
          </View>
        ) : null}
        {automatic && (cityOpen || !settings.location) ? (
          <CityPicker
            hideSelected
            value={settings.location}
            onSelect={(place) => {
              setSettings((current) => ({
                ...current,
                location: place,
                // A cached forecast only applies to the same city.
                snapshot:
                  current.location?.id === place.id
                    ? current.snapshot
                    : undefined,
              }));
              setCityOpen(false);
              setError('');
            }}
          />
        ) : null}
        {automatic && !backupOpen ? (
          <View style={styles.backup}>
            <Text style={styles.backupText}>
              Sin dato reciente se usa el clima manual:{' '}
              {Math.round(draft.temperatureC)}°,{' '}
              {draft.raining ? 'con lluvia' : 'sin lluvia'}.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cambiar el clima manual de respaldo"
              onPress={() => setBackupOpen(true)}
              style={styles.link}
            >
              <Text style={styles.linkText}>Cambiar</Text>
            </Pressable>
          </View>
        ) : null}
        {automatic && backupOpen ? (
          <View style={{ marginTop: 18 }}>
            <Text style={[styles.backupText, { marginBottom: 10 }]}>
              Clima manual, para cuando no hay dato reciente
            </Text>
            {manual}
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    error: { color: palette.rust, fontSize: 13, marginBottom: 10 },
    city: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 60,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.white,
    },
    cityName: { flex: 1, fontSize: 15, color: palette.ink },
    link: { minHeight: 44, justifyContent: 'center' },
    linkText: { fontSize: 13, fontWeight: '600', color: palette.rust },
    backup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 10,
    },
    backupText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: palette.muted,
    },
  });
