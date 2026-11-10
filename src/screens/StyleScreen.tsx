import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import type { Outfit } from '../domain';
import type { LocalData } from '../storage/local';
import type { UpdateData } from '../hooks/useLocalData';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { ColorPicker, type ColorMode } from '../components/ColorPicker';
import { SavedShelf } from '../components/style/SavedShelf';
import { StyleBoard } from '../components/style/StyleBoard';
import {
  StyleGoalSheet,
  type StyleGoalResult,
} from '../components/style-goal/StyleGoalSheet';
import { Chip, useUI } from '../components/ui';

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
  const [colorMode, setColorMode] = useState<ColorMode>('favorite');
  const saveGoal = ({ goal, styleIds, colors }: StyleGoalResult) => {
    update((current) => ({
      ...current,
      styleGoal: goal,
      profile: { ...current.profile, styleIds },
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
      <Text accessibilityRole="header" style={[s.title, { marginBottom: 16 }]}>
        Mi estilo
      </Text>
      <StyleBoard
        styleIds={data.profile.styleIds}
        targetStyleIds={data.styleGoal?.targetStyleIds ?? []}
        onEditStyles={onPersonalize}
        onEditGoal={() => setGoalOpen(true)}
      />
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
      <View style={{ marginTop: 34 }}>
        <AppearanceSettings
          bleed={24}
          value={data.appearance}
          onChange={(appearance) =>
            update((current) => ({ ...current, appearance }))
          }
        />
      </View>
      <Text style={[s.sectionTitle, { marginTop: 34 }]}>
        Repetición de prendas
      </Text>
      <Text style={[s.subtitle, { fontSize: 12, marginBottom: 16 }]}>
        Cuánto esperar para repetir una prenda. Si faltan opciones, se repite.
      </Text>
      <View style={s.wrap}>
        {[0, 3, 7, 14].map((days) => (
          <Chip
            key={days}
            label={days ? `${days} días` : 'Sin rotación'}
            selected={data.preferences.rotationDays === days}
            onPress={() => setPreferences(() => ({ rotationDays: days }))}
          />
        ))}
      </View>
      <View style={[s.panel, { marginTop: 34, backgroundColor: palette.wash }]}>
        <Text style={s.sectionTitle}>Almacenamiento</Text>
        <Text style={[s.subtitle, { fontSize: 12 }]}>
          Los datos y fotos se guardan en este dispositivo. Borrar sus datos o
          desinstalar la app puede eliminarlos. Sin respaldo en la nube. Al
          analizar una foto, se envía a OpenAI para proponer sus atributos. Tu
          colorimetría solo se guarda aquí.
        </Text>
        <Text style={[s.subtitle, { fontSize: 12, marginTop: 10 }]}>
          {data.wearHistory.length}{' '}
          {data.wearHistory.length === 1
            ? 'uso registrado'
            : 'usos registrados'}{' '}
          · {data.items.filter((item) => !item.isDemo).length} prendas propias
        </Text>
        {/* The weather data's license asks for credit; this is the one place that gives it. */}
        <Text
          accessibilityRole="link"
          onPress={() => void Linking.openURL('https://open-meteo.com/')}
          style={[
            s.subtitle,
            { fontSize: 12, marginTop: 10, textDecorationLine: 'underline' },
          ]}
        >
          Clima automático: datos de Open-Meteo
        </Text>
      </View>
    </>
  );
}
