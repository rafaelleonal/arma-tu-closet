import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STICKER_INK, STICKER_PAPER, lifted } from './Sticker';
import { useUI } from './ui';

const TILTS = [-3, 2, -1.5];

export function wordTilt(index: number) {
  return TILTS[index % TILTS.length];
}

/** A word on sticker paper, a little turned. The paper is light in every theme. */
export function WordSticker({
  word,
  mark,
  tilt = 0,
  small,
}: {
  word: string;
  /** Goes before the word, such as «✦» for a style the person wants to try. */
  mark?: string;
  tilt?: number;
  small?: boolean;
}) {
  return (
    <View
      style={[
        lifted,
        styles.sticker,
        small && styles.small,
        { transform: [{ rotate: `${tilt}deg` }] },
      ]}
    >
      {mark ? (
        <Text
          style={[
            styles.word,
            styles.mark,
            small && styles.smallWord,
            small && styles.smallMark,
          ]}
        >
          {mark}
        </Text>
      ) : null}
      <Text style={[styles.word, small && styles.smallWord]}>{word}</Text>
    </View>
  );
}

/**
 * A word to pick: a dashed gap with «+» until it is chosen, then the sticker goes on it with its
 * mark. Both measure the same, so choosing does not move the rest.
 */
export function WordChoice({
  word,
  mark,
  tilt,
  label,
  selected,
  onPress,
}: {
  word: string;
  mark?: string;
  tilt: number;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { palette } = useUI();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.72 }}
    >
      {selected ? (
        <WordSticker word={word} mark={mark ?? '✓'} tilt={tilt} small />
      ) : (
        <View style={[styles.sticker, styles.small, styles.gap]}>
          {/* The outline belongs to the theme; the sticker's paper does not. */}
          <View style={[styles.outline, { borderColor: palette.muted }]} />
          <Text
            style={[
              styles.word,
              styles.smallWord,
              styles.smallMark,
              { color: palette.muted },
            ]}
          >
            +
          </Text>
          <Text style={[styles.word, styles.smallWord, { color: palette.ink }]}>
            {word}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sticker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: STICKER_PAPER,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
  },
  small: {
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  gap: { backgroundColor: 'transparent' },
  outline: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  word: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: STICKER_INK,
  },
  smallWord: { fontSize: 17, letterSpacing: -0.3 },
  mark: { color: '#95462F' },
  smallMark: { width: 16, textAlign: 'center' },
});
