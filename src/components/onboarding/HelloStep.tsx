import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { CityPicker } from '../CityPicker';
import { Chip, FieldLabel, useUI } from '../ui';
import { Guide } from './Guide';
import type { StepProps } from './types';
import { useCopy } from '../../i18n';

export const STRUGGLES = ['decide', 'colors', 'weather', 'style'] as const;
export type Struggle = (typeof STRUGGLES)[number];

/** The answer is not stored: it only decides what this run shows and turns on. */
export function HelloStep({
  data,
  onChange,
  struggle,
  onStruggle,
}: StepProps & {
  struggle?: Struggle;
  onStruggle: (value: Struggle) => void;
}) {
  const { s, palette } = useUI();
  const t = useCopy();
  const copy = t.onboarding;
  const reply = struggle ? copy.struggles[struggle].reply : undefined;
  const name = data.profile.name.trim();
  const automatic = data.weather.mode === 'automatic';
  return (
    <>
      <Guide kind="tee" say={copy.helloSay(name)} title={copy.nameTitle} />
      <TextInput
        accessibilityLabel={copy.nameLabel}
        placeholder={copy.namePlaceholder}
        placeholderTextColor={palette.muted}
        value={data.profile.name}
        onChangeText={(name) =>
          onChange({ profile: { ...data.profile, name } })
        }
        maxLength={40}
        autoComplete="given-name"
        style={s.input}
      />
      <FieldLabel>{copy.struggleQuestion}</FieldLabel>
      <View style={s.wrap}>
        {STRUGGLES.map((id) => (
          <Chip
            key={id}
            label={copy.struggles[id].label}
            selected={struggle === id}
            onPress={() => onStruggle(id)}
          />
        ))}
      </View>
      {reply ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[s.subtitle, { fontSize: 13, marginTop: 14 }]}
        >
          {reply}
        </Text>
      ) : null}
      {struggle === 'weather' || automatic ? (
        <>
          <FieldLabel>{copy.cityTitle}</FieldLabel>
          <CityPicker
            value={automatic ? data.weather.location : undefined}
            onSelect={(place) =>
              onChange({
                weather: {
                  mode: 'automatic',
                  location: place,
                  // A cached forecast only applies to the same city.
                  snapshot:
                    data.weather.location?.id === place.id
                      ? data.weather.snapshot
                      : undefined,
                },
              })
            }
          />
        </>
      ) : null}
    </>
  );
}
