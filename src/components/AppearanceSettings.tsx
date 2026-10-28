import React from 'react';
import { Platform, Pressable, Switch, Text, View } from 'react-native';
import type { LocalData } from '../storage/schema';
import { getTheme, THEME_OPTIONS } from '../theme/ThemeProvider';
import { Chip, FieldLabel, useUI } from './ui';
import { useFeedback } from './Feedback';
import { GarmentIllustration } from './Garment';

type Appearance = LocalData['appearance'];

export interface AppearanceSettingsProps {
  value: Appearance;
  onChange: (next: Appearance) => void;
  compact?: boolean;
}

/** These are rendered app elements in each palette, not screenshots. */
export function AppearanceSettings({
  value,
  onChange,
  compact = false,
}: AppearanceSettingsProps) {
  const { s, palette } = useUI();
  return (
    <View>
      {!compact ? (
        <Text
          style={{
            color: palette.ink,
            fontSize: 20,
            letterSpacing: -0.5,
            marginBottom: 18,
          }}
        >
          Apariencia
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {THEME_OPTIONS.map((option) => (
          <ThemeCard
            key={option.id}
            option={option}
            selected={value.themeId === option.id}
            value={value}
            onSelect={() => onChange({ ...value, themeId: option.id })}
          />
        ))}
      </View>
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

/** A small rendered Hoy screen in the theme's palette. */
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
  const preview = getTheme(option.id);
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
        flexBasis: 120,
        flexGrow: 1,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? palette.ink : palette.line,
        backgroundColor: palette.white,
        borderRadius: 17,
        padding: selected ? 8 : 9,
        minHeight: 205,
      }}
    >
      <View
        style={{
          backgroundColor: preview.paper,
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: preview.line,
        }}
      >
        <View
          style={{
            padding: 11,
            paddingBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: preview.ink,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            Hoy
          </Text>
          <View
            style={{
              width: 5,
              height: 5,
              backgroundColor: preview.green,
              borderRadius: 4,
            }}
          />
        </View>
        <View
          style={{
            marginHorizontal: 9,
            padding: 9,
            borderRadius: 7,
            backgroundColor: preview.sand,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: preview.ink, fontSize: 8 }}>22°</Text>
          <Text style={{ color: preview.rust, fontSize: 8 }}>Cambiar</Text>
        </View>
        <View
          style={{
            margin: 9,
            backgroundColor: preview.art,
            borderRadius: 8,
            padding: value.outfitLayout === 'compact' ? 7 : 12,
            minHeight: value.outfitLayout === 'compact' ? 47 : 65,
            flexDirection: 'row',
            gap: 9,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GarmentIllustration ink={preview.green} kind="tee" size={31} />
          <GarmentIllustration ink={preview.green} kind="trousers" size={31} />
          <GarmentIllustration ink={preview.green} kind="sneakers" size={31} />
        </View>
        <View
          style={{
            height: 5,
            width: '58%',
            backgroundColor: preview.ink,
            opacity: 0.7,
            borderRadius: 4,
            marginLeft: 11,
          }}
        />
        {value.showReasons ? (
          <Text
            style={{
              marginLeft: 11,
              marginTop: 5,
              color: preview.muted,
              fontSize: 7,
            }}
          >
            3 prendas
          </Text>
        ) : null}
        <View
          style={{
            margin: 10,
            borderRadius: 6,
            backgroundColor: preview.ink,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: preview.onInk,
              fontSize: 8,
            }}
          >
            Lo usé hoy
          </Text>
        </View>
      </View>
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
