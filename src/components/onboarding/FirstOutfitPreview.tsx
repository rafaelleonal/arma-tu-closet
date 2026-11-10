import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  generateRecommendations,
  reasonInVoice,
  seedWardrobe,
  styleContext,
} from '../../domain';
import type { LocalData } from '../../storage/schema';
import { OutfitCollage } from '../OutfitCollage';
import { Dots } from '../rail';
import { useUI } from '../ui';

/** Same as the horizontal padding of the step, so the table reaches both edges. */
const BLEED = 24;
const USE_REASON = /poco usadas|Sin uso registrado/;
const COLLAGE = { width: 280, height: 250 };

/** Read-only: example garments shown here are never written to the closet. */
export function FirstOutfitPreview({ data }: { data: LocalData }) {
  const { s, palette } = useUI();
  const example = !data.items.length;
  const outfit = useMemo(
    () =>
      generateRecommendations(
        example ? seedWardrobe : data.items,
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
    ],
  );
  if (!outfit)
    return (
      <Text style={[s.subtitle, { marginBottom: 12 }]}>
        Con esos gustos no me salió nada. Ajústalos cuando quieras.
      </Text>
    );
  const names = outfit.items.map((item) => item.name).join(', ');
  // Nobody has worn the example garments, so a reason about their use would not be true here.
  const reasons = outfit.reasons
    .filter((reason) => !example || !USE_REASON.test(reason))
    .slice(0, 2)
    .map(reasonInVoice)
    .join(' ');
  return (
    <View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${example ? 'Outfit de ejemplo con prendas ficticias' : 'Tu outfit'}: ${names}`}
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
            Ejemplo con prendas ficticias
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
