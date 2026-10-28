import React from 'react';
import { Text, View } from 'react-native';
import { OCCASIONS, occasionLabels } from '../../domain';
import { CityPicker } from '../CityPicker';
import { Chip, FieldLabel, useUI } from '../ui';
import type { StepProps } from './types';

export function RoutineStep({ data, onChange }: StepProps) {
  const { s, palette } = useUI();
  const panelTitle = {
    color: palette.ink,
    fontSize: 19,
    letterSpacing: -0.4,
    marginBottom: 10,
  };
  return (
    <>
      <Text accessibilityRole="header" style={s.title}>
        Tu rutina
      </Text>
      <FieldLabel>Ocasión habitual</FieldLabel>
      <View style={s.wrap}>
        {OCCASIONS.map((occasion) => (
          <Chip
            key={occasion}
            label={occasionLabels[occasion]}
            selected={data.context.occasion === occasion}
            onPress={() => onChange({ context: { ...data.context, occasion } })}
          />
        ))}
      </View>
      <View style={[s.panel, { marginTop: 30 }]}>
        <Text style={panelTitle}>Rotación</Text>
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 20 }]}>
          Preferimos no repetir durante este periodo. Puede repetirse si faltan
          alternativas.
        </Text>
        <View style={s.wrap}>
          {[0, 3, 7, 14].map((days) => (
            <Chip
              key={days}
              label={days ? `${days} días` : 'Sin rotación'}
              selected={data.preferences.rotationDays === days}
              onPress={() =>
                onChange({
                  preferences: { ...data.preferences, rotationDays: days },
                })
              }
            />
          ))}
        </View>
      </View>
      <View style={[s.panel, { marginTop: 22 }]}>
        <Text style={panelTitle}>Clima · opcional</Text>
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 18 }]}>
          Con tu ciudad ajustamos el abrigo al clima actual. Puedes cambiarlo en
          Hoy.
        </Text>
        <CityPicker
          value={
            data.weather.mode === 'automatic'
              ? data.weather.location
              : undefined
          }
          onSelect={(place) =>
            onChange({
              weather: {
                mode: 'automatic',
                location: place,
                // A cached forecast only applies to the same city.
                snapshot:
                  data.weather.location?.id === place.id
                    ? data.weather.snapshot
                    : undefined,
              },
            })
          }
        />
      </View>
    </>
  );
}
