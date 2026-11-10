import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLOR_OPTIONS, colorLabels } from '../domain';
import { useFeedback } from './Feedback';
import { Segmented } from './Segmented';
import { colorHex, useUI } from './ui';

export type ColorMode = 'favorite' | 'avoid';
export interface ColorChoices {
  preferredColors: string[];
  excludedColors: string[];
}

const DARK_SWATCHES = ['negro', 'azul', 'cafe', 'rojo', 'morado'];

/** A color is either preferred or avoided; choosing it in one group removes it from the other. */
export function ColorPicker({
  value,
  onChange,
  mode,
  onMode,
}: {
  value: ColorChoices;
  onChange: (next: ColorChoices) => void;
  mode: ColorMode;
  onMode: (mode: ColorMode) => void;
}) {
  const { s } = useUI();
  const feedback = useFeedback();
  const { preferredColors, excludedColors } = value;
  const current = mode === 'favorite' ? preferredColors : excludedColors;
  const other = mode === 'favorite' ? excludedColors : preferredColors;
  function select(color: string) {
    feedback.selection();
    const next = current.includes(color)
      ? current.filter((item) => item !== color)
      : [...current, color];
    const rest = other.filter((item) => item !== color);
    onChange({
      preferredColors: mode === 'favorite' ? next : rest,
      excludedColors: mode === 'avoid' ? next : rest,
    });
  }
  const modes = [
    { id: 'favorite', label: 'Me gustan', count: preferredColors.length },
    { id: 'avoid', label: 'Prefiero evitar', count: excludedColors.length },
  ] as const;
  return (
    <>
      <View style={{ marginBottom: 22 }}>
        <Segmented
          options={modes.map((option) => ({
            id: option.id,
            label: `${option.label} · ${option.count}`,
          }))}
          value={mode}
          onChange={onMode}
        />
      </View>
      <Text style={[s.subtitle, { fontSize: 12, marginBottom: 20 }]}>
        {mode === 'favorite'
          ? 'Los uso primero en tus outfits.'
          : 'No te propongo prendas con estos colores.'}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {COLOR_OPTIONS.map((color) => (
          <ColorTile
            key={color}
            color={color}
            mode={mode}
            selected={current.includes(color)}
            inOther={other.includes(color)}
            onPress={() => select(color)}
          />
        ))}
      </View>
      <Text style={[s.subtitle, { marginTop: 19, fontSize: 11 }]}>
        Elegir un color lo quita del otro grupo.
      </Text>
    </>
  );
}

function ColorTile({
  color,
  mode,
  selected,
  inOther,
  onPress,
}: {
  color: string;
  mode: ColorMode;
  selected: boolean;
  inOther: boolean;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const otherLabel = mode === 'favorite' ? 'evitado' : 'favorito';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${colorLabels[color]}${selected ? ', seleccionado' : ''}${inOther ? `, actualmente ${otherLabel}` : ''}`}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={{
        flexBasis: 83,
        flexGrow: 1,
        borderRadius: 14,
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: selected ? palette.sand : palette.white,
        borderWidth: 1,
        borderColor: selected ? palette.ink : palette.line,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colorHex[color],
          borderWidth: 1,
          borderColor: palette.swatchBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <Text
            style={{
              color: DARK_SWATCHES.includes(color) ? '#FFFFFF' : '#242923',
              fontSize: 17,
            }}
          >
            {mode === 'favorite' ? '✓' : '−'}
          </Text>
        ) : null}
      </View>
      <Text style={{ color: palette.ink, fontSize: 11, marginTop: 9 }}>
        {colorLabels[color]}
      </Text>
      {inOther ? (
        <Text style={{ fontSize: 8, marginTop: 3, color: palette.muted }}>
          {mode === 'favorite' ? 'Lo evitas' : 'Te gusta'}
        </Text>
      ) : null}
    </Pressable>
  );
}
