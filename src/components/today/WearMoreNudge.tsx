import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WardrobeItem } from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { Sticker } from '../Sticker';
import { useUI } from '../ui';

const THUMB = 46;

/** The garment the person wants to wear more, as a small sticker that opens ideas around it. */
export function WearMoreNudge({
  item,
  onPress,
}: {
  item: WardrobeItem;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Otra vuelta: ver ideas con ${item.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
    >
      <View style={styles.thumb}>
        <Sticker item={item} maxWidth={THUMB} maxHeight={THUMB} rotate={-6} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>Otra vuelta</Text>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 64,
      marginTop: 16,
      paddingVertical: 8,
      paddingLeft: 12,
      paddingRight: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.white,
    },
    thumb: {
      width: THUMB + 6,
      height: THUMB + 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyebrow: {
      fontSize: 10,
      letterSpacing: 2,
      fontWeight: '700',
      color: palette.green,
      textTransform: 'uppercase',
    },
    name: { fontSize: 14, color: palette.ink, marginTop: 2 },
    chevron: { fontSize: 20, color: palette.muted },
  });
