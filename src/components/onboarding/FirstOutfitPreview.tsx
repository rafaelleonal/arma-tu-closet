import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  generateRecommendations,
  parseReason,
  seedWardrobe,
  styleContext,
} from '../../domain';
import { reasonText, useCopy } from '../../i18n';
import type { LocalData } from '../../storage/schema';
import { OutfitCollage } from '../OutfitCollage';
import { Dots } from '../Dots';
import { useUI } from '../ui';

/** Same as the horizontal padding of the step, so the table reaches both edges. */
const BLEED = 24;
const COLLAGE = { width: 280, height: 250 };

/** Read-only: example garments shown here are never written to the closet. */
export function FirstOutfitPreview({ data }: { data: LocalData }) {
  const { s, palette } = useUI();
  const t = useCopy();
  const copy = t.onboarding;
  const example = !data.items.length;
  const outfit = useMemo(
    () =>
      generateRecommendations(
        example
          ? seedWardrobe.map((item) => ({
              ...item,
              name: t.demoNames[item.id] ?? item.name,
            }))
          : data.items,
        {
          ...data.context,
          ...data.preferences,
          ...styleContext(data.profile.styleIds, data.styleGoal),
          now: new Date().toISOString(),
        },
        { limit: 1 },
      ).outfits[0],
    [
      example,
      data.items,
      data.context,
      data.preferences,
      data.profile.styleIds,
      data.styleGoal,
      t,
    ],
  );
  if (!outfit)
    return (
      <Text style={[s.subtitle, { marginBottom: 12 }]}>{copy.noPreview}</Text>
    );
  const names = outfit.items.map((item) => item.name).join(', ');
  // Nobody has worn the example garments, so a reason about their use would not be true here.
  const reasons = outfit.reasons
    .filter((code) => {
      const kind = parseReason(code)?.kind;
      return !example || (kind !== 'lightly-used' && kind !== 'rotation');
    })
    .slice(0, 2)
    .map((code) => reasonText(t, code))
    .join(' ');
  return (
    <View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${example ? copy.exampleOutfit : t.outfit.title}: ${names}`}
        style={styles.table}
      >
        <Dots />
        <OutfitCollage
          outfit={outfit}
          width={COLLAGE.width}
          height={COLLAGE.height}
        />
        {example ? (
          <Text
            style={[
              styles.example,
              { color: palette.ink, backgroundColor: palette.floating },
            ]}
          >
            {copy.exampleTag}
          </Text>
        ) : null}
      </View>
      {reasons ? (
        <Text style={[s.subtitle, { fontSize: 13, marginTop: 10 }]}>
          {reasons}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginHorizontal: -BLEED,
    paddingVertical: 20,
    alignItems: 'center',
  },
  example: {
    fontSize: 11,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
