import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFeedback } from '../Feedback';
import { GarmentIllustration } from '../Garment';
import { useUI } from '../ui';

const CREW = [
  { kind: 'scarf', size: 62, lift: 34 },
  { kind: 'sneakers', size: 74, lift: -6 },
  { kind: 'tee', size: 136, lift: 0 },
  { kind: 'dress', size: 80, lift: 8 },
  { kind: 'jacket', size: 66, lift: 40 },
] as const;
const CREW_WIDTH = CREW.reduce((sum, { size }) => sum + size, 0);
const CONTENT_MAX = 560;
const GUTTERS = 48;

/** Decorative welcome: the illustrated garments greet the person and bob gently. */
export function Crew() {
  const { palette } = useUI();
  const { reduceMotion } = useFeedback();
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
      <View
        style={{
          backgroundColor: palette.white,
          borderColor: palette.line,
          borderWidth: 1,
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 14,
          paddingVertical: 8,
          marginBottom: 6,
        }}
      >
        <Text style={{ color: palette.ink, fontSize: 14, fontWeight: '600' }}>
          ¡Hola! Soy Tere.
        </Text>
      </View>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {CREW.map(({ kind, size, lift }, index) => (
          <Animated.View
            key={kind}
            style={{
              marginTop: lift * fit,
              transform: [
                {
                  translateY: bob.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, index % 2 ? 7 : -7],
                  }),
                },
              ],
            }}
          >
            <GarmentIllustration
              kind={kind}
              size={size * fit}
              ink={palette.green}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
