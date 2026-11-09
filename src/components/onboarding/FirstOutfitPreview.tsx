import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  generateRecommendations,
  seedWardrobe,
  styleContext,
} from '../../domain';
import type { LocalData } from '../../storage/schema';
import { Garment } from '../Garment';
import { useUI } from '../ui';

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
  return (
    <View style={[s.panel, { alignItems: 'center' }]}>
      {example ? (
        <Text style={[s.subtitle, { fontSize: 11, marginBottom: 12 }]}>
          Ejemplo con prendas ficticias
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {outfit.items.map((item) => (
          <Garment key={item.id} item={item} size={84} />
        ))}
      </View>
      {outfit.reasons.slice(0, 2).map((reason) => (
        <Text
          key={reason}
          style={{ color: palette.muted, fontSize: 12, marginTop: 8 }}
        >
          {reason}
        </Text>
      ))}
    </View>
  );
}
