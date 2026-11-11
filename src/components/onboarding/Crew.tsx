import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { Bubble } from '../Bubble';
import { useFeedback } from '../Feedback';
import { CrewSticker } from './CrewSticker';
import { useCopy } from '../../i18n';

const CREW = [
  { kind: 'scarf', size: 66, lift: 40, tilt: -8 },
  { kind: 'sneakers', size: 86, lift: 4, tilt: 6 },
  { kind: 'tee', size: 150, lift: 0, tilt: -3 },
  { kind: 'dress', size: 88, lift: 12, tilt: 5 },
  { kind: 'jacket', size: 78, lift: 46, tilt: -6 },
] as const;
/** They overlap a little, like stickers put down by hand. */
const OVERLAP = 26;
const CREW_WIDTH =
  CREW.reduce((sum, { size }) => sum + size, 0) - OVERLAP * (CREW.length - 1);
const CONTENT_MAX = 560;
const GUTTERS = 48;

/** Decorative welcome: the garments greet the person as stickers and bob gently. */
export function Crew() {
  const { reduceMotion } = useFeedback();
  const t = useCopy();
  const { width } = useWindowDimensions();
  const fit = Math.min(
    1,
    (Math.min(width, CONTENT_MAX) - GUTTERS) / CREW_WIDTH,
  );
  const [bob] = useState(() => new Animated.Value(0));
  useEffect(() => {
    bob.setValue(0);
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence(
        [1, 0].map((toValue) =>
          Animated.timing(bob, {
            toValue,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ),
      ),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, bob]);
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ marginBottom: 14 }}>
        <Bubble>{t.onboarding.crewHello}</Bubble>
      </View>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {CREW.map(({ kind, size, lift, tilt }, index) => (
          <Animated.View
            key={kind}
            style={{
              marginTop: lift * fit,
              marginLeft: index ? -OVERLAP * fit : 0,
              zIndex: kind === 'tee' ? 1 : 0,
              transform: [
                {
                  translateY: bob.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, index % 2 ? 7 : -7],
                  }),
                },
                { rotate: `${tilt}deg` },
              ],
            }}
          >
            <CrewSticker kind={kind} size={size * fit} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
