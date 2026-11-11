import React from 'react';
import { Linking, Text, View } from 'react-native';
import type { LocalData } from '../storage/local';
import type { UpdateData } from '../hooks/useLocalData';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { Sheet, SHEET_BLEED } from '../components/Sheet';
import { Button, Chip, FieldLabel, useUI } from '../components/ui';
import { LanguageSetting } from '../components/LanguageSetting';
import { useCopy } from '../i18n';

const ROTATION_DAYS = [0, 3, 7, 14];

/** How the app looks and behaves, apart from the person's style: opened from Mi estilo. */
export function SettingsSheet({
  data,
  update,
  onPersonalize,
  onClose,
}: {
  data: LocalData;
  update: UpdateData;
  /** Goes through the four steps again; garments, photos, saved outfits and history stay. */
  onPersonalize: () => void;
  onClose: () => void;
}) {
  const { palette, s } = useUI();
  const t = useCopy();
  const note = [s.subtitle, { fontSize: 12, lineHeight: 19 }];
  return (
    <Sheet title={t.settings.title} onClose={onClose}>
      <FieldLabel>{t.settings.theme}</FieldLabel>
      <AppearanceSettings
        bleed={SHEET_BLEED}
        value={data.appearance}
        onChange={(appearance) =>
          update((current) => ({ ...current, appearance }))
        }
      />
      <FieldLabel>{t.settings.language}</FieldLabel>
      <LanguageSetting
        value={data.appearance.language}
        onChange={(language) =>
          update((current) => ({
            ...current,
            appearance: { ...current.appearance, language },
          }))
        }
      />
      <FieldLabel>{t.settings.rotation}</FieldLabel>
      <View style={s.wrap}>
        {ROTATION_DAYS.map((days) => (
          <Chip
            key={days}
            label={days ? t.settings.days(days) : t.settings.noWait}
            selected={data.preferences.rotationDays === days}
            onPress={() =>
              update((current) => ({
                ...current,
                preferences: { ...current.preferences, rotationDays: days },
              }))
            }
          />
        ))}
      </View>
      <Button
        secondary
        small
        label={t.settings.personalize}
        onPress={onPersonalize}
        style={{ marginTop: 28, alignSelf: 'flex-start' }}
      />
      <View
        style={[
          s.panel,
          { marginTop: 24, backgroundColor: palette.wash, gap: 8 },
        ]}
      >
        <Text style={{ color: palette.ink, fontSize: 13, fontWeight: '600' }}>
          {t.settings.dataTitle}
        </Text>
        <Text style={note}>{t.settings.dataPrivacy}</Text>
        <Text style={note}>
          {t.settings.dataCounts(
            data.items.filter((item) => !item.isDemo).length,
            data.wearHistory.length,
          )}
        </Text>
        {/* The weather data's license asks for credit; this is the one place that gives it. */}
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL('https://open-meteo.com/')}
          style={[note, { textDecorationLine: 'underline' }]}
        >
          {t.settings.weatherCredit}
        </Text>
      </View>
    </Sheet>
  );
}
