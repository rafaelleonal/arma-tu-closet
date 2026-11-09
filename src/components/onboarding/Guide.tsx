import React, { useEffect, useState } from 'react';
import { Animated, Platform, Text, View } from 'react-native';
import { useFeedback } from '../Feedback';
import { GarmentIllustration } from '../Garment';
import { useUI } from '../ui';

type GuideKind = React.ComponentProps<typeof GarmentIllustration>['kind'];

/** A named garment comments in a small bubble; the question stands alone as the step's heading. */
export function Guide({
  kind,
  say,
  title,
}: {
  kind: GuideKind;
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <GarmentIllustration kind={kind} size={52} ink={palette.green} />
        <Animated.View
          style={{
            flexShrink: 1,
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
          <View
            style={{
              backgroundColor: palette.white,
              borderColor: palette.line,
              borderWidth: 1,
              borderRadius: 16,
              borderBottomLeftRadius: 4,
              paddingHorizontal: 13,
              paddingVertical: 9,
            }}
          >
            <Text style={{ color: palette.ink, fontSize: 13, lineHeight: 18 }}>
              {say}
            </Text>
          </View>
        </Animated.View>
      </View>
      <Text
        accessibilityRole="header"
        style={{
          color: palette.ink,
          fontSize: 30,
          lineHeight: 35,
          fontWeight: '600',
          letterSpacing: -1,
          marginTop: 16,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
