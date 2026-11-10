import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUI } from './ui';

/** Two or three exclusive views of the same thing, as tabs in one track. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  const { palette } = useUI();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: palette.wash }]}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onChange(option.id)}
            style={[
              styles.tab,
              { backgroundColor: selected ? palette.white : 'transparent' },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                color: palette.ink,
                fontWeight: selected ? '600' : '400',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: 14, padding: 5, flexDirection: 'row' },
  tab: {
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
