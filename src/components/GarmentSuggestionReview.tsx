import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import {
  CATEGORIES,
  COLOR_OPTIONS,
  categoryLabels,
  colorLabels,
} from '../domain';
import {
  parseGarmentSuggestion,
  type GarmentSuggestion,
} from '../ai/contracts';
import { Button, Chip, colorHex, FieldLabel, useUI } from './ui';

export function GarmentSuggestionReview({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: GarmentSuggestion;
  onApply: (value: GarmentSuggestion) => void;
  onDismiss: () => void;
}) {
  const { palette, s } = useUI();
  const [draft, setDraft] = useState(suggestion);
  const [error, setError] = useState('');
  return (
    <View style={[s.panel, { marginTop: 18, borderColor: palette.green }]}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 18, color: palette.ink, marginBottom: 8 }}
      >
        Revisar análisis
      </Text>
      <Text style={[s.subtitle, { fontSize: 12 }]}>
        Todavía no se aplicó al formulario. Corrige lo que haga falta.
      </Text>
      <FieldLabel>Nombre propuesto</FieldLabel>
      <TextInput
        accessibilityLabel="Nombre propuesto por el análisis"
        value={draft.name}
        maxLength={60}
        onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
        placeholderTextColor={palette.muted}
        style={s.input}
      />
      <FieldLabel>Categoría propuesta</FieldLabel>
      <View style={s.wrap}>
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={categoryLabels[category]}
            selected={draft.category === category}
            onPress={() => setDraft((current) => ({ ...current, category }))}
          />
        ))}
      </View>
      <FieldLabel>Colores propuestos</FieldLabel>
      <View style={s.wrap}>
        {COLOR_OPTIONS.map((color) => (
          <Chip
            key={color}
            label={colorLabels[color]}
            swatch={colorHex[color]}
            selected={draft.colors.includes(color)}
            onPress={() =>
              setDraft((current) => ({
                ...current,
                colors: current.colors.includes(color)
                  ? current.colors.filter((value) => value !== color)
                  : [...current.colors, color],
              }))
            }
          />
        ))}
      </View>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, fontSize: 12, marginTop: 14 }}
        >
          {error}
        </Text>
      ) : null}
      <Button
        label="Aplicar estos datos"
        style={{ marginTop: 20 }}
        onPress={() => {
          if (!draft.name.trim()) {
            setError('Escribe un nombre.');
            return;
          }
          if (!draft.colors.length) {
            setError('Elige al menos un color.');
            return;
          }
          try {
            onApply(parseGarmentSuggestion(draft));
          } catch {
            setError('Revisa el nombre, la categoría y los colores.');
          }
        }}
      />
      <Button
        secondary
        label="Descartar análisis"
        style={{ marginTop: 8 }}
        onPress={onDismiss}
      />
      <Text style={[s.subtitle, { fontSize: 11, marginTop: 12 }]}>
        Aplicar reemplaza nombre, categoría y colores. Después debes guardar la
        prenda.
      </Text>
    </View>
  );
}
