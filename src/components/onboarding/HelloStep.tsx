import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { CityPicker } from '../CityPicker';
import { Chip, FieldLabel, useUI } from '../ui';
import { Guide } from './Guide';
import type { StepProps } from './types';

export const STRUGGLES = [
  {
    id: 'decide',
    label: 'Me tardo mucho en decidir',
    reply: 'De eso me encargo: cada día te propongo hasta tres outfits.',
  },
  {
    id: 'colors',
    label: 'Me cuesta combinar colores',
    reply: 'En un momento me dices cuáles te gustan y cuáles evitar.',
  },
  {
    id: 'weather',
    label: 'Nunca le atino al clima',
    reply: 'Dime tu ciudad y ajusto el abrigo al clima de hoy.',
  },
  {
    id: 'style',
    label: 'Quiero cambiar de estilo',
    reply: 'Cuéntame cómo quieres verte y armamos hacia allá.',
  },
] as const;
export type Struggle = (typeof STRUGGLES)[number]['id'];

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
  const reply = STRUGGLES.find((option) => option.id === struggle)?.reply;
  const name = data.profile.name.trim();
  const automatic = data.weather.mode === 'automatic';
  return (
    <>
      <Guide
        kind="tee"
        say={
          name
            ? `Mucho gusto, ${name}. Soy Tere.`
            : '¡Hola! Soy Tere, tu playera.'
        }
        title="¿Cómo te llamas?"
      />
      <TextInput
        accessibilityLabel="Tu nombre, opcional"
        placeholder="Tu nombre · opcional"
        placeholderTextColor={palette.muted}
        value={data.profile.name}
        onChangeText={(name) =>
          onChange({ profile: { ...data.profile, name } })
        }
        maxLength={40}
        autoComplete="given-name"
        style={s.input}
      />
      <FieldLabel>¿Qué se te complica al vestirte?</FieldLabel>
      <View style={s.wrap}>
        {STRUGGLES.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={struggle === option.id}
            onPress={() => onStruggle(option.id)}
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
          <FieldLabel>Tu ciudad · opcional</FieldLabel>
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
