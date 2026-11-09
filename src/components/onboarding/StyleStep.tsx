import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { EMPTY_STYLE_GOAL, STYLE_OPTIONS, type StyleId } from '../../domain';
import { useFeedback } from '../Feedback';
import { Chip, FieldLabel, useUI } from '../ui';
import { Guide } from './Guide';
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

const MAX_STYLES = 3;

export function StyleStep({
  data,
  onChange,
  startExploring,
}: StepProps & { startExploring: boolean }) {
  const { s, palette } = useUI();
  const feedback = useFeedback();
  const [notice, setNotice] = useState('');
  const selectedIds = data.profile.styleIds;
  const goal = data.styleGoal ?? EMPTY_STYLE_GOAL;
  const name = data.profile.name.trim();
  function select(id: StyleId) {
    if (!selectedIds.includes(id) && selectedIds.length >= MAX_STYLES) {
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
  function selectTarget(id: StyleId) {
    const chosen = goal.targetStyleIds.includes(id);
    if (!chosen && goal.targetStyleIds.length >= MAX_STYLES) {
      setNotice('Máximo 3. Quita uno para elegir otro.');
      return;
    }
    feedback.selection();
    setNotice('');
    const targetStyleIds = chosen
      ? goal.targetStyleIds.filter((value) => value !== id)
      : [...goal.targetStyleIds, id];
    onChange({
      styleGoal: {
        ...goal,
        targetStyleIds,
        exploring:
          targetStyleIds.length > 0 && (goal.exploring || startExploring),
      },
    });
  }
  return (
    <>
      <Guide
        kind="shirt"
        say={`${name ? `${name}, soy` : 'Soy'} Cami, la camisa. Cuéntame de tu ropa.`}
        title="¿Cómo te vistes casi siempre?"
      />
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
      <FieldLabel>¿Y cómo te gustaría verte?</FieldLabel>
      <View style={s.wrap}>
        {STYLE_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={goal.targetStyleIds.includes(option.id)}
            onPress={() => selectTarget(option.id)}
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
        {notice || 'Hasta 3 en cada grupo · Opcional'}
      </Text>
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
