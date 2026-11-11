import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { Category } from '../../domain';
import { suggestedItemName } from '../itemForm';
import { Button, FieldLabel, useUI } from '../ui';
import { Toggle } from '../Toggle';
import { useCopy } from '../../i18n';

/** Takes the place of the save button, so the question is in view wherever the form was. */
export function DiscardPrompt({
  onKeep,
  onDiscard,
}: {
  onKeep: () => void;
  onDiscard: () => void;
}) {
  const { palette } = useUI();
  const t = useCopy();
  return (
    <View>
      <Text
        accessibilityRole="alert"
        style={{ color: palette.ink, fontSize: 16, marginBottom: 12 }}
      >
        {t.itemEditor.discardQuestion}
      </Text>
      <Button label={t.itemEditor.keepEditing} onPress={onKeep} />
      <Button
        secondary
        label={t.itemEditor.discard}
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
  const t = useCopy();
  const suggested = suggestedItemName(t, category, colors);
  const typed = !!value.trim();
  return (
    <>
      <FieldLabel>{t.itemEditor.nameTitle}</FieldLabel>
      <TextInput
        accessibilityLabel={t.itemEditor.nameLabel}
        accessibilityHint={
          typed || !colors.length ? undefined : t.itemEditor.nameHint(suggested)
        }
        placeholderTextColor={palette.muted}
        placeholder={
          typed ? undefined : suggested || t.itemEditor.namePlaceholder
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
  const t = useCopy();
  return (
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 22 }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.ink }}>{t.itemEditor.available}</Text>
        <Text style={[s.subtitle, { fontSize: 12 }]}>
          {t.itemEditor.availableHint}
        </Text>
      </View>
      <Toggle
        label={t.itemEditor.available}
        value={value}
        onChange={onChange}
      />
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
  const t = useCopy();
  return (
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 16 }]}>
      <Text style={{ color: palette.ink, flex: 1 }}>
        {t.itemEditor.wearMore}
      </Text>
      <Toggle label={t.itemEditor.wearMore} value={value} onChange={onChange} />
    </View>
  );
}
