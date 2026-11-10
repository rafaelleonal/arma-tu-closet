import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import type { LocalData } from '../storage/schema';
import { getTheme, THEME_OPTIONS } from '../theme/ThemeProvider';
import { Chip, FieldLabel, useUI } from './ui';
import { useFeedback } from './Feedback';
import { ThemePreview } from './ThemePreview';

type Appearance = LocalData['appearance'];

export interface AppearanceSettingsProps {
  value: Appearance;
  onChange: (next: Appearance) => void;
  /** Horizontal padding of the screen, so the themes scroll from edge to edge. */
  bleed?: number;
}

/** These are rendered app elements in each palette, not screenshots. */
export function AppearanceSettings({
  value,
  onChange,
  bleed = 0,
}: AppearanceSettingsProps) {
  const { s, palette } = useUI();
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -bleed }}
        contentContainerStyle={{ gap: 12, paddingHorizontal: bleed }}
      >
        {THEME_OPTIONS.map((option) => (
          <ThemeCard
            key={option.id}
            option={option}
            selected={value.themeId === option.id}
            value={value}
            onSelect={() => onChange({ ...value, themeId: option.id })}
          />
        ))}
      </ScrollView>
      <FieldLabel>Vista</FieldLabel>
      <View style={s.wrap}>
        <Chip
          label="Amplia"
          selected={value.outfitLayout === 'editorial'}
          onPress={() => onChange({ ...value, outfitLayout: 'editorial' })}
        />
        <Chip
          label="Compacta"
          selected={value.outfitLayout === 'compact'}
          onPress={() => onChange({ ...value, outfitLayout: 'compact' })}
        />
      </View>
      <View
        style={[
          s.row,
          { justifyContent: 'space-between', marginTop: 24, gap: 20 },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.ink, fontSize: 13, fontWeight: '500' }}>
            Explicaciones
          </Text>
          <Text
            style={[s.subtitle, { fontSize: 11, lineHeight: 17, marginTop: 4 }]}
          >
            Las advertencias siguen visibles.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Mostrar explicaciones de conjuntos"
          value={value.showReasons}
          onValueChange={(showReasons) => onChange({ ...value, showReasons })}
          trackColor={{ true: palette.green }}
        />
      </View>
      {Platform.OS !== 'web' ? (
        <View
          style={[s.row, { justifyContent: 'space-between', marginTop: 24 }]}
        >
          <Text style={{ color: palette.ink, fontSize: 13 }}>Vibración</Text>
          <Switch
            accessibilityLabel="Vibración"
            value={value.hapticsEnabled !== false}
            onValueChange={(hapticsEnabled) =>
              onChange({ ...value, hapticsEnabled })
            }
            trackColor={{ true: palette.green }}
          />
        </View>
      ) : null}
    </View>
  );
}

/** A theme to choose, shown as a small Hoy screen in its palette. */
function ThemeCard({
  option,
  selected,
  value,
  onSelect,
}: {
  option: (typeof THEME_OPTIONS)[number];
  selected: boolean;
  value: Appearance;
  onSelect: () => void;
}) {
  const { palette } = useUI();
  const feedback = useFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tema ${option.name}`}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={() => {
        if (selected) return;
        feedback.selection();
        onSelect();
      }}
      style={{
        width: 136,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? palette.ink : palette.line,
        backgroundColor: palette.white,
        borderRadius: 17,
        padding: selected ? 8 : 9,
      }}
    >
      <ThemePreview
        preview={getTheme(option.id)}
        compact={value.outfitLayout === 'compact'}
        showReasons={value.showReasons}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 5,
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <Text
          style={{
            color: palette.ink,
            fontSize: 13,
            fontWeight: '600',
          }}
        >
          {option.name}
        </Text>
        <Text
          style={{
            color: selected ? palette.green : palette.muted,
            fontSize: 13,
          }}
        >
          {selected ? '✓' : '○'}
        </Text>
      </View>
    </Pressable>
  );
}
