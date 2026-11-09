import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colorLabels,
  type Category,
  type Outfit,
  type WardrobeItem,
} from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { demoPhotoFor } from '../demoPhotos';
import { garmentArtLabel } from '../Garment';
import { Dots } from '../rail';
import { Sticker } from '../Sticker';
import { colorHex, useUI } from '../ui';

/** Where a garment lies on the table, as fractions of the stage. */
interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  z: number;
}
type Layout = Partial<Record<Category, Slot>>;

const SEPARATES: Layout = {
  top: { x: 0.02, y: 0, w: 0.54, h: 0.52, rotate: -4, z: 2 },
  bottom: { x: 0.52, y: 0.12, w: 0.42, h: 0.7, rotate: 5, z: 1 },
  shoes: { x: 0.04, y: 0.58, w: 0.46, h: 0.34, rotate: -6, z: 3 },
  accessory: { x: 0.64, y: 0.74, w: 0.32, h: 0.26, rotate: 8, z: 4 },
};
const SEPARATES_WITH_LAYER: Layout = {
  layer: { x: 0.46, y: 0, w: 0.52, h: 0.46, rotate: 6, z: 0 },
  top: { x: 0, y: 0.06, w: 0.5, h: 0.46, rotate: -4, z: 2 },
  bottom: { x: 0.54, y: 0.4, w: 0.38, h: 0.58, rotate: 5, z: 1 },
  shoes: { x: 0.04, y: 0.6, w: 0.44, h: 0.32, rotate: -6, z: 3 },
  accessory: { x: 0.3, y: 0.46, w: 0.26, h: 0.2, rotate: 8, z: 4 },
};
const ONE_PIECE: Layout = {
  'one-piece': { x: 0.06, y: 0, w: 0.5, h: 0.86, rotate: -3, z: 1 },
  layer: { x: 0.5, y: 0.02, w: 0.48, h: 0.46, rotate: 6, z: 0 },
  shoes: { x: 0.54, y: 0.5, w: 0.42, h: 0.3, rotate: -6, z: 3 },
  accessory: { x: 0.6, y: 0.78, w: 0.34, h: 0.22, rotate: 8, z: 4 },
};
const SPARE: Slot = { x: 0.3, y: 0.3, w: 0.4, h: 0.4, rotate: 0, z: 5 };
const TAG_HEIGHT = 20;
const MAX_WIDTH = 440;

function layoutFor(items: WardrobeItem[]): Layout {
  if (items.some((item) => item.category === 'one-piece')) return ONE_PIECE;
  return items.some((item) => item.category === 'layer')
    ? SEPARATES_WITH_LAYER
    : SEPARATES;
}

function describe(item: WardrobeItem) {
  const art = garmentArtLabel(
    Boolean(item.cutoutUri || item.photoUri),
    Boolean(demoPhotoFor(item)),
  );
  const colors = item.colors
    .map((color) => colorLabels[color] || color)
    .join(', ');
  return `${art}${colors ? `. Colores: ${colors}` : ''}`;
}

/** The outfit laid out as stickers on a dotted table. Each garment opens its swap. */
export function OutfitStage({
  outfit,
  width,
  height,
  onItem,
}: {
  outfit: Outfit;
  width: number;
  height: number;
  onItem: (item: WardrobeItem) => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const layout = layoutFor(outfit.items);
  const inner = Math.min(width, MAX_WIDTH);
  const offset = (width - inner) / 2;
  return (
    <View style={{ width, height }}>
      <Dots />
      {outfit.items.map((item) => {
        const slot = layout[item.category] ?? SPARE;
        const box = { width: slot.w * inner, height: slot.h * height };
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Cambiar ${item.name}. ${describe(item)}`}
            onPress={() => onItem(item)}
            style={({ pressed }) => [
              styles.slot,
              box,
              {
                left: offset + slot.x * inner,
                top: slot.y * height,
                zIndex: slot.z,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Sticker
              item={item}
              maxWidth={box.width}
              maxHeight={box.height - TAG_HEIGHT}
              rotate={slot.rotate}
            />
            <View style={[styles.tag, { maxWidth: box.width }]}>
              {item.colors.slice(0, 3).map((color) => (
                <View
                  key={color}
                  style={[
                    styles.swatch,
                    { backgroundColor: colorHex[color] || palette.muted },
                  ]}
                />
              ))}
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    slot: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: -8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
      backgroundColor: palette.white,
      borderWidth: 1,
      borderColor: palette.line,
    },
    swatch: {
      width: 9,
      height: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: palette.swatchBorder,
    },
    name: { flexShrink: 1, fontSize: 12, color: palette.ink },
  });
