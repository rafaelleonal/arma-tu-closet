import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CATEGORIES,
  categoryLabels,
  type Category,
  type WardrobeItem,
} from '../domain';
import type { Palette } from '../theme/ThemeProvider';
import { demoPhotoFor } from './demoPhotos';
import { garmentArtLabel } from './Garment';
import { Dots } from './rail';
import { Sticker } from './Sticker';
import { Chip, useUI } from './ui';

const GAP = 12;
/** Same as the horizontal padding of the screen, so the album reaches both edges. */
const BLEED = 24;
/** Repeats every six stickers so neighbours in a row of three never lean the same way. */
const TILTS = [-3, 2, -1.5, 3, -2, 1.5];

/** A person's own garments as a sticker album: any photo fits, with or without background. */
export function ClosetGrid({
  items,
  onEdit,
}: {
  items: WardrobeItem[];
  onEdit: (item: WardrobeItem) => void;
}) {
  const { palette, s } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [width, setWidth] = useState(0);
  const present = CATEGORIES.filter((value) =>
    items.some((item) => item.category === value),
  );
  const visible = items.filter(
    (item) => category === 'all' || item.category === category,
  );
  const tile = width ? Math.floor((width - GAP * 2) / 3) : 0;
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filterRow}
      >
        <Chip
          label={`Todo · ${items.length}`}
          selected={category === 'all'}
          onPress={() => setCategory('all')}
        />
        {present.map((value) => (
          <Chip
            key={value}
            label={`${categoryLabels[value]} · ${items.filter((item) => item.category === value).length}`}
            selected={category === value}
            onPress={() => setCategory(value)}
          />
        ))}
      </ScrollView>
      <View style={styles.album}>
        <Dots />
        <View
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          style={styles.sheet}
        >
          {tile
            ? visible.map((item, index) => (
                <AlbumSticker
                  key={item.id}
                  item={item}
                  size={tile}
                  tilt={TILTS[index % TILTS.length]}
                  onPress={() => onEdit(item)}
                />
              ))
            : null}
        </View>
        {!visible.length ? (
          <Text style={s.subtitle}>No tienes prendas en esta categoría.</Text>
        ) : null}
      </View>
    </View>
  );
}

function AlbumSticker({
  item,
  size,
  tilt,
  onPress,
}: {
  item: WardrobeItem;
  size: number;
  tilt: number;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const art = garmentArtLabel(
    Boolean(item.cutoutUri || item.photoUri),
    Boolean(demoPhotoFor(item)),
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${item.name}${item.available ? '' : ', en lavandería'}. ${art}`}
      onPress={onPress}
      style={({ pressed }) => ({ width: size, opacity: pressed ? 0.75 : 1 })}
    >
      <View style={[styles.cell, { width: size, height: size }]}>
        <View style={{ opacity: item.available ? 1 : 0.45 }}>
          <Sticker
            item={item}
            maxWidth={size - 10}
            maxHeight={size - 10}
            rotate={tilt}
          />
        </View>
        {!item.available ? (
          <Text style={styles.laundry}>Lavandería</Text>
        ) : null}
      </View>
      {/* Two lines: similar names often differ only at the end. */}
      <Text numberOfLines={2} style={styles.name}>
        {item.name}
      </Text>
    </Pressable>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    filters: { marginHorizontal: -BLEED, marginBottom: 6 },
    filterRow: { gap: 8, paddingHorizontal: BLEED },
    album: {
      marginHorizontal: -BLEED,
      paddingHorizontal: BLEED,
      paddingVertical: 18,
    },
    sheet: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: GAP,
      rowGap: 18,
    },
    cell: { alignItems: 'center', justifyContent: 'center' },
    laundry: {
      position: 'absolute',
      bottom: 4,
      fontSize: 10,
      color: palette.ink,
      backgroundColor: palette.floating,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      overflow: 'hidden',
    },
    name: {
      fontSize: 12,
      lineHeight: 16,
      color: palette.ink,
      textAlign: 'center',
      marginTop: 4,
    },
  });
