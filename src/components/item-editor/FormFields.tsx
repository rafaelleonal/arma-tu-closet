import React from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import {
  CATEGORIES,
  categoryLabels,
  COLOR_OPTIONS,
  colorLabels,
  type Category,
} from '../../domain';
import { suggestedItemName } from '../itemForm';
import { Button, Chip, colorHex, FieldLabel, useUI } from '../ui';

export function DiscardPrompt({
  onKeep,
  onDiscard,
}: {
  onKeep: () => void;
  onDiscard: () => void;
}) {
  const { palette, s } = useUI();
  return (
    <View style={[s.panel, { marginTop: 16 }]}>
      <Text
        accessibilityRole="alert"
        style={{ color: palette.ink, fontSize: 18, marginBottom: 16 }}
      >
        ¿Descartar cambios?
      </Text>
      <Button label="Seguir editando" onPress={onKeep} />
      <Button
        secondary
        label="Descartar cambios"
        onPress={onDiscard}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

export function CategoryField({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  const { s } = useUI();
  return (
    <>
      <FieldLabel>Categoría</FieldLabel>
      <View style={s.wrap}>
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={categoryLabels[category]}
            selected={value === category}
            onPress={() => onChange(category)}
          />
        ))}
      </View>
    </>
  );
}

export function ColorsField({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (colors: string[]) => void;
  error?: string;
}) {
  const { palette, s } = useUI();
  return (
    <>
      <FieldLabel>Colores</FieldLabel>
      <Text style={[s.subtitle, { fontSize: 11, marginBottom: 12 }]}>
        Incluye los detalles de color. Elige al menos uno.
      </Text>
      <View style={s.wrap}>
        {COLOR_OPTIONS.map((color) => (
          <Chip
            key={color}
            swatch={colorHex[color]}
            label={colorLabels[color]}
            selected={value.includes(color)}
            onPress={() =>
              onChange(
                value.includes(color)
                  ? value.filter((item) => item !== color)
                  : [...value, color],
              )
            }
          />
        ))}
      </View>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, marginTop: 8, fontSize: 12 }}
        >
          {error}
        </Text>
      ) : null}
    </>
  );
}

/** An empty name saves the suggested one; the placeholder and hint show it beforehand. */
export function NameField({
  value,
  onChange,
  category,
  colors,
}: {
  value: string;
  onChange: (value: string) => void;
  category: Category;
  colors: string[];
}) {
  const { palette, s } = useUI();
  const suggested = suggestedItemName(category, colors);
  const typed = !!value.trim();
  return (
    <>
      <FieldLabel>Nombre · opcional</FieldLabel>
      <TextInput
        accessibilityLabel="Nombre de la prenda, opcional"
        accessibilityHint={
          typed || !colors.length
            ? undefined
            : `Si lo dejas vacío se llamará ${suggested}`
        }
        placeholderTextColor={palette.muted}
        placeholder={typed ? undefined : suggested || 'Ej. Camisa de lino'}
        value={value}
        maxLength={60}
        onChangeText={onChange}
        style={s.input}
      />
    </>
  );
}

export function AvailabilityField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { palette, s } = useUI();
  return (
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 22 }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.ink }}>Disponible para usar</Text>
        <Text style={[s.subtitle, { fontSize: 12 }]}>
          Desactívala si está en la lavandería.
        </Text>
      </View>
      <Switch
        accessibilityLabel="Disponible para usar"
        value={value}
        onValueChange={onChange}
        trackColor={{ true: palette.green }}
      />
    </View>
  );
}
