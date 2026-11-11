import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { CATEGORIES, COLOR_OPTIONS } from '../domain';
import { useCopy } from '../i18n';
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
  const t = useCopy();
  const copy = t.suggestionReview;
  const [draft, setDraft] = useState(suggestion);
  const [error, setError] = useState('');
  return (
    <View style={[s.panel, { marginTop: 18, borderColor: palette.green }]}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 18, color: palette.ink, marginBottom: 8 }}
      >
        {copy.title}
      </Text>
      <Text style={[s.subtitle, { fontSize: 12 }]}>{copy.hint}</Text>
      <FieldLabel>{copy.name}</FieldLabel>
      <TextInput
        accessibilityLabel={copy.nameLabel}
        value={draft.name}
        maxLength={60}
        onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
        placeholderTextColor={palette.muted}
        style={s.input}
      />
      <FieldLabel>{copy.category}</FieldLabel>
      <View style={s.wrap}>
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={t.categories[category]}
            selected={draft.category === category}
            onPress={() => setDraft((current) => ({ ...current, category }))}
          />
        ))}
      </View>
      <FieldLabel>{copy.colors}</FieldLabel>
      <View style={s.wrap}>
        {COLOR_OPTIONS.map((color) => (
          <Chip
            key={color}
            label={t.colors[color]}
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
        label={copy.apply}
        style={{ marginTop: 20 }}
        onPress={() => {
          if (!draft.name.trim()) {
            setError(copy.nameRequired);
            return;
          }
          if (!draft.colors.length) {
            setError(t.itemForm.colorsRequired);
            return;
          }
          try {
            onApply(parseGarmentSuggestion(draft));
          } catch {
            setError(copy.invalid);
          }
        }}
      />
      <Button
        secondary
        label={copy.dismiss}
        style={{ marginTop: 8 }}
        onPress={onDismiss}
      />
    </View>
  );
}
