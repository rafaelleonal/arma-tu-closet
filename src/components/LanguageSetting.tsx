import React from 'react';
import { View } from 'react-native';
import type { LanguageId } from '../storage/local';
import { LANGUAGES, useCopy } from '../i18n';
import { Chip, useUI } from './ui';

/** Each language is named in itself, so it can be found whatever the app is speaking. */
const NAMES: Record<LanguageId, string> = { es: 'Español', en: 'English' };

/** Automatic follows the device; a choice here is kept in the local document. */
export function LanguageSetting({
  value,
  onChange,
}: {
  value?: LanguageId;
  onChange: (language: LanguageId | undefined) => void;
}) {
  const { s } = useUI();
  const t = useCopy();
  return (
    <View style={s.wrap}>
      <Chip
        label={t.settings.languageAuto}
        selected={!value}
        onPress={() => onChange(undefined)}
      />
      {LANGUAGES.map((language) => (
        <Chip
          key={language}
          label={NAMES[language]}
          selected={value === language}
          onPress={() => onChange(language)}
        />
      ))}
    </View>
  );
}
