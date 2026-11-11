import React from 'react';
import { Text, View } from 'react-native';
import { OCCASIONS } from '../../domain';
import { useCopy } from '../../i18n';
import { ThemeRow } from '../AppearanceSettings';
import { Button, Chip, FieldLabel, useUI } from '../ui';
import { FirstOutfitPreview } from './FirstOutfitPreview';
import { Guide } from './Guide';
import type { OnboardingEntry, StepProps } from './types';

const PILL = { minHeight: 52, borderRadius: 26 };

/** Last step. Only the first run offers the example closet; it never replaces an existing one. */
export function AppearanceStep({
  data,
  onChange,
  edit,
  onFinish,
}: StepProps & { edit: boolean; onFinish: (entry: OnboardingEntry) => void }) {
  const { s, palette } = useUI();
  const t = useCopy();
  const copy = t.onboarding;
  return (
    <>
      <Guide kind="sneakers" say={copy.outfitSay} title={copy.outfitTitle} />
      <FirstOutfitPreview data={data} />
      <FieldLabel>{copy.occasionQuestion}</FieldLabel>
      <View style={s.wrap}>
        {OCCASIONS.map((occasion) => (
          <Chip
            key={occasion}
            label={t.occasions[occasion]}
            selected={data.context.occasion === occasion}
            onPress={() => onChange({ context: { ...data.context, occasion } })}
          />
        ))}
      </View>
      <FieldLabel>{t.settings.theme}</FieldLabel>
      <ThemeRow
        bleed={24}
        value={data.appearance}
        onChange={(appearance) => onChange({ appearance })}
      />
      {edit ? (
        <View style={{ marginTop: 28 }}>
          <Button
            label={copy.done}
            onPress={() => onFinish('keep')}
            style={PILL}
          />
        </View>
      ) : (
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              color: palette.ink,
              fontSize: 20,
              letterSpacing: -0.5,
              marginBottom: 16,
            }}
          >
            {copy.startWith}
          </Text>
          <Button
            label={copy.ownClothes}
            onPress={() => onFinish('own')}
            style={PILL}
          />
          <Button
            secondary
            label={t.closet.showDemo}
            onPress={() => onFinish('demo')}
            style={{ ...PILL, marginTop: 10 }}
          />
        </View>
      )}
    </>
  );
}
