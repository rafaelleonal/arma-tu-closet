import React from 'react';
import { Linking, Text, View } from 'react-native';
import type { LocalData } from '../storage/local';
import type { UpdateData } from '../hooks/useLocalData';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { Sheet, SHEET_BLEED } from '../components/Sheet';
import { Button, Chip, FieldLabel, useUI } from '../components/ui';

const ROTATION_DAYS = [0, 3, 7, 14];

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

/** How the app looks and behaves, apart from the person's style: opened from Mi estilo. */
export function SettingsSheet({
  data,
  update,
  onPersonalize,
  onClose,
}: {
  data: LocalData;
  update: UpdateData;
  /** Goes through the four steps again; garments, photos, saved outfits and history stay. */
  onPersonalize: () => void;
  onClose: () => void;
}) {
  const { palette, s } = useUI();
  const note = [s.subtitle, { fontSize: 12, lineHeight: 19 }];
  return (
    <Sheet title="Ajustes" onClose={onClose}>
      <FieldLabel>Tema</FieldLabel>
      <AppearanceSettings
        bleed={SHEET_BLEED}
        value={data.appearance}
        onChange={(appearance) =>
          update((current) => ({ ...current, appearance }))
        }
      />
      <FieldLabel>Esperar para repetir una prenda</FieldLabel>
      <View style={s.wrap}>
        {ROTATION_DAYS.map((days) => (
          <Chip
            key={days}
            label={days ? `${days} días` : 'Nada'}
            selected={data.preferences.rotationDays === days}
            onPress={() =>
              update((current) => ({
                ...current,
                preferences: { ...current.preferences, rotationDays: days },
              }))
            }
          />
        ))}
      </View>
      <Button
        secondary
        small
        label="Volver a personalizar"
        onPress={onPersonalize}
        style={{ marginTop: 28, alignSelf: 'flex-start' }}
      />
      <View
        style={[
          s.panel,
          { marginTop: 24, backgroundColor: palette.wash, gap: 8 },
        ]}
      >
        <Text style={{ color: palette.ink, fontSize: 13, fontWeight: '600' }}>
          Tus datos
        </Text>
        <Text style={note}>
          Tu ropa y tus fotos se guardan solo en este dispositivo, sin copia en
          la nube. Si borras la app, se pierden. Solo Analizar foto envía la
          foto de una prenda a OpenAI.
        </Text>
        <Text style={note}>
          {plural(
            data.items.filter((item) => !item.isDemo).length,
            'prenda propia',
            'prendas propias',
          )}{' '}
          ·{' '}
          {plural(
            data.wearHistory.length,
            'uso registrado',
            'usos registrados',
          )}
        </Text>
        {/* The weather data's license asks for credit; this is the one place that gives it. */}
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL('https://open-meteo.com/')}
          style={[note, { textDecorationLine: 'underline' }]}
        >
          Clima automático: datos de Open-Meteo
        </Text>
      </View>
    </Sheet>
  );
}
