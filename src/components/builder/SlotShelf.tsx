import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Category, WardrobeItem } from '../../domain';
import { useCopy } from '../../i18n';
import { SHEET_BLEED } from '../Sheet';
import { StickerTile, tiltFor } from '../StickerAlbum';
import { FieldLabel, useUI } from '../ui';

const TILE = 96;

/** The available garments of one category as a row of stickers; tapping one picks or drops it. */
export function SlotShelf({
  category,
  optional,
  items,
  selectedId,
  onToggle,
}: {
  category: Category;
  optional: boolean;
  items: WardrobeItem[];
  selectedId?: string;
  onToggle: (item: WardrobeItem) => void;
}) {
  const { s } = useUI();
  const t = useCopy();
  return (
    <View>
      <FieldLabel>
        {t.categories[category]}
        {optional ? ` · ${t.common.optional}` : ''}
      </FieldLabel>
      {items.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.shelf}
          contentContainerStyle={styles.row}
        >
          {items.map((item, index) => (
            <StickerTile
              key={item.id}
              item={item}
              size={TILE}
              tilt={tiltFor(index)}
              label={item.name}
              selected={selectedId === item.id}
              onPress={() => onToggle(item)}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={s.subtitle}>{t.builder.noneAvailable}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: { marginHorizontal: -SHEET_BLEED },
  row: { paddingHorizontal: SHEET_BLEED, gap: 10 },
});
