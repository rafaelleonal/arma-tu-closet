import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { Category } from '../../domain';
import { suggestedItemName } from '../itemForm';
import { Button, FieldLabel, useUI } from '../ui';
import { Toggle } from '../Toggle';

/** Takes the place of the save button, so the question is in view wherever the form was. */
export function DiscardPrompt({
  onKeep,
  onDiscard,
}: {
  onKeep: () => void;
  onDiscard: () => void;
}) {
  const { palette } = useUI();
  return (
    <View>
      <Text
        accessibilityRole="alert"
        style={{ color: palette.ink, fontSize: 16, marginBottom: 12 }}
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

/** An empty name saves the suggested one; the placeholder and hint show it beforehand. */
export function NameField({
  value,
  onChange,
  category,
  colors,
  onFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  category: Category;
  colors: string[];
  onFocus?: () => void;
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
        placeholder={
          typed ? undefined : suggested || 'Ej. La camisa de las bodas'
        }
        value={value}
        maxLength={60}
        onChangeText={onChange}
        onFocus={onFocus}
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
      <Toggle label="Disponible para usar" value={value} onChange={onChange} />
    </View>
  );
}

export function WearMoreField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { palette, s } = useUI();
  return (
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 16 }]}>
      <Text style={{ color: palette.ink, flex: 1 }}>Quiero usarla más</Text>
      <Toggle label="Quiero usarla más" value={value} onChange={onChange} />
    </View>
  );
}
