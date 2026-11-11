import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { Outfit } from '../domain';
import type { LocalData } from '../storage/local';
import type { UpdateData } from '../hooks/useLocalData';
import { ColorPicker, type ColorMode } from '../components/ColorPicker';
import { SavedShelf } from '../components/style/SavedShelf';
import { SettingsButton } from '../components/style/SettingsButton';
import { StyleBoard } from '../components/style/StyleBoard';
import { StylesSheet } from '../components/style/StylePicker';
import {
  StyleGoalSheet,
  type StyleGoalResult,
} from '../components/style-goal/StyleGoalSheet';
import { useUI } from '../components/ui';
import { SettingsSheet } from './SettingsSheet';

type Preferences = LocalData['preferences'];

export function StyleScreen({
  data,
  update,
  onPersonalize,
  onOpenOutfit,
  onNoticeAfterSave,
}: {
  data: LocalData;
  update: UpdateData;
  onPersonalize: () => void;
  onOpenOutfit: (outfit: Outfit) => void;
  onNoticeAfterSave: (message: string) => void;
}) {
  const { palette, s } = useUI();
  const [goalOpen, setGoalOpen] = useState(false);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('favorite');
  const saveGoal = ({ goal, colors }: StyleGoalResult) => {
    update((current) => ({
      ...current,
      styleGoal: goal,
      preferences: {
        ...current.preferences,
        preferredColors: [
          ...new Set([...current.preferences.preferredColors, ...colors]),
        ],
      },
    }));
    setGoalOpen(false);
    onNoticeAfterSave('Guardé tu objetivo.');
  };
  const setPreferences = (fn: (current: Preferences) => Partial<Preferences>) =>
    update((current) => ({
      ...current,
      preferences: { ...current.preferences, ...fn(current.preferences) },
    }));
  return (
    <>
      {data.profile.name ? (
        <Text style={{ color: palette.muted, fontSize: 12 }}>
          {data.profile.name}
        </Text>
      ) : null}
      <View style={[s.pageHeading, { marginBottom: 16 }]}>
        <Text accessibilityRole="header" style={s.title}>
          Mi estilo
        </Text>
        <SettingsButton onPress={() => setSettingsOpen(true)} />
      </View>
      <StyleBoard
        styleIds={data.profile.styleIds}
        targetStyleIds={data.styleGoal?.targetStyleIds ?? []}
        onEditStyles={() => setStylesOpen(true)}
        onEditGoal={() => setGoalOpen(true)}
      />
      {stylesOpen ? (
        <StylesSheet
          styleIds={data.profile.styleIds}
          onClose={() => setStylesOpen(false)}
          onSave={(styleIds) => {
            update((current) => ({
              ...current,
              profile: { ...current.profile, styleIds },
            }));
            setStylesOpen(false);
            onNoticeAfterSave('Guardé tus estilos.');
          }}
        />
      ) : null}
      {goalOpen ? (
        <StyleGoalSheet
          data={data}
          onClose={() => setGoalOpen(false)}
          onSave={saveGoal}
        />
      ) : null}
      <SavedShelf outfits={data.savedOutfits} onOpen={onOpenOutfit} />
      <Text style={[s.sectionTitle, { marginTop: 34, marginBottom: 14 }]}>
        Colores
      </Text>
      <ColorPicker
        value={data.preferences}
        mode={colorMode}
        onMode={setColorMode}
        onChange={(colors) => setPreferences(() => colors)}
      />
      {settingsOpen ? (
        <SettingsSheet
          data={data}
          update={update}
          onPersonalize={() => {
            setSettingsOpen(false);
            onPersonalize();
          }}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}
