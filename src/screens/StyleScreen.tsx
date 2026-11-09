import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  colorLabels,
  type Outfit,
} from '../domain';
import type { LocalData } from '../storage/local';
import type { UpdateData } from '../hooks/useLocalData';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { Garment } from '../components/Garment';
import {
  StyleGoalSheet,
  type StyleGoalResult,
} from '../components/style-goal/StyleGoalSheet';
import { Button, Chip, colorHex, useUI } from '../components/ui';

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
  const targets = STYLE_OPTIONS.filter((style) =>
    data.styleGoal?.targetStyleIds.includes(style.id),
  ).map((style) => style.label);
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
      <Text accessibilityRole="header" style={s.title}>
        Mi estilo
      </Text>
      <View style={[s.panel, { marginTop: 24, marginBottom: 18 }]}>
        <Text style={s.sectionTitle}>{data.profile.name || 'Estilos'}</Text>
        <Text style={[s.subtitle, { marginBottom: 16 }]}>
          {data.profile.styleIds.length
            ? data.profile.styleIds
                .map(
                  (id) => STYLE_OPTIONS.find((style) => style.id === id)?.label,
                )
                .join(' · ')
            : 'Aún no eliges estilos'}
        </Text>
        <Button secondary label="Editar preferencias" onPress={onPersonalize} />
      </View>
      <View style={[s.panel, { marginBottom: 18 }]}>
        <Text style={s.sectionTitle}>Cambiar mi estilo</Text>
        <Text style={[s.subtitle, { marginBottom: 16 }]}>
          {targets.length ? targets.join(' · ') : 'Sin objetivo todavía'}
        </Text>
        <Button
          secondary
          label={
            targets.length ? 'Editar objetivo' : 'Elegir cómo quiero verme'
          }
          onPress={() => setGoalOpen(true)}
        />
      </View>
      {goalOpen ? (
        <StyleGoalSheet
          data={data}
          onClose={() => setGoalOpen(false)}
          onSave={saveGoal}
        />
      ) : null}
      <AppearanceSettings
        value={data.appearance}
        onChange={(appearance) =>
          update((current) => ({ ...current, appearance }))
        }
      />
      <ColorPreferences
        preferences={data.preferences}
        onChange={setPreferences}
      />
      <View style={[s.panel, { marginTop: 18 }]}>
        <Text style={s.sectionTitle}>Repetición de prendas</Text>
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 18 }]}>
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
      </View>
      <SavedOutfits outfits={data.savedOutfits} onOpen={onOpenOutfit} />
      <View style={[s.panel, { marginTop: 26, backgroundColor: palette.wash }]}>
        <Text style={s.sectionTitle}>Almacenamiento</Text>
        <Text style={[s.subtitle, { fontSize: 12 }]}>
          Los datos y fotos se guardan en este dispositivo. Borrar sus datos o
          desinstalar la app puede eliminarlos. Sin respaldo en la nube. Al
          analizar una foto, se envía a OpenAI para proponer sus atributos. Tu
          tono de piel solo se guarda aquí.
        </Text>
        <Text style={[s.subtitle, { fontSize: 12, marginTop: 10 }]}>
          {data.wearHistory.length}{' '}
          {data.wearHistory.length === 1
            ? 'uso registrado'
            : 'usos registrados'}{' '}
          · {data.items.filter((item) => !item.isDemo).length} prendas propias
        </Text>
      </View>
    </>
  );
}

function toggle(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/** A color is either preferred or excluded; choosing one list removes it from the other. */
function ColorPreferences({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (fn: (current: Preferences) => Partial<Preferences>) => void;
}) {
  const { s } = useUI();
  const lists = [
    {
      key: 'preferredColors',
      other: 'excludedColors',
      title: 'Me gustan',
      hint: 'Los uso primero en tus outfits.',
    },
    {
      key: 'excludedColors',
      other: 'preferredColors',
      title: 'Prefiero evitar',
      hint: 'Se excluyen de las sugerencias.',
    },
  ] as const;
  return (
    <View style={[s.panel, { marginTop: 18 }]}>
      {lists.map((list, index) => (
        <View key={list.key}>
          {index ? <View style={s.divider} /> : null}
          <Text style={s.sectionTitle}>{list.title}</Text>
          <Text style={[s.subtitle, { marginBottom: 17, fontSize: 12 }]}>
            {list.hint}
          </Text>
          <View style={s.wrap}>
            {COLOR_OPTIONS.map((color) => (
              <Chip
                key={color}
                swatch={colorHex[color]}
                label={colorLabels[color]}
                selected={preferences[list.key].includes(color)}
                onPress={() =>
                  onChange((current) => ({
                    [list.key]: toggle(current[list.key], color),
                    [list.other]: current[list.other].filter(
                      (value) => value !== color,
                    ),
                  }))
                }
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function SavedOutfits({
  outfits,
  onOpen,
}: {
  outfits: Outfit[];
  onOpen: (outfit: Outfit) => void;
}) {
  const { palette, s } = useUI();
  return (
    <>
      <View
        style={[
          s.row,
          { justifyContent: 'space-between', marginTop: 32, marginBottom: 15 },
        ]}
      >
        <Text style={s.sectionTitle}>Guardados</Text>
        <Text style={s.subtitle}>{outfits.length}</Text>
      </View>
      {outfits.length ? (
        outfits.map((outfit) => (
          <Pressable
            key={outfit.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver outfit guardado: ${outfit.items.map((item) => item.name).join(', ')}`}
            onPress={() => onOpen(outfit)}
            style={[
              styles.savedRow,
              { backgroundColor: palette.white, borderColor: palette.line },
            ]}
          >
            <View style={s.row}>
              {outfit.items.slice(0, 3).map((item) => (
                <Garment key={item.id} item={item} size={55} />
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.ink, fontSize: 13 }}>
                {outfit.id.startsWith('manual-')
                  ? 'Creado por ti'
                  : 'Outfit guardado'}
              </Text>
              <Text style={[s.subtitle, { fontSize: 11 }]}>
                {outfit.items.length} prendas · Ver outfit ↗
              </Text>
            </View>
          </Pressable>
        ))
      ) : (
        <Text style={s.subtitle}>Todavía no guardas ningún outfit.</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
});
