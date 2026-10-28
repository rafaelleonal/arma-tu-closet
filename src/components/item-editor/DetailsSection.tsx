import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import {
  OCCASIONS,
  occasionLabels,
  STYLE_OPTIONS,
  type Occasion,
  type StyleId,
} from '../../domain';
import { Chip, FieldLabel, useUI } from '../ui';

export const warmthLabels = [
  'Muy ligera',
  'Ligera',
  'Abrigadora',
  'Muy abrigadora',
] as const;
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
}: {
  value: Details;
  onChange: (patch: Partial<Details>) => void;
  onWarmthChosen: () => void;
  open: boolean;
  onToggle: () => void;
  occasionError?: string;
}) {
  const { palette, s } = useUI();
  const [styleNotice, setStyleNotice] = useState('');
  const { occasions, warmth, rainReady, styleIds } = value;
  const summary = [
    occasions.map((item) => occasionLabels[item]).join(', ') || 'Sin ocasión',
    warmthLabels[warmth],
    rainReady ? 'Para lluvia' : '',
    styleIds.length
      ? `${styleIds.length} ${styleIds.length === 1 ? 'estilo' : 'estilos'}`
      : '',
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
        accessibilityLabel={`Más detalles: ${summary}`}
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
            Más detalles
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
          <Text style={[s.subtitle, { fontSize: 12 }]}>
            Afinan las sugerencias. Puedes dejarlos como están.
          </Text>
          <FieldLabel>¿Para qué la usas?</FieldLabel>
          <View style={s.wrap}>
            {OCCASIONS.map((item) => (
              <Chip
                key={item}
                label={occasionLabels[item]}
                selected={occasions.includes(item)}
                onPress={() => onChange({ occasions: toggle(occasions, item) })}
              />
            ))}
          </View>
          {errorText(occasionError)}
          <FieldLabel>Qué tanto abriga</FieldLabel>
          <View style={s.wrap}>
            {warmthLabels.map((label, index) => (
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
            <Text style={{ color: palette.ink, flex: 1 }}>
              La uso cuando llueve
            </Text>
            <Switch
              accessibilityLabel="Apta para lluvia"
              value={rainReady}
              onValueChange={(next) => onChange({ rainReady: next })}
              trackColor={{ true: palette.green }}
            />
          </View>
          <FieldLabel>Estilos · opcional</FieldLabel>
          <Text style={[s.subtitle, { fontSize: 11, marginBottom: 12 }]}>
            Hasta 3.
          </Text>
          <View style={s.wrap}>
            {STYLE_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={styleIds.includes(option.id)}
                onPress={() => {
                  if (!styleIds.includes(option.id) && styleIds.length >= 3) {
                    setStyleNotice(
                      'Elige hasta tres estilos. Quita uno para probar otro.',
                    );
                    return;
                  }
                  setStyleNotice('');
                  onChange({ styleIds: toggle(styleIds, option.id) });
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
