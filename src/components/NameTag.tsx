import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { WardrobeItem } from '../domain';
import { colorHex, useUI } from './ui';

/**
 * The label under a sticker: the garment's colors and its name. `fixed` inverts it to mark the
 * garment an outfit is built around.
 */
export function NameTag({
  item,
  fixed,
  style,
}: {
  item: Pick<WardrobeItem, 'name' | 'colors'>;
  fixed?: boolean;
  style?: ViewStyle;
}) {
  const { palette } = useUI();
  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: fixed ? palette.ink : palette.white,
          borderColor: fixed ? palette.ink : palette.line,
        },
        style,
      ]}
    >
      {item.colors.slice(0, 3).map((color) => (
        <View
          key={color}
          style={[
            styles.swatch,
            {
              backgroundColor: colorHex[color] || palette.muted,
              // The inverted tag can match a swatch, such as white on white in a dark theme.
              borderColor: fixed ? palette.muted : palette.swatchBorder,
            },
          ]}
        />
      ))}
      <Text
        numberOfLines={1}
        style={[styles.name, { color: fixed ? palette.onInk : palette.ink }]}
      >
        {item.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  swatch: { width: 9, height: 9, borderRadius: 5, borderWidth: 1 },
  name: { flexShrink: 1, fontSize: 12 },
});
