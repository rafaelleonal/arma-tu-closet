import React from 'react';
import { Text, View } from 'react-native';
import {
  CATEGORY_LABELS,
  styleGaps,
  type RecommendationContext,
} from '../../domain';
import type { UpdateData } from '../../hooks/useLocalData';
import type { LocalData } from '../../storage/local';
import { Chip, useUI } from '../ui';

/** Appears once a goal exists. Gaps are reported, never filled with invented garments. */
export function ExploreControl({
  data,
  update,
  context,
}: {
  data: LocalData;
  update: UpdateData;
  context: RecommendationContext;
}) {
  const { s } = useUI();
  const goal = data.styleGoal;
  if (!goal?.targetStyleIds.length) return null;
  const gaps = goal.exploring ? styleGaps(data.items, context) : [];
  return (
    <View style={{ marginTop: 18 }}>
      <View style={s.wrap}>
        <Chip
          label="Hoy me animo a algo nuevo"
          selected={goal.exploring}
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
        />
      </View>
      {gaps.length ? (
        <Text style={[s.subtitle, { fontSize: 12, marginTop: 10 }]}>
          Para ese look te falta:{' '}
          {gaps.map((gap) => CATEGORY_LABELS[gap].toLowerCase()).join(', ')}.
          Etiqueta tus prendas o agrega alguna.
        </Text>
      ) : null}
    </View>
  );
}
