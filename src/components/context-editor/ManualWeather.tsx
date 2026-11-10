import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { Palette } from '../../theme/ThemeProvider';
import { useUI } from '../ui';

export const MIN_TEMPERATURE = -30;
export const MAX_TEMPERATURE = 55;

/** A press changes the value once; holding it keeps changing it. */
function useHold(step: () => void) {
  const latest = useRef(step);
  const timers = useRef<{
    wait?: ReturnType<typeof setTimeout>;
    repeat?: ReturnType<typeof setInterval>;
  }>({});
  useEffect(() => {
    latest.current = step;
  });
  function stop() {
    clearTimeout(timers.current.wait);
    clearInterval(timers.current.repeat);
    timers.current = {};
  }
  useEffect(() => stop, []);
  return {
    onPress: () => latest.current(),
    onLongPress: () => {
      stop();
      timers.current.repeat = setInterval(() => latest.current(), 90);
    },
    onPressOut: stop,
  };
}

function StepButton({
  sign,
  label,
  disabled,
  onStep,
}: {
  sign: string;
  label: string;
  disabled: boolean;
  onStep: () => void;
}) {
  const { palette } = useUI();
  const styles = createStyles(palette);
  const hold = useHold(onStep);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      delayLongPress={350}
      {...hold}
      style={({ pressed }) => [
        styles.step,
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={styles.sign}>{sign}</Text>
    </Pressable>
  );
}

/**
 * The weather the person sets by hand: a temperature and whether it rains. It is today's weather
 * in manual mode and the fallback when the automatic one has no recent reading.
 */
export function ManualWeather({
  temperatureC,
  raining,
  onTemperature,
  onRaining,
}: {
  temperatureC: number;
  raining: boolean;
  /** Receives the change, so a held button always adds to the latest value. */
  onTemperature: (delta: number) => void;
  onRaining: (raining: boolean) => void;
}) {
  const { palette } = useUI();
  const styles = createStyles(palette);
  const degrees = Math.round(temperatureC);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Temperatura</Text>
        <View style={styles.stepper}>
          <StepButton
            sign="−"
            label="Bajar la temperatura"
            disabled={degrees <= MIN_TEMPERATURE}
            onStep={() => onTemperature(-1)}
          />
          <Text
            accessibilityLabel={`${degrees} grados Celsius`}
            accessibilityLiveRegion="polite"
            style={styles.value}
          >
            {degrees}°
          </Text>
          <StepButton
            sign="+"
            label="Subir la temperatura"
            disabled={degrees >= MAX_TEMPERATURE}
            onStep={() => onTemperature(1)}
          />
        </View>
      </View>
      <View style={[styles.row, styles.divided]}>
        <Text style={styles.label}>Lluvia</Text>
        <Switch
          accessibilityLabel="Hay lluvia"
          value={raining}
          onValueChange={onRaining}
          trackColor={{ true: palette.green }}
        />
      </View>
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.white,
      paddingHorizontal: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      gap: 12,
    },
    // Padding, not a minimum height: with one, the native switch sat above the row's middle.
    divided: {
      borderTopWidth: 1,
      borderTopColor: palette.line,
      paddingVertical: 14,
    },
    label: { fontSize: 15, color: palette.ink },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    step: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: palette.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sign: { fontSize: 20, lineHeight: 24, color: palette.ink },
    value: {
      minWidth: 52,
      textAlign: 'center',
      fontSize: 20,
      letterSpacing: -0.4,
      color: palette.ink,
    },
  });
