import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../../theme/ThemeProvider';
import { Button, useUI } from '../ui';
import { useCopy } from '../../i18n';

function IconButton({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => [styles.icon, pressed && { opacity: 0.72 }]}
    >
      <Text
        style={{ fontSize: 22, color: selected ? palette.rust : palette.ink }}
      >
        {icon}
      </Text>
    </Pressable>
  );
}

/** One main action for the outfit on screen; saving and asking for another stay to the sides. */
export function TodayActions({
  saved,
  onFavorite,
  onWorn,
  onDismiss,
}: {
  saved: boolean;
  onFavorite: () => void;
  onWorn: () => void;
  /** Without it there is no «Prefiero otro»: a single outfit has nothing to replace it. */
  onDismiss?: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const t = useCopy();
  return (
    <View style={styles.row}>
      <IconButton
        icon={saved ? '♥' : '♡'}
        label={saved ? t.outfit.unsave : t.outfit.save}
        selected={saved}
        onPress={onFavorite}
      />
      <Button label={t.outfit.wore} onPress={onWorn} style={styles.main} />
      {onDismiss ? (
        <IconButton icon="↻" label={t.outfit.another} onPress={onDismiss} />
      ) : null}
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    main: { flex: 1, minHeight: 56, borderRadius: 28 },
    icon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
