import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Category, WardrobeItem } from '../../domain';
import { useCopy } from '../../i18n';
import type { Palette } from '../../theme/ThemeProvider';
import { slotForCategory } from '../outfitLayout';
import { Dots } from '../Dots';
import { Sticker } from '../Sticker';
import { StickerIn } from '../StickerIn';
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
  const t = useCopy();
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
    .map((category) => t.categories[category]);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={[
        names.length ? t.builder.stage(names.join(', ')) : t.builder.empty,
        missing.length ? t.builder.stageMissing(missing.join(', ')) : '',
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
                  // Keyed by garment, so choosing another one puts a new sticker down.
                  <StickerIn key={item.id}>
                    <Sticker
                      item={item}
                      maxWidth={box.width}
                      maxHeight={box.height}
                      rotate={slot.rotate}
                    />
                  </StickerIn>
                ) : (
                  <View
                    style={[
                      styles.gap,
                      { transform: [{ rotate: `${slot.rotate}deg` }] },
                    ]}
                  >
                    <Text style={styles.gapText}>{t.categories[category]}</Text>
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
