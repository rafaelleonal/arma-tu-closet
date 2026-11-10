import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, type ViewStyle } from 'react-native';
import { useFeedback } from './Feedback';

const DURATION = 280;
/** Wait between one sticker and the next, so a group lands in order. */
const STEP = 60;
/** Later stickers land with this one: a long group must not keep the person waiting. */
const LAST = 6;

/**
 * A sticker being put down: it arrives a little bigger and turned, and settles. It plays once,
 * when the sticker first shows, and not at all with Reduce Motion. It wraps only what is drawn;
 * the button around it keeps its place, so touches land where the sticker ends up.
 */
export function StickerIn({
  order = 0,
  style,
  children,
}: {
  /** Position in its group; each one lands a moment after the one before. */
  order?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const { reduceMotion } = useFeedback();
  const [progress] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    // Already down when the preference arrives late: animating to where it is does nothing.
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      delay: Math.min(order, LAST) * STEP,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, order, progress]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: [0, 1, 1],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1.14, 1],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['5deg', '0deg'],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
