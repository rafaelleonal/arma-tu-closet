import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  EMPTY_STYLE_GOAL,
  SKIN_DEPTHS,
  SKIN_DEPTH_LABELS,
  STYLE_OPTIONS,
  UNDERTONES,
  UNDERTONE_LABELS,
  colorLabels,
  suggestedColors,
  type StyleGoal,
  type StyleId,
} from '../../domain';
import type { LocalData } from '../../storage/local';
import { Sheet } from '../Sheet';
import { Button, Chip, colorHex, FieldLabel, useUI } from '../ui';
import { PersonPhotoSection } from './PersonPhotoSection';
import { usePersonPhoto } from './usePersonPhoto';

export interface StyleGoalResult {
  goal: StyleGoal;
  styleIds: StyleId[];
  colors: string[];
}

const SKIN_SWATCHES = {
  light: '#F1D3BC',
  medium: '#C68E62',
  deep: '#6B4226',
} as const;

function toggled<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function StyleChips({
  value,
  onChange,
}: {
  value: StyleId[];
  onChange: (next: StyleId[]) => void;
}) {
  const { s } = useUI();
  return (
    <View style={s.wrap}>
      {STYLE_OPTIONS.map((style) => (
        <Chip
          key={style.id}
          label={style.label}
          selected={value.includes(style.id)}
          onPress={() => onChange(toggled(value, style.id))}
        />
      ))}
    </View>
  );
}

function ToneFields({
  goal,
  onChange,
}: {
  goal: StyleGoal;
  onChange: (change: Partial<StyleGoal>) => void;
}) {
  const { s } = useUI();
  return (
    <>
      <FieldLabel>Tono de piel · opcional</FieldLabel>
      <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
        Se guarda solo en este dispositivo. Toca de nuevo para quitarlo.
      </Text>
      <View style={s.wrap}>
        {SKIN_DEPTHS.map((depth) => (
          <Chip
            key={depth}
            label={SKIN_DEPTH_LABELS[depth]}
            swatch={SKIN_SWATCHES[depth]}
            selected={goal.skinDepth === depth}
            onPress={() =>
              onChange({
                skinDepth: goal.skinDepth === depth ? undefined : depth,
              })
            }
          />
        ))}
      </View>
      <FieldLabel>Subtono · opcional</FieldLabel>
      <View style={s.wrap}>
        {UNDERTONES.map((undertone) => (
          <Chip
            key={undertone}
            label={UNDERTONE_LABELS[undertone]}
            selected={goal.undertone === undertone}
            onPress={() =>
              onChange({
                undertone: goal.undertone === undertone ? undefined : undertone,
              })
            }
          />
        ))}
      </View>
    </>
  );
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
  const [styleIds, setStyleIds] = useState(data.profile.styleIds);
  const [goal, setGoal] = useState<StyleGoal>(
    data.styleGoal ?? EMPTY_STYLE_GOAL,
  );
  const [colors, setColors] = useState<string[]>([]);
  const photo = usePersonPhoto();
  const change = (next: Partial<StyleGoal>) =>
    setGoal((current) => ({ ...current, ...next }));
  const suggested = suggestedColors(
    goal,
    data.preferences.excludedColors,
  ).filter((color) => !data.preferences.preferredColors.includes(color));
  return (
    <Sheet title="Cambiar mi estilo" onClose={onClose}>
      <FieldLabel>Hoy me visto más…</FieldLabel>
      <StyleChips value={styleIds} onChange={setStyleIds} />
      <FieldLabel>Me gustaría verme más…</FieldLabel>
      <StyleChips
        value={goal.targetStyleIds}
        onChange={(targetStyleIds) => change({ targetStyleIds })}
      />
      <PersonPhotoSection
        photo={photo}
        onApply={(suggestion) => {
          change({
            skinDepth: suggestion.skinDepth ?? goal.skinDepth,
            undertone: suggestion.undertone ?? goal.undertone,
          });
          if (suggestion.styleIds.length) setStyleIds(suggestion.styleIds);
        }}
      />
      <ToneFields goal={goal} onChange={change} />
      {suggested.length ? (
        <>
          <FieldLabel>Colores para animarte</FieldLabel>
          <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
            Un punto de partida. Los que elijas se suman a tus favoritos.
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
            styleIds,
            colors: colors.filter((color) => suggested.includes(color)),
          })
        }
      />
    </Sheet>
  );
}
