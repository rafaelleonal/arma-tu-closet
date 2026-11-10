import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EMPTY_STYLE_GOAL, STYLE_OPTIONS, type StyleId } from '../../domain';
import { useFeedback } from '../Feedback';
import { FieldLabel, useUI } from '../ui';
import { WordChoice, wordTilt } from '../WordSticker';
import { Guide } from './Guide';
import type { StepProps } from './types';

const MAX_STYLES = 3;

export function StyleStep({
  data,
  onChange,
  startExploring,
}: StepProps & { startExploring: boolean }) {
  const { palette } = useUI();
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
      <View style={styles.words}>
        {STYLE_OPTIONS.map((option, index) => (
          <WordChoice
            key={option.id}
            word={option.label}
            tilt={wordTilt(index)}
            label={`Estilo ${option.label}`}
            selected={selectedIds.includes(option.id)}
            onPress={() => select(option.id)}
          />
        ))}
      </View>
      <FieldLabel>¿Y cómo te gustaría verte?</FieldLabel>
      <View style={styles.words}>
        {STYLE_OPTIONS.map((option, index) => (
          <WordChoice
            key={option.id}
            word={option.label}
            mark="✦"
            tilt={wordTilt(index + 1)}
            label={`Quiero probar ${option.label}`}
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

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
