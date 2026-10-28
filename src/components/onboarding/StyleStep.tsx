import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { STYLE_OPTIONS, type StyleId } from '../../domain';
import { useFeedback } from '../Feedback';
import { FieldLabel, useUI } from '../ui';
import type { StepProps } from './types';

const styleMarks: Record<StyleId, string> = {
  minimal: '—',
  classic: '◇',
  street: '↗',
  relaxed: '≈',
  creative: '✱',
  sport: '⌁',
  girly: '♡',
  feminine: '❀',
};

export function StyleStep({ data, onChange }: StepProps) {
  const { s, palette } = useUI();
  const feedback = useFeedback();
  const [notice, setNotice] = useState('');
  const selectedIds = data.profile.styleIds;
  function select(id: StyleId) {
    if (!selectedIds.includes(id) && selectedIds.length >= 3) {
      setNotice('Máximo 3. Quita uno para elegir otro.');
      return;
    }
    feedback.selection();
    setNotice('');
    onChange({
      profile: {
        ...data.profile,
        styleIds: selectedIds.includes(id)
          ? selectedIds.filter((value) => value !== id)
          : [...selectedIds, id],
      },
    });
  }
  return (
    <>
      <Text accessibilityRole="header" style={s.title}>
        Tu estilo
      </Text>
      <Text style={[s.subtitle, { marginTop: 12, marginBottom: 20 }]}>
        Elige hasta 3.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {STYLE_OPTIONS.map((option) => (
          <StyleCard
            key={option.id}
            label={option.label}
            mark={styleMarks[option.id]}
            selected={selectedIds.includes(option.id)}
            onPress={() => select(option.id)}
          />
        ))}
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: notice ? palette.rust : palette.muted,
          marginTop: 14,
          fontSize: 11,
        }}
      >
        {notice || `${selectedIds.length} de 3 · Opcional`}
      </Text>
      <FieldLabel>Nombre · opcional</FieldLabel>
      <TextInput
        accessibilityLabel="Tu nombre, opcional"
        placeholder="Tu nombre"
        placeholderTextColor={palette.muted}
        value={data.profile.name}
        onChangeText={(name) =>
          onChange({ profile: { ...data.profile, name } })
        }
        maxLength={40}
        autoComplete="given-name"
        style={s.input}
      />
    </>
  );
}

function StyleCard({
  label,
  mark,
  selected,
  onPress,
}: {
  label: string;
  mark: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { palette } = useUI();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Estilo ${label}`}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={{
        flexBasis: '30%',
        minWidth: 120,
        flexGrow: 1,
        minHeight: 112,
        padding: 18,
        borderRadius: 16,
        backgroundColor: selected ? palette.ink : palette.white,
        borderWidth: 1,
        borderColor: selected ? palette.ink : palette.line,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: selected ? palette.onInk : palette.green,
            fontSize: 26,
            lineHeight: 28,
          }}
        >
          {mark}
        </Text>
        <Text
          style={{
            color: selected ? palette.onInk : palette.muted,
            fontSize: 15,
          }}
        >
          {selected ? '✓' : '+'}
        </Text>
      </View>
      <Text
        style={{
          color: selected ? palette.onInk : palette.ink,
          fontSize: 15,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
