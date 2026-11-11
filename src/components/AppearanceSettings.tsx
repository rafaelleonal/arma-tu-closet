import React, { useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import type { LocalData } from '../storage/schema';
import { getTheme, THEME_OPTIONS } from '../theme/ThemeProvider';
import { Chip, FieldLabel, useUI } from './ui';
import { Toggle } from './Toggle';
import { useFeedback } from './Feedback';
import { ThemePreview } from './ThemePreview';
import { useCopy } from '../i18n';

type Appearance = LocalData['appearance'];

const CARD_WIDTH = 136;
const CARD_GAP = 12;
/** How much of the previous theme stays in view when the row opens on the one in use. */
const CARD_PEEK = 44;

export interface AppearanceSettingsProps {
  value: Appearance;
  onChange: (next: Appearance) => void;
  /** Horizontal padding of the screen, so the themes scroll from edge to edge. */
  bleed?: number;
}

/** The themes in a row that scrolls; each card is a small Hoy screen drawn in its palette. */
export function ThemeRow({
  value,
  onChange,
  bleed = 0,
}: AppearanceSettingsProps) {
  const themes = useRef<ScrollViewInstance>(null);
  const placed = useRef(false);
  return (
    <ScrollView
      ref={themes}
      horizontal
      // Opens on the theme in use, with a little of the one before it in view.
      onLayout={() => {
        if (placed.current) return;
        placed.current = true;
        const index = THEME_OPTIONS.findIndex(
          (option) => option.id === value.themeId,
        );
        if (index > 0)
          themes.current?.scrollTo({
            x: index * (CARD_WIDTH + CARD_GAP) - CARD_PEEK,
            animated: false,
          });
      }}
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -bleed }}
      contentContainerStyle={{ gap: CARD_GAP, paddingHorizontal: bleed }}
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
  );
}

/** Theme, layout, reasons and haptics: what Ajustes offers about how the app looks and feels. */
export function AppearanceSettings({
  value,
  onChange,
  bleed = 0,
}: AppearanceSettingsProps) {
  const { s, palette } = useUI();
  const t = useCopy();
  return (
    <View>
      <ThemeRow value={value} onChange={onChange} bleed={bleed} />
      <FieldLabel>{t.appearance.layout}</FieldLabel>
      <View style={s.wrap}>
        <Chip
          label={t.appearance.wide}
          selected={value.outfitLayout === 'editorial'}
          onPress={() => onChange({ ...value, outfitLayout: 'editorial' })}
        />
        <Chip
          label={t.appearance.compact}
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
            {t.appearance.reasons}
          </Text>
          <Text
            style={[s.subtitle, { fontSize: 11, lineHeight: 17, marginTop: 4 }]}
          >
            {t.appearance.warningsStay}
          </Text>
        </View>
        <Toggle
          label={t.appearance.reasonsToggle}
          value={value.showReasons}
          onChange={(showReasons) => onChange({ ...value, showReasons })}
        />
      </View>
      {Platform.OS !== 'web' ? (
        <View
          style={[s.row, { justifyContent: 'space-between', marginTop: 24 }]}
        >
          <Text style={{ color: palette.ink, fontSize: 13 }}>
            {t.appearance.haptics}
          </Text>
          <Toggle
            label={t.appearance.haptics}
            value={value.hapticsEnabled !== false}
            onChange={(hapticsEnabled) =>
              onChange({ ...value, hapticsEnabled })
            }
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
  const t = useCopy();
  const feedback = useFeedback();
  const name = t.themes[option.id];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.appearance.themeLabel(name)}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={() => {
        if (selected) return;
        feedback.selection();
        onSelect();
      }}
      style={{
        width: CARD_WIDTH,
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
          {name}
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
