import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CATEGORIES,
  categoryLabels,
  COLOR_OPTIONS,
  colorLabels,
  type Category,
} from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { DARK_SWATCHES } from '../ColorPicker';
import type { IllustrationKind } from '../Garment';
import { DrawingSticker } from '../Sticker';
import { colorHex, FieldLabel, useUI } from '../ui';

/** The drawing that stands for each category when choosing what a garment is. */
const DRAWING: Record<Category, IllustrationKind> = {
  top: 'tee',
  bottom: 'trousers',
  'one-piece': 'dress',
  shoes: 'sneakers',
  layer: 'jacket',
  accessory: 'scarf',
};

/** What the garment is, chosen by its drawing instead of by reading a list. */
export function CategoryChoices({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <>
      <FieldLabel>¿Qué es?</FieldLabel>
      <View accessibilityRole="radiogroup" style={styles.grid}>
        {CATEGORIES.map((category) => {
          const selected = category === value;
          return (
            <Pressable
              key={category}
              accessibilityRole="radio"
              accessibilityLabel={categoryLabels[category]}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              onPress={() => onChange(category)}
              style={({ pressed }) => [
                styles.kind,
                pressed && { opacity: 0.72 },
              ]}
            >
              <View style={[styles.drawing, !selected && { opacity: 0.4 }]}>
                <DrawingSticker
                  kind={DRAWING[category]}
                  maxWidth={76}
                  maxHeight={70}
                  style={
                    selected ? { transform: [{ rotate: '-4deg' }] } : undefined
                  }
                />
              </View>
              {selected ? (
                <View style={styles.check}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              ) : null}
              <Text
                numberOfLines={2}
                style={[styles.kindLabel, selected && { fontWeight: '700' }]}
              >
                {categoryLabels[category]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

/** The garment's colors as swatches; it can have several. */
export function ColorChoices({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (colors: string[]) => void;
  error?: string;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <>
      <FieldLabel>¿De qué color?</FieldLabel>
      <View style={styles.grid}>
        {COLOR_OPTIONS.map((color) => {
          const selected = value.includes(color);
          return (
            <Pressable
              key={color}
              accessibilityRole="checkbox"
              accessibilityLabel={colorLabels[color]}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              onPress={() =>
                onChange(
                  selected
                    ? value.filter((item) => item !== color)
                    : [...value, color],
                )
              }
              style={({ pressed }) => [
                styles.color,
                pressed && { opacity: 0.72 },
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: colorHex[color] },
                  selected && styles.swatchOn,
                ]}
              >
                {selected ? (
                  <Text
                    style={{
                      fontSize: 16,
                      color: DARK_SWATCHES.includes(color)
                        ? '#FFFFFF'
                        : '#242923',
                    }}
                  >
                    ✓
                  </Text>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.colorLabel, selected && { fontWeight: '700' }]}
              >
                {colorLabels[color]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    kind: { width: '32%', alignItems: 'center', paddingVertical: 6 },
    drawing: { height: 74, alignItems: 'center', justifyContent: 'center' },
    check: {
      position: 'absolute',
      top: 2,
      right: 10,
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
    kindLabel: {
      fontSize: 12,
      lineHeight: 16,
      color: palette.ink,
      textAlign: 'center',
      marginTop: 4,
    },
    color: { width: '16%', minHeight: 62, alignItems: 'center' },
    swatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.swatchBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchOn: { borderWidth: 2, borderColor: palette.ink },
    colorLabel: {
      fontSize: 10,
      lineHeight: 14,
      color: palette.ink,
      marginTop: 5,
    },
    error: { color: palette.rust, marginTop: 8, fontSize: 12 },
  });
