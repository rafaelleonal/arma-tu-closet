import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  EMPTY_STYLE_GOAL,
  COLOR_TONE_INFO,
  suggestedColors,
  type StyleGoal,
} from '../../domain';
import { colorName, useCopy } from '../../i18n';
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
  const t = useCopy();
  const copy = t.styleGoal;
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
      <Sheet title={copy.colorTest} onClose={() => setTesting(false)}>
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
    <Sheet title={copy.title} onClose={onClose}>
      <FieldLabel>{copy.wantMore}</FieldLabel>
      <StylePicker
        value={goal.targetStyleIds}
        onChange={(targetStyleIds) => change({ targetStyleIds })}
        mark="✦"
        prefix={t.styleBoard.goal}
      />
      <FieldLabel>{copy.toneTitle}</FieldLabel>
      {tone ? (
        <>
          <Text style={[s.sectionTitle, { marginBottom: 12 }]}>
            {goal.colorTone ? t.tones[goal.colorTone].label : ''}
          </Text>
          <ToneSwatches colors={tone.palette} />
        </>
      ) : (
        <Text style={[s.subtitle, { fontSize: 12 }]}>{copy.testHint}</Text>
      )}
      <Button
        secondary
        label={tone ? copy.repeatTest : copy.takeTest}
        style={{ marginTop: 14 }}
        onPress={() => setTesting(true)}
      />
      {tone ? (
        <Button
          secondary
          small
          label={copy.removeResult}
          style={{ marginTop: 8 }}
          onPress={() => change({ colorTone: undefined })}
        />
      ) : null}
      {suggested.length ? (
        <>
          <FieldLabel>{copy.yourColors}</FieldLabel>
          <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
            {copy.yourColorsHint}
          </Text>
          <View style={s.wrap}>
            {suggested.map((color) => (
              <Chip
                key={color}
                label={colorName(t, color)}
                swatch={colorHex[color]}
                selected={colors.includes(color)}
                onPress={() => setColors(toggled(colors, color))}
              />
            ))}
          </View>
        </>
      ) : null}
      <Button
        label={t.common.save}
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
