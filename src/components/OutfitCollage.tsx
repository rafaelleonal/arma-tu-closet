import React from 'react';
import { View } from 'react-native';
import type { Outfit } from '../domain';
import { slotFor } from './outfitLayout';
import { Sticker } from './Sticker';

/** A small, still picture of an outfit as stickers. Decorative; the caller names the outfit. */
export function OutfitCollage({
  outfit,
  width,
  height,
}: {
  outfit: Outfit;
  width: number;
  height: number;
}) {
  return (
    <View style={{ width, height }}>
      {outfit.items.map((item) => {
        const slot = slotFor(outfit.items, item);
        const box = { width: slot.w * width, height: slot.h * height };
        return (
          <View
            key={item.id}
            style={[
              box,
              {
                position: 'absolute',
                left: slot.x * width,
                top: slot.y * height,
                zIndex: slot.z,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Sticker
              item={item}
              maxWidth={box.width}
              maxHeight={box.height}
              rotate={slot.rotate}
            />
          </View>
        );
      })}
    </View>
  );
}
