import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STYLE_IDS, type StyleId } from '../../domain';
import { useCopy, type Copy } from '../../i18n';
import type { Palette } from '../../theme/ThemeProvider';
import { Dots } from '../Dots';
import { useUI } from '../ui';
import { WordSticker, wordTilt } from '../WordSticker';

/** Same as the horizontal padding of the screen, so the board reaches both edges. */
const BLEED = 24;

function labels(t: Copy, ids: readonly StyleId[]) {
  return STYLE_IDS.filter((id) => ids.includes(id)).map(
    (id) => t.styles[id].label,
  );
}

function Row({
  title,
  words,
  empty,
  action,
  mark,
  onPress,
}: {
  title: string;
  words: string[];
  empty: string;
  action: string;
  mark?: string;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${words.length ? words.join(', ') : empty}. ${action}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
    >
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.action}>{action} ›</Text>
      </View>
      <View style={styles.words}>
        {words.length ? (
          words.map((word, index) => (
            <WordSticker
              key={word}
              word={word}
              mark={mark}
              tilt={wordTilt(index)}
            />
          ))
        ) : (
          <View style={styles.blank}>
            <Text style={{ color: palette.muted, fontSize: 15 }}>{empty}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

/** The person's styles as word stickers: how they dress now and what they want to try. */
export function StyleBoard({
  styleIds,
  targetStyleIds,
  onEditStyles,
  onEditGoal,
}: {
  styleIds: readonly StyleId[];
  targetStyleIds: readonly StyleId[];
  onEditStyles: () => void;
  onEditGoal: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const t = useCopy();
  const copy = t.styleBoard;
  return (
    <View style={styles.board}>
      <Dots />
      <Row
        title={copy.current}
        words={labels(t, styleIds)}
        empty={copy.currentEmpty}
        action={styleIds.length ? copy.edit : copy.choose}
        onPress={onEditStyles}
      />
      <Row
        title={copy.goal}
        words={labels(t, targetStyleIds)}
        empty={copy.goalEmpty}
        action={targetStyleIds.length ? copy.edit : copy.choose}
        mark="✦"
        onPress={onEditGoal}
      />
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    board: {
      marginHorizontal: -BLEED,
      paddingHorizontal: BLEED,
      paddingVertical: 22,
      gap: 26,
    },
    row: { gap: 14 },
    heading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 10,
      letterSpacing: 2,
      fontWeight: '700',
      color: palette.green,
      textTransform: 'uppercase',
    },
    action: { fontSize: 12, fontWeight: '600', color: palette.rust },
    words: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    blank: {
      minHeight: 48,
      paddingHorizontal: 18,
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: palette.muted,
    },
  });
