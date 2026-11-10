import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUI } from './ui';

/**
 * What the garments say, in a speech bubble. Its tail points down at the garments below it, or
 * left at the one speaking beside it.
 */
export function Bubble({
  children,
  tail = 'down',
}: {
  children: React.ReactNode;
  tail?: 'down' | 'left';
}) {
  const { palette } = useUI();
  return (
    <View
      style={[
        styles.bubble,
        tail === 'down' && styles.above,
        { backgroundColor: palette.white },
      ]}
    >
      <Text style={[styles.text, { color: palette.ink }]}>{children}</Text>
      <View
        style={[
          styles.tail,
          tail === 'down' ? styles.down : styles.left,
          { backgroundColor: palette.white },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  above: { marginBottom: 4 },
  text: { fontSize: 16, lineHeight: 23 },
  tail: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  down: { left: 80, bottom: -6 },
  left: { left: -6, top: 20 },
});
