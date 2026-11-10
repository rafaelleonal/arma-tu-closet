import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';
import type { WardrobeItem } from '../domain';
import { useFeedback } from './Feedback';
import { GarmentImage, ROD_TOP } from './rail';

/** Room a garment takes on the rod while it hangs edge-on. */
export const SIDE_WIDTH = 40;
/** Extra room around the garment that faces the viewer. */
export const FRONT_GAP = 24;

/** How far a garment is turned away while it hangs; the same way for all of them. */
const SIDE_TURN = '76deg';

/**
 * One garment on the rod. It hangs edge-on and turns to face the viewer when chosen. Every
 * garment hangs turned the same way, so choosing another one turns only two of them and the
 * ones in between just slide; if the two sides faced each other, those would flip through the
 * front and pile up on the way. Its place
 * and its turn are transforms, so the move runs on the native driver and nothing is laid out
 * again while it lasts. The touch area is a separate view that changes place at once.
 */
export function HangingGarment({
  item,
  chosen,
  x,
  width,
  height,
  room,
  onPress,
}: {
  item: WardrobeItem;
  chosen: boolean;
  /** Left edge of the garment on the rod, already centered in its room. */
  x: number;
  width: number;
  height: number;
  /** The stretch of rod that is this garment's, where a touch chooses it. */
  room: { left: number; width: number };
  onPress: () => void;
}) {
  const { reduceMotion } = useFeedback();
  const [turn] = useState(() => new Animated.Value(chosen ? 0 : 1));
  const [slide] = useState(() => new Animated.Value(x));
  useEffect(() => {
    turn.stopAnimation();
    slide.stopAnimation();
    if (reduceMotion) {
      turn.setValue(chosen ? 0 : 1);
      slide.setValue(x);
      return;
    }
    const timing = {
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    };
    const animation = Animated.parallel([
      Animated.timing(turn, { ...timing, toValue: chosen ? 0 : 1 }),
      Animated.timing(slide, { ...timing, toValue: x }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [chosen, x, reduceMotion, turn, slide]);
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height: ROD_TOP + height,
          zIndex: chosen ? 2 : 1,
          transform: [{ translateX: slide }],
        }}
      >
        <Animated.View
          style={{
            width,
            height,
            marginTop: ROD_TOP - 10,
            opacity: item.available ? 1 : 0.4,
            transform: [
              { perspective: 1400 },
              {
                rotateY: turn.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', SIDE_TURN],
                }),
              },
            ],
          }}
        >
          <GarmentImage item={item} width={width} height={height} />
        </Animated.View>
      </Animated.View>
      {/* Outside the moving view: a press is measured where the layout says the button is. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}${item.available ? '' : ', en lavandería'}`}
        accessibilityState={{ selected: chosen }}
        onPress={onPress}
        style={{
          position: 'absolute',
          top: 0,
          left: room.left,
          width: room.width,
          height: ROD_TOP + height,
          zIndex: 3,
        }}
      />
    </>
  );
}
