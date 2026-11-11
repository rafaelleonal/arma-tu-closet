import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  EMPTY_STYLE_GOAL,
  COLOR_TONE_INFO,
  colorLabels,
  suggestedColors,
  type StyleGoal,
} from '../../domain';
import type { LocalData } from '../../storage/local';
import { ColorTest, ToneSwatches } from '../colorimetry/ColorTest';
import { Sheet } from '../Sheet';
import { StylePicker } from '../style/StylePicker';
import { Button, Chip, colorHex, FieldLabel, useUI } from '../ui';

export interface StyleGoalResult {
  goal: StyleGoal;
  colors: string[];
}

function toggled<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function StyleGoalSheet({
  data,
  onClose,
  onSave,
}: {
  data: LocalData;
  onClose: () => void;
  onSave: (result: StyleGoalResult) => void;
}) {
  const { s } = useUI();
  const [goal, setGoal] = useState<StyleGoal>(
    data.styleGoal ?? EMPTY_STYLE_GOAL,
  );
  const [colors, setColors] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const change = (next: Partial<StyleGoal>) =>
    setGoal((current) => ({ ...current, ...next }));
  const suggested = suggestedColors(
    goal,
    data.preferences.excludedColors,
  ).filter((color) => !data.preferences.preferredColors.includes(color));
  const tone = goal.colorTone && COLOR_TONE_INFO[goal.colorTone];
  if (testing)
    return (
      <Sheet title="Colorimetría" onClose={() => setTesting(false)}>
        <ColorTest
          onDone={(colorTone) => {
            change({ colorTone });
            setColors([]);
            setTesting(false);
          }}
        />
      </Sheet>
    );
  return (
    <Sheet title="Cambiar mi estilo" onClose={onClose}>
      <FieldLabel>Me gustaría verme más…</FieldLabel>
      <StylePicker
        value={goal.targetStyleIds}
        onChange={(targetStyleIds) => change({ targetStyleIds })}
        mark="✦"
        prefix="Quiero probar"
      />
      <FieldLabel>Tu colorimetría · opcional</FieldLabel>
      {tone ? (
        <>
          <Text style={[s.sectionTitle, { marginBottom: 12 }]}>
            {tone.label}
          </Text>
          <ToneSwatches colors={tone.palette} />
        </>
      ) : (
        <Text style={[s.subtitle, { fontSize: 12 }]}>
          Compara colores junto a tu cara. Tu foto no sale del teléfono.
        </Text>
      )}
      <Button
        secondary
        label={tone ? 'Repetir la prueba' : 'Hacer la prueba'}
        style={{ marginTop: 14 }}
        onPress={() => setTesting(true)}
      />
      {tone ? (
        <Button
          secondary
          small
          label="Quitar resultado"
          style={{ marginTop: 8 }}
          onPress={() => change({ colorTone: undefined })}
        />
      ) : null}
      {suggested.length ? (
        <>
          <FieldLabel>Tus colores</FieldLabel>
          <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
            Los que elijas se suman a tus favoritos.
          </Text>
          <View style={s.wrap}>
            {suggested.map((color) => (
              <Chip
                key={color}
                label={colorLabels[color]}
                swatch={colorHex[color]}
                selected={colors.includes(color)}
                onPress={() => setColors(toggled(colors, color))}
              />
            ))}
          </View>
        </>
      ) : null}
      <Button
        label="Guardar"
        style={{ marginTop: 24 }}
        onPress={() =>
          onSave({
            goal: {
              ...goal,
              exploring: goal.exploring && goal.targetStyleIds.length > 0,
            },
            colors: colors.filter((color) => suggested.includes(color)),
          })
        }
      />
    </Sheet>
  );
}
