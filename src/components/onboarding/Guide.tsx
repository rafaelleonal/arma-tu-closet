import React, { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Bubble } from '../Bubble';
import { useFeedback } from '../Feedback';
import { Dots } from '../rail';
import { useUI } from '../ui';
import { CrewSticker, type CrewKind } from './CrewSticker';

/** Same as the horizontal padding of the step, so the dotted band reaches both edges. */
const BLEED = 24;

/** A named garment comments in a bubble; the question stands alone as the step's heading. */
export function Guide({
  kind,
  say,
  title,
}: {
  kind: CrewKind;
  say: string;
  title: string;
}) {
  const { palette } = useUI();
  const { reduceMotion } = useFeedback();
  const [progress] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.spring(progress, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, progress]);
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={styles.band}>
        <Dots />
        <CrewSticker
          kind={kind}
          size={84}
          style={{ transform: [{ rotate: '-5deg' }] }}
        />
        <Animated.View
          style={{
            flex: 1,
            alignItems: 'flex-start',
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          }}
        >
          <Bubble tail="left">{say}</Bubble>
        </Animated.View>
      </View>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: palette.ink }]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: -BLEED,
    paddingHorizontal: BLEED,
    paddingVertical: 18,
    minHeight: 120,
  },
  title: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '600',
    letterSpacing: -1,
    marginTop: 14,
  },
});
