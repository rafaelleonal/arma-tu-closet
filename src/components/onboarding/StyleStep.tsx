import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EMPTY_STYLE_GOAL, STYLE_IDS, type StyleId } from '../../domain';
import { useCopy } from '../../i18n';
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
  const t = useCopy();
  const copy = t.onboarding;
  const feedback = useFeedback();
  const [notice, setNotice] = useState('');
  const selectedIds = data.profile.styleIds;
  const goal = data.styleGoal ?? EMPTY_STYLE_GOAL;
  const name = data.profile.name.trim();
  function select(id: StyleId) {
    if (!selectedIds.includes(id) && selectedIds.length >= MAX_STYLES) {
      setNotice(t.styleBoard.full);
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
      setNotice(t.styleBoard.full);
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
      <Guide kind="shirt" say={copy.styleSay(name)} title={copy.styleTitle} />
      <View style={styles.words}>
        {STYLE_IDS.map((id, index) => (
          <WordChoice
            key={id}
            word={t.styles[id].label}
            tilt={wordTilt(index)}
            label={`${t.styleBoard.stylePrefix} ${t.styles[id].label}`}
            selected={selectedIds.includes(id)}
            onPress={() => select(id)}
          />
        ))}
      </View>
      <FieldLabel>{copy.goalQuestion}</FieldLabel>
      <View style={styles.words}>
        {STYLE_IDS.map((id, index) => (
          <WordChoice
            key={id}
            word={t.styles[id].label}
            mark="✦"
            tilt={wordTilt(index + 1)}
            label={`${t.styleBoard.goal} ${t.styles[id].label}`}
            selected={goal.targetStyleIds.includes(id)}
            onPress={() => selectTarget(id)}
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
        {notice || copy.styleHint}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
