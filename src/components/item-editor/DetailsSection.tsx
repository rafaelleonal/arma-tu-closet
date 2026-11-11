import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  OCCASIONS,
  STYLE_IDS,
  type Occasion,
  type StyleId,
} from '../../domain';
import { Chip, FieldLabel, useUI } from '../ui';
import { Toggle } from '../Toggle';
import { useCopy } from '../../i18n';

export type Warmth = 0 | 1 | 2 | 3;

export interface Details {
  occasions: Occasion[];
  warmth: Warmth;
  rainReady: boolean;
  styleIds: StyleId[];
}

function toggle<T>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/** Optional signals that refine suggestions, collapsed behind a summary. */
export function DetailsSection({
  value,
  onChange,
  onWarmthChosen,
  open,
  onToggle,
  occasionError,
  name,
}: {
  value: Details;
  onChange: (patch: Partial<Details>) => void;
  onWarmthChosen: () => void;
  open: boolean;
  onToggle: () => void;
  occasionError?: string;
  /** The name field; it is optional, so it lives with the other refinements. */
  name: React.ReactNode;
}) {
  const { palette, s } = useUI();
  const t = useCopy();
  const copy = t.itemEditor;
  const [styleNotice, setStyleNotice] = useState('');
  const { occasions, warmth, rainReady, styleIds } = value;
  const summary = [
    occasions.map((item) => t.occasions[item]).join(', ') || copy.noOccasion,
    copy.warmth[warmth],
    rainReady ? copy.forRain : '',
    styleIds.length ? copy.styleCount(styleIds.length) : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const errorText = (message?: string) =>
    message ? (
      <Text
        accessibilityRole="alert"
        style={{ color: palette.rust, marginTop: 8, fontSize: 12 }}
      >
        {message}
      </Text>
    ) : null;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        accessibilityLabel={`${copy.moreDetails}: ${summary}`}
        onPress={onToggle}
        style={{
          minHeight: 64,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 14,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.ink, fontSize: 15, fontWeight: '600' }}>
            {copy.moreDetails}
          </Text>
          <Text
            numberOfLines={2}
            style={[s.subtitle, { fontSize: 12, lineHeight: 18, marginTop: 3 }]}
          >
            {summary}
          </Text>
        </View>
        <Text
          style={{
            color: palette.ink,
            fontSize: 20,
            width: 24,
            textAlign: 'center',
          }}
        >
          {open ? '−' : '+'}
        </Text>
      </Pressable>
      {open ? null : errorText(occasionError)}
      {open ? (
        <>
          {name}
          <FieldLabel>{copy.usedFor}</FieldLabel>
          <View style={s.wrap}>
            {OCCASIONS.map((item) => (
              <Chip
                key={item}
                label={t.occasions[item]}
                selected={occasions.includes(item)}
                onPress={() => onChange({ occasions: toggle(occasions, item) })}
              />
            ))}
          </View>
          {errorText(occasionError)}
          <FieldLabel>{copy.warmthTitle}</FieldLabel>
          <View style={s.wrap}>
            {copy.warmth.map((label, index) => (
              <Chip
                key={label}
                label={label}
                selected={warmth === index}
                onPress={() => {
                  onWarmthChosen();
                  onChange({ warmth: index as Warmth });
                }}
              />
            ))}
          </View>
          <View
            style={[s.row, { justifyContent: 'space-between', marginTop: 22 }]}
          >
            <Text style={{ color: palette.ink, flex: 1 }}>{copy.rainUse}</Text>
            <Toggle
              label={copy.rainReady}
              value={rainReady}
              onChange={(next) => onChange({ rainReady: next })}
            />
          </View>
          <FieldLabel>{copy.stylesTitle}</FieldLabel>
          <Text style={[s.subtitle, { fontSize: 11, marginBottom: 12 }]}>
            {copy.upToThree}
          </Text>
          <View style={s.wrap}>
            {STYLE_IDS.map((id) => (
              <Chip
                key={id}
                label={t.styles[id].label}
                selected={styleIds.includes(id)}
                onPress={() => {
                  if (!styleIds.includes(id) && styleIds.length >= 3) {
                    setStyleNotice(copy.tooManyStyles);
                    return;
                  }
                  setStyleNotice('');
                  onChange({ styleIds: toggle(styleIds, id) });
                }}
              />
            ))}
          </View>
          {styleNotice ? (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: palette.rust, fontSize: 11, marginTop: 10 }}
            >
              {styleNotice}
            </Text>
          ) : null}
        </>
      ) : null}
    </>
  );
}
