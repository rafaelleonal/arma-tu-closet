import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colorLabels, type Outfit, type WardrobeItem } from '../../domain';
import { NameTag } from '../NameTag';
import { slotFor } from '../outfitLayout';
import { Dots } from '../Dots';
import { Sticker } from '../Sticker';
import { StickerIn } from '../StickerIn';
import { stickerArt } from '../StickerAlbum';

const TAG_HEIGHT = 20;
const MAX_WIDTH = 440;

function describe(item: WardrobeItem) {
  const colors = item.colors
    .map((color) => colorLabels[color] || color)
    .join(', ');
  return `${stickerArt(item)}${colors ? `. Colores: ${colors}` : ''}`;
}

/**
 * The outfit laid out as stickers on a dotted table. Each garment opens its swap, except the one
 * the outfit was built around.
 */
export function OutfitStage({
  outfit,
  width,
  height,
  pinnedItemId,
  onItem,
}: {
  outfit: Outfit;
  width: number;
  height: number;
  pinnedItemId?: string;
  onItem: (item: WardrobeItem) => void;
}) {
  const inner = Math.min(width, MAX_WIDTH);
  const offset = (width - inner) / 2;
  return (
    <View style={{ width, height }}>
      <Dots />
      {outfit.items.map((item, index) => {
        const slot = slotFor(outfit.items, item);
        const box = { width: slot.w * inner, height: slot.h * height };
        const pinned = item.id === pinnedItemId;
        return (
          <Pressable
            key={item.id}
            accessibilityRole={pinned ? 'image' : 'button'}
            accessibilityLabel={`${pinned ? `${item.name}, prenda elegida` : `Cambiar ${item.name}`}. ${describe(item)}`}
            disabled={pinned}
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
            <StickerIn order={index} style={styles.landed}>
              <Sticker
                item={item}
                maxWidth={box.width}
                maxHeight={box.height - TAG_HEIGHT}
                rotate={slot.rotate}
              />
              <NameTag
                item={item}
                fixed={pinned}
                style={{ maxWidth: box.width, marginTop: -8 }}
              />
            </StickerIn>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landed: { alignItems: 'center', justifyContent: 'center' },
});
