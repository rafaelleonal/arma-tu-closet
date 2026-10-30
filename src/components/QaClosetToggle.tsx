import React, { useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { qaCloset, type QaClosetMode } from '../domain/qaCloset';

export type QaMode = QaClosetMode | 'stored';

const MODES: { mode: QaMode; label: string }[] = [
  { mode: 'stored', label: 'Actual' },
  { mode: 'worst', label: 'Peor caso' },
  { mode: 'empty', label: 'Vacío' },
  { mode: 'one', label: 'Una' },
  { mode: 'many', label: '400' },
  { mode: 'demoEdited', label: 'Ejemplo' },
];
const PARAM = 'closet';
const web = Platform.OS === 'web' && typeof window !== 'undefined';

function initialMode(): QaMode {
  if (!__DEV__ || !web) return 'stored';
  const value = new URLSearchParams(window.location.search).get(PARAM);
  return MODES.find((option) => option.mode === value)?.mode ?? 'stored';
}

/**
 * Development only: replaces the garments Mi clóset shows with a stress-test closet. `items` is
 * null for the stored closet. On web the choice lives in `?closet=` so a reload keeps it.
 */
export function useQaCloset() {
  const [mode, setMode] = useState<QaMode>(initialMode);
  const items = useMemo(
    () => (mode === 'stored' ? null : qaCloset(mode)),
    [mode],
  );
  function change(next: QaMode) {
    setMode(next);
    if (!web) return;
    const url = new URL(window.location.href);
    if (next === 'stored') url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, next);
    window.history.replaceState(null, '', url);
  }
  return { enabled: __DEV__, mode, items, setMode: change };
}

/** Plain, theme-independent chrome: it is a test tool, not part of the design under test. */
export function QaClosetToggle({
  mode,
  onChange,
}: {
  mode: QaMode;
  onChange: (mode: QaMode) => void;
}) {
  if (!__DEV__) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 12,
        alignItems: 'center',
      }}
    >
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Datos de prueba del clóset"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '94%',
          gap: 2,
          padding: 3,
          borderRadius: 10,
          backgroundColor: '#e4e4e7',
        }}
      >
        {MODES.map((option) => {
          const selected = option.mode === mode;
          return (
            <Pressable
              key={option.mode}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option.mode)}
              style={{
                paddingHorizontal: 9,
                paddingVertical: 7,
                borderRadius: 8,
                backgroundColor: selected ? '#ffffff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 12, color: '#18181b' }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
