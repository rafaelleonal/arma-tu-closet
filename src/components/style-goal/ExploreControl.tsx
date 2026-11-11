import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { styleGaps, type RecommendationContext } from '../../domain';
import { useCopy } from '../../i18n';
import type { UpdateData } from '../../hooks/useLocalData';
import type { LocalData } from '../../storage/local';
import { useUI } from '../ui';

/** Appears once a goal exists: today's ideas lean towards the styles the person wants to try. */
export function ExploreToggle({
  data,
  update,
}: {
  data: LocalData;
  update: UpdateData;
}) {
  const { palette } = useUI();
  const t = useCopy();
  const goal = data.styleGoal;
  if (!goal?.targetStyleIds.length) return null;
  const on = goal.exploring;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.explore.label}
      accessibilityState={{ selected: on }}
      aria-pressed={on}
      onPress={() =>
        update((current) =>
          current.styleGoal
            ? {
                ...current,
                styleGoal: {
                  ...current.styleGoal,
                  exploring: !current.styleGoal.exploring,
                },
              }
            : current,
        )
      }
      style={({ pressed }) => [
        styles.toggle,
        on && { backgroundColor: palette.ink },
        pressed && { opacity: 0.72 },
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: on ? palette.onInk : palette.rust,
        }}
      >
        ✦ {t.explore.toggle}
      </Text>
    </Pressable>
  );
}

/** Gaps are reported, never filled with invented garments. */
export function ExploreGaps({
  data,
  context,
}: {
  data: LocalData;
  context: RecommendationContext;
}) {
  const { s } = useUI();
  const t = useCopy();
  const goal = data.styleGoal;
  if (!goal?.targetStyleIds.length || !goal.exploring) return null;
  const gaps = styleGaps(data.items, context);
  if (!gaps.length) return null;
  return (
    <Text style={[s.subtitle, { fontSize: 12, marginTop: 12 }]}>
      {t.explore.gaps(
        gaps.map((gap) => t.categories[gap].toLowerCase()).join(', '),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
