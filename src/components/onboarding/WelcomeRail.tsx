import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { WardrobeItem } from '../../domain';
import { HangingGarment } from '../ClosetRail';
import { useFeedback } from '../Feedback';
import { HANGING, LENGTH, RailWall, Rod, ROD_TOP } from '../rail';

/** Presentation-only rail for the welcome screen: example garments turning to the front one after another. */
export function WelcomeRail({ items }: { items: WardrobeItem[] }) {
  const { reduceMotion } = useFeedback();
  const hanging = items
    .filter((item) => HANGING.has(item.category))
    .slice(0, 5);
  const [front, setFront] = useState(Math.floor(hanging.length / 2));
  useEffect(() => {
    if (reduceMotion || hanging.length < 2) return;
    const timer = setInterval(
      () => setFront((current) => (current + 1) % hanging.length),
      2600,
    );
    return () => clearInterval(timer);
  }, [reduceMotion, hanging.length]);
  const height =
    ROD_TOP + Math.max(0, ...hanging.map((item) => LENGTH[item.category])) + 12;
  return (
    <RailWall height={height}>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', justifyContent: 'center', height }}
      >
        <Rod />
        {hanging.map((item, index) => (
          <HangingGarment
            key={item.id}
            item={item}
            position={index < front ? -1 : index > front ? 1 : 0}
            onPress={() => setFront(index)}
          />
        ))}
      </View>
    </RailWall>
  );
}
