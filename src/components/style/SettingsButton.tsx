import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useUI } from '../ui';

const SIZE = 44;

/** Round button with two sliders: opens the settings that are not about the person's style. */
export function SettingsButton({ onPress }: { onPress: () => void }) {
  const { palette } = useUI();
  const stroke = {
    stroke: palette.ink,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajustes"
      onPress={onPress}
      style={({ pressed }) => ({
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: palette.line,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
        <Line x1={2} y1={6} x2={18} y2={6} {...stroke} />
        <Circle cx={13} cy={6} r={2.6} fill={palette.white} {...stroke} />
        <Line x1={2} y1={14} x2={18} y2={14} {...stroke} />
        <Circle cx={7} cy={14} r={2.6} fill={palette.white} {...stroke} />
      </Svg>
    </Pressable>
  );
}
