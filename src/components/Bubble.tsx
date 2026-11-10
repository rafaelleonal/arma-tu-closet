import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUI } from './ui';

/** What the garments say, in a speech bubble whose tail points at them below. */
export function Bubble({ children }: { children: React.ReactNode }) {
  const { palette } = useUI();
  return (
    <View style={[styles.bubble, { backgroundColor: palette.white }]}>
      <Text style={[styles.text, { color: palette.ink }]}>{children}</Text>
      <View style={[styles.tail, { backgroundColor: palette.white }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 4,
  },
  text: { fontSize: 16, lineHeight: 23 },
  tail: {
    position: 'absolute',
    left: 80,
    bottom: -6,
    width: 14,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
});
