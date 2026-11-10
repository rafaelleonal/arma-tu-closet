import React from 'react';
import { Text, View } from 'react-native';
import { OCCASIONS, occasionLabels } from '../../domain';
import { ThemeRow } from '../AppearanceSettings';
import { Button, Chip, FieldLabel, useUI } from '../ui';
import { FirstOutfitPreview } from './FirstOutfitPreview';
import { Guide } from './Guide';
import type { OnboardingEntry, StepProps } from './types';

const PILL = { minHeight: 52, borderRadius: 26 };

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
      <Guide
        kind="sneakers"
        say="Soy Teni, los tenis. Con lo que me contaste armé esto."
        title="Tu primer outfit"
      />
      <FirstOutfitPreview data={data} />
      <FieldLabel>¿Para qué te vistes casi siempre?</FieldLabel>
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
      <FieldLabel>Tema</FieldLabel>
      <ThemeRow
        bleed={24}
        value={data.appearance}
        onChange={(appearance) => onChange({ appearance })}
      />
      {edit ? (
        <View style={{ marginTop: 28 }}>
          <Button
            label="¡Listo!"
            onPress={() => onFinish('keep')}
            style={PILL}
          />
        </View>
      ) : (
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              color: palette.ink,
              fontSize: 20,
              letterSpacing: -0.5,
              marginBottom: 16,
            }}
          >
            ¿Con qué ropa empezamos?
          </Text>
          <Button
            label="Vamos con mi ropa"
            onPress={() => onFinish('own')}
            style={PILL}
          />
          <Button
            secondary
            label="Ver el clóset de ejemplo"
            onPress={() => onFinish('demo')}
            style={{ ...PILL, marginTop: 10 }}
          />
        </View>
      )}
    </>
  );
}
