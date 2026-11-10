import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WardrobeItem } from '../domain';
import type { Palette } from '../theme/ThemeProvider';
import { demoPhotoFor } from './demoPhotos';
import { garmentArtLabel } from './Garment';
import { Dots } from './Dots';
import { Sticker } from './Sticker';
import { useUI } from './ui';

const GAP = 12;
/** Same as the horizontal padding of a screen or sheet, so the album reaches both edges. */
const BLEED = 24;
/** Repeats every six stickers so neighbours in a row of three never lean the same way. */
const TILTS = [-3, 2, -1.5, 3, -2, 1.5];

export function tiltFor(index: number) {
  return TILTS[index % TILTS.length];
}

/** What a sticker shows, for assistive technology: a photo, an example photo or a drawing. */
export function stickerArt(item: WardrobeItem) {
  return garmentArtLabel(
    Boolean(item.cutoutUri || item.photoUri),
    Boolean(demoPhotoFor(item)),
  );
}

/** Garments as a three-column sticker album on dotted paper. Each sticker is a button. */
export function StickerAlbum({
  items,
  labelFor,
  onPress,
}: {
  items: WardrobeItem[];
  /** What tapping the sticker does, read before the kind of picture. */
  labelFor: (item: WardrobeItem) => string;
  onPress: (item: WardrobeItem) => void;
}) {
  const [width, setWidth] = useState(0);
  const tile = width ? Math.floor((width - GAP * 2) / 3) : 0;
  return (
    <View style={styles.album}>
      <Dots />
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.sheet}
      >
        {tile
          ? items.map((item, index) => (
              <StickerTile
                key={item.id}
                item={item}
                size={tile}
                tilt={tiltFor(index)}
                label={labelFor(item)}
                onPress={() => onPress(item)}
              />
            ))
          : null}
      </View>
    </View>
  );
}

/** One sticker with its name. `selected` turns it into a toggle with a check mark. */
export function StickerTile({
  item,
  size,
  tilt,
  label,
  selected,
  onPress,
}: {
  item: WardrobeItem;
  size: number;
  tilt: number;
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const tile = useMemo(() => createStyles(palette), [palette]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${item.available ? '' : ', en lavandería'}. ${stickerArt(item)}`}
      accessibilityState={selected === undefined ? undefined : { selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => ({ width: size, opacity: pressed ? 0.75 : 1 })}
    >
      <View style={[tile.cell, { width: size, height: size }]}>
        <View style={{ opacity: item.available ? 1 : 0.45 }}>
          <Sticker
            item={item}
            maxWidth={size - 10}
            maxHeight={size - 10}
            rotate={tilt}
          />
        </View>
        {!item.available ? <Text style={tile.laundry}>Lavandería</Text> : null}
        {selected ? (
          <View style={tile.check}>
            <Text style={tile.checkMark}>✓</Text>
          </View>
        ) : null}
      </View>
      {/* Two lines: similar names often differ only at the end. */}
      <Text
        numberOfLines={2}
        style={[tile.name, selected && { fontWeight: '700' }]}
      >
        {item.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});

const createStyles = (palette: Palette) =>
  StyleSheet.create({
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
    check: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: palette.ink,
      borderWidth: 2,
      borderColor: palette.paper,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkMark: { color: palette.onInk, fontSize: 12, fontWeight: '700' },
    name: {
      fontSize: 12,
      lineHeight: 16,
      color: palette.ink,
      textAlign: 'center',
      marginTop: 4,
    },
  });
