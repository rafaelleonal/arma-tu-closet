import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, type Category, type WardrobeItem } from '../domain';
import { useCopy } from '../i18n';
import { StickerAlbum } from './StickerAlbum';
import { Chip, useUI } from './ui';

/** Same as the horizontal padding of the screen, so the filters scroll from edge to edge. */
const BLEED = 24;

/** A person's own garments as a sticker album: any photo fits, with or without background. */
export function ClosetGrid({
  items,
  onEdit,
}: {
  items: WardrobeItem[];
  onEdit: (item: WardrobeItem) => void;
}) {
  const { s } = useUI();
  const t = useCopy();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const present = CATEGORIES.filter((value) =>
    items.some((item) => item.category === value),
  );
  const visible = items.filter(
    (item) => category === 'all' || item.category === category,
  );
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filterRow}
      >
        <Chip
          label={`${t.closet.all} · ${items.length}`}
          selected={category === 'all'}
          onPress={() => setCategory('all')}
        />
        {present.map((value) => (
          <Chip
            key={value}
            label={`${t.categories[value]} · ${items.filter((item) => item.category === value).length}`}
            selected={category === value}
            onPress={() => setCategory(value)}
          />
        ))}
      </ScrollView>
      <StickerAlbum
        items={visible}
        labelFor={(item) => t.closet.edit(item.name)}
        onPress={onEdit}
      />
      {!visible.length ? (
        <Text style={s.subtitle}>{t.closet.emptyCategory}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { marginHorizontal: -BLEED, marginBottom: 6 },
  filterRow: { gap: 8, paddingHorizontal: BLEED },
});
