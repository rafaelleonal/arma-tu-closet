import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { categoryLabels, type Category, type WardrobeItem } from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { slotForCategory } from '../outfitLayout';
import { Dots } from '../Dots';
import { Sticker } from '../Sticker';
import { useUI } from '../ui';

const MAX_WIDTH = 300;

export type Chosen = Partial<Record<Category, WardrobeItem>>;

/**
 * The outfit as it is being put together: a sticker for each chosen garment and a dashed gap for
 * each required one still missing. Read as one picture; the shelves below do the choosing.
 */
export function BuilderStage({
  required,
  chosen,
  height,
}: {
  required: Category[];
  chosen: Chosen;
  height: number;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [width, setWidth] = useState(0);
  const optional = (Object.keys(chosen) as Category[]).filter(
    (category) => chosen[category] && !required.includes(category),
  );
  const categories = [...required, ...optional];
  const inner = Math.min(width, MAX_WIDTH);
  const offset = (width - inner) / 2;
  const table = height - 24;
  const names = categories.flatMap((category) => chosen[category]?.name ?? []);
  const missing = required
    .filter((category) => !chosen[category])
    .map((category) => categoryLabels[category]);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={[
        names.length ? `Tu outfit: ${names.join(', ')}.` : 'Tu outfit, vacío.',
        missing.length ? `Falta: ${missing.join(', ')}.` : '',
      ]
        .join(' ')
        .trim()}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ height, backgroundColor: palette.art }}
    >
      <Dots />
      {width
        ? categories.map((category) => {
            const slot = slotForCategory(categories, category);
            const item = chosen[category];
            const box = { width: slot.w * inner, height: slot.h * table };
            return (
              <View
                key={category}
                style={[
                  styles.slot,
                  box,
                  {
                    left: offset + slot.x * inner,
                    top: 12 + slot.y * table,
                    zIndex: slot.z,
                  },
                ]}
              >
                {item ? (
                  <Sticker
                    item={item}
                    maxWidth={box.width}
                    maxHeight={box.height}
                    rotate={slot.rotate}
                  />
                ) : (
                  <View
                    style={[
                      styles.gap,
                      { transform: [{ rotate: `${slot.rotate}deg` }] },
                    ]}
                  >
                    <Text style={styles.gapText}>
                      {categoryLabels[category]}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        : null}
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
    gap: {
      width: '82%',
      height: '78%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: palette.muted,
    },
    gapText: { fontSize: 11, color: palette.muted, textAlign: 'center' },
  });
