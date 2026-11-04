import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

export function AppLogo({ size = 44 }: { size?: number }) {
  const { palette } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="18 28 182 182" accessible={false}>
      <Path
        d="M83 79c0-14 11-25 26-25s26 11 26 25c0 9-4 15-13 21l-12 8v9m0 0-73 42c-12 7-7 25 7 25h132c14 0 19-18 7-25l-73-42Z"
        fill="none"
        stroke={palette.ink}
        strokeWidth={13}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M164 62h27m-13.5-13.5v27"
        fill="none"
        stroke={palette.green}
        strokeWidth={9}
        strokeLinecap="round"
      />
    </Svg>
  );
}
