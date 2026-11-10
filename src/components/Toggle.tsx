import React from 'react';
import { Platform, Switch } from 'react-native';
import { useUI } from './ui';

/**
 * On web the switch draws no track when it is off and a teal thumb when it is on, whatever the
 * theme. The thumb is white there, as it already is on a phone.
 */
const WEB_THUMB =
  Platform.OS === 'web'
    ? { thumbColor: '#FFFFFF', activeThumbColor: '#FFFFFF' }
    : {};

/** The app's switch: on in the theme's green, off in its line color. */
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { palette } = useUI();
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={
        Platform.OS === 'web'
          ? { true: palette.green, false: palette.line }
          : { true: palette.green }
      }
      {...WEB_THUMB}
    />
  );
}
