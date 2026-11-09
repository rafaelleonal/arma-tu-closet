import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colorLabels, type Outfit, type WardrobeItem } from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { demoPhotoFor } from '../demoPhotos';
import { garmentArtLabel } from '../Garment';
import { slotFor } from '../outfitLayout';
import { Dots } from '../rail';
import { Sticker } from '../Sticker';
import { colorHex, useUI } from '../ui';

const TAG_HEIGHT = 20;
const MAX_WIDTH = 440;

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
  const inner = Math.min(width, MAX_WIDTH);
  const offset = (width - inner) / 2;
  return (
    <View style={{ width, height }}>
      <Dots />
      {outfit.items.map((item) => {
        const slot = slotFor(outfit.items, item);
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
