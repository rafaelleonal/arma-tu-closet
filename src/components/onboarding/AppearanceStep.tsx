import React from 'react';
import { Text, View } from 'react-native';
import { AppearanceSettings } from '../AppearanceSettings';
import { Button, useUI } from '../ui';
import type { OnboardingEntry, StepProps } from './types';

/** Last step. Only the first run offers the example closet; it never replaces an existing one. */
export function AppearanceStep({
  data,
  onChange,
  edit,
  onFinish,
}: StepProps & { edit: boolean; onFinish: (entry: OnboardingEntry) => void }) {
  const { s, palette } = useUI();
  return (
    <>
      <Text accessibilityRole="header" style={[s.title, { marginBottom: 24 }]}>
        Apariencia
      </Text>
      <AppearanceSettings
        compact
        value={data.appearance}
        onChange={(appearance) => onChange({ appearance })}
      />
      {edit ? (
        <View style={{ marginTop: 28 }}>
          <Button label="Listo" onPress={() => onFinish('keep')} />
        </View>
      ) : (
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              color: palette.ink,
              fontSize: 20,
              letterSpacing: -0.5,
              marginBottom: 10,
            }}
          >
            Clóset
          </Text>
          <Text style={[s.subtitle, { fontSize: 12, marginBottom: 17 }]}>
            El ejemplo contiene prendas ficticias.
          </Text>
          <Button label="Empezar con mi ropa" onPress={() => onFinish('own')} />
          <Button
            secondary
            label="Usar clóset de ejemplo"
            onPress={() => onFinish('demo')}
            style={{ marginTop: 10 }}
          />
        </View>
      )}
      <Text
        style={[
          s.subtitle,
          { fontSize: 10, textAlign: 'center', marginTop: 21 },
        ]}
      >
        Datos solo en este dispositivo.
      </Text>
    </>
  );
}
