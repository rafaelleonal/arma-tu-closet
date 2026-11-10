import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { useUI } from './ui';

/**
 * The dotted paper behind the stickers. Fills its parent. The drawing is
 * sized in points from the measured box: a percentage leaves a padded parent's padding out on
 * native and does not follow a parent that grows after it mounts.
 */
export function Dots() {
  const { palette } = useUI();
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize((current) =>
          current.width === width && current.height === height
            ? current
            : { width, height },
        );
      }}
    >
      {size.width && size.height ? (
        <Svg width={size.width} height={size.height} aria-hidden>
          <Defs>
            <Pattern
              id="dots"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <Circle cx="2" cy="2" r="1" fill={palette.line} />
            </Pattern>
          </Defs>
          <Rect width={size.width} height={size.height} fill="url(#dots)" />
        </Svg>
      ) : null}
    </View>
  );
}
