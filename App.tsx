import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  categoryLabels,
  colorLabels,
  generateRecommendations,
  occasionLabels,
  recordOutfitWorn,
  seedWardrobe,
  swapOutfitItem,
  type Category,
  type Context,
  type Outfit,
  type WardrobeItem,
} from './src/domain';
import {
  Button,
  Chip,
  colorHex,
  useUI,
  SectionLabel,
} from './src/components/ui';
import { Garment } from './src/components/Garment';
import { Sheet } from './src/components/Sheet';
import { ItemEditor } from './src/components/ItemEditor';
import { ManualBuilder } from './src/components/ManualBuilder';
import {
  readLocalData,
  writeLocalData,
  createLocalData,
  type LocalData,
} from './src/storage/local';
import { ThemeProvider, type Palette } from './src/theme/ThemeProvider';
import {
  Onboarding,
  type PersonalizationPatch,
} from './src/components/Onboarding';
import { AppearanceSettings } from './src/components/AppearanceSettings';
import { ContextEditor } from './src/components/ContextEditor';
import { ClosetRail } from './src/components/ClosetRail';
import { ClosetGrid } from './src/components/ClosetGrid';
import { useWeather } from './src/weather/useWeather';

import {
  FeedbackProvider,
  MotionIn,
  useFeedback,
} from './src/components/Feedback';

type Tab = 'today' | 'closet' | 'style';
const freshData = createLocalData;

export default function App() {
  const [data, setData] = useState<LocalData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState('');
  async function hydrate() {
    setLoadError('');
    try {
      setData((await readLocalData()) || freshData());
      setHydrated(true);
    } catch {
      setLoadError(
        'No pudimos abrir tus datos locales. No los reemplazamos. Intenta de nuevo; si persiste, conserva los datos del navegador o la app para poder recuperarlos.',
      );
    }
  }
  useEffect(() => {
    void hydrate();
  }, []);
  return (
    <SafeAreaProvider>
      <ThemeProvider themeId={data?.appearance.themeId ?? 'linen'}>
        <FeedbackProvider enabled={data?.appearance.hapticsEnabled !== false}>
          <Main
            data={data}
            setData={setData}
            hydrated={hydrated}
            loadError={loadError}
            hydrate={hydrate}
          />
        </FeedbackProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

interface MainProps {
  data: LocalData | null;
  setData: React.Dispatch<React.SetStateAction<LocalData | null>>;
  hydrated: boolean;
  loadError: string;
  hydrate: () => Promise<void>;
}

function Main({ data, setData, hydrated, loadError, hydrate }: MainProps) {
  const { palette, s } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const feedback = useFeedback();
  const { success } = feedback;
  const weather = useWeather(data, setData);
  const [personalizing, setPersonalizing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tab, setTab] = useState<Tab>('today');
  const contentScroll = useRef<ScrollViewInstance>(null);
  useEffect(() => {
    contentScroll.current?.scrollTo({ y: 0, animated: false });
  }, [tab]);
  const [editor, setEditor] = useState<WardrobeItem | 'new' | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [swap, setSwap] = useState<{
    outfit: Outfit;
    category: Category;
  } | null>(null);
  const [notice, setNotice] = useState('');
  const noticeOnSave = useRef('');
  const writeRevision = useRef(0);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (!hydrated || !data) return;
    const revision = ++writeRevision.current;
    const message = noticeOnSave.current;
    void writeLocalData(data)
      .then(() => {
        if (revision !== writeRevision.current) return;
        setSaveError('');
        if (message && noticeOnSave.current === message) {
          noticeOnSave.current = '';
          setNotice(message);
          success();
        }
      })
      .catch((error: unknown) => {
        if (revision === writeRevision.current)
          setSaveError(
            error instanceof Error
              ? `${error.message} Los últimos cambios siguen en esta pantalla. Reintenta antes de cerrarla.`
              : 'No se guardaron los últimos cambios. Revisa el espacio disponible y vuelve a intentar. Mantén esta pantalla abierta.',
          );
      });
  }, [data, hydrated, success]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
  const context = useMemo<Context>(
    () => ({
      ...(weather.effective?.context || data?.context || freshData().context),
      ...(data?.preferences || freshData().preferences),
      styleIds: data?.profile.styleIds ?? [],
      now: new Date().toISOString(),
    }),
    [
      data?.context,
      data?.weather,
      weather.effective?.source,
      data?.preferences,
      data?.profile.styleIds,
      data?.items,
      generation,
    ],
  );
  const result = useMemo(
    () => generateRecommendations(data?.items || [], context, { limit: 10 }),
    [data?.items, context],
  );
  const recommendations = result.outfits
    .filter((outfit) => !data?.dislikedOutfitIds.includes(outfit.id))
    .slice(0, 3);
  const update = (fn: (current: LocalData) => LocalData) =>
    setData((current) => (current ? fn(current) : current));
  function favorite(outfit: Outfit) {
    const saved = data?.savedOutfits.some((item) => item.id === outfit.id);
    update((current) => ({
      ...current,
      savedOutfits: saved
        ? current.savedOutfits.filter((item) => item.id !== outfit.id)
        : [outfit, ...current.savedOutfits],
    }));
    noticeOnSave.current = saved
      ? 'Quitado de guardados.'
      : 'Conjunto guardado.';
  }
  function worn(outfit: Outfit) {
    if (!data) return;
    const now = new Date().toISOString();
    const wear = recordOutfitWorn(data.items, outfit, now);
    if (wear.status !== 'recorded') {
      setSelectedOutfit(null);
      setNotice(wear.message);
      return;
    }
    const today = localDay(now);
    if (
      data.wearHistory.some(
        (entry) => entry.id === outfit.id && localDay(entry.date) === today,
      )
    ) {
      setSelectedOutfit(null);
      setNotice('Este conjunto ya está registrado como usado hoy.');
      return;
    }
    update((current) => ({
      ...current,
      items: wear.wardrobe,
      wearHistory: [
        {
          id: outfit.id,
          itemIds: outfit.items.map((item) => item.id),
          date: now,
        },
        ...current.wearHistory,
      ].slice(0, 365),
    }));
    setSelectedOutfit(null);
    noticeOnSave.current = 'Uso registrado.';
  }
  if (!hydrated || !data)
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.logo}>a.</Text>
        {loadError ? (
          <>
            <Text
              accessibilityRole="alert"
              style={[s.subtitle, { textAlign: 'center', marginVertical: 24 }]}
            >
              {loadError}
            </Text>
            <Button label="Intentar de nuevo" onPress={() => void hydrate()} />
          </>
        ) : (
          <ActivityIndicator color={palette.green} />
        )}
      </SafeAreaView>
    );
  if (!data.onboarded || personalizing)
    return (
      <View style={{ flex: 1, backgroundColor: palette.paper }}>
        {saveError ? (
          <View style={styles.error}>
            <Text
              accessibilityRole="alert"
              style={{ color: palette.rust, flex: 1, fontSize: 12 }}
            >
              {saveError}
            </Text>
            <Button
              secondary
              small
              label="Reintentar"
              onPress={() => setData({ ...data })}
            />
          </View>
        ) : null}
        <Onboarding
          data={data}
          mode={data.onboarded ? 'edit' : 'initial'}
          onChange={(patch: PersonalizationPatch) =>
            update((current) => ({ ...current, ...patch }))
          }
          onClose={data.onboarded ? () => setPersonalizing(false) : undefined}
          onFinish={(entry) => {
            update((current) => ({
              ...current,
              onboarded: true,
              onboarding: { step: 0 },
              items:
                current.onboarded || entry !== 'demo'
                  ? current.items
                  : seedWardrobe.map((item) => ({ ...item })),
            }));
            setPersonalizing(false);
            setTab(
              entry === 'own' ? 'closet' : entry === 'keep' ? 'style' : 'today',
            );
            noticeOnSave.current = 'Preferencias guardadas.';
          }}
        />
      </View>
    );
  const hasDemo = data.items.some((item) => item.isDemo);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={s.row}>
          <Text style={styles.logo}>a.</Text>
          <View>
            <Text style={styles.brand}>arma tu outfit</Text>
          </View>
        </View>
      </View>
      {saveError ? (
        <View style={styles.error}>
          <Text
            accessibilityRole="alert"
            style={{ color: palette.rust, flex: 1, fontSize: 12 }}
          >
            {saveError}
          </Text>
          <Button
            secondary
            small
            label="Reintentar"
            onPress={() => setData({ ...data })}
          />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={contentScroll}
          contentContainerStyle={styles.main}
          keyboardShouldPersistTaps="handled"
        >
          <MotionIn trigger={tab}>
            {tab === 'today' ? (
              <>
                <View style={styles.pageHeading}>
                  <View>
                    {data.profile.name ? (
                      <SectionLabel>{data.profile.name}</SectionLabel>
                    ) : null}
                    <Text accessibilityRole="header" style={s.title}>
                      Hoy
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {new Intl.DateTimeFormat('es-MX', {
                      day: 'numeric',
                      month: 'long',
                    }).format(new Date())}
                  </Text>
                </View>
                {hasDemo ? (
                  <DemoBanner
                    onStart={() => {
                      update((current) => ({
                        ...current,
                        items: current.items.filter((item) => !item.isDemo),
                        savedOutfits: current.savedOutfits.filter(
                          (outfit) => !outfit.items.some((item) => item.isDemo),
                        ),
                      }));
                      setTab('closet');
                    }}
                  />
                ) : null}
                <View style={styles.contextCard}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Editar clima y ocasión"
                    onPress={() => setContextOpen(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <View style={[s.row, { flexShrink: 1 }]}>
                      <Text style={{ fontSize: 31, color: palette.ink }}>
                        {context.raining ? '☂' : '☼'}
                      </Text>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={{ fontSize: 19, color: palette.ink }}>
                          {Math.round(
                            weather.effective?.source === 'automatic'
                              ? data.weather.snapshot!.temperatureC
                              : context.temperatureC,
                          )}
                          °{' '}
                          <Text style={{ fontSize: 13 }}>
                            {weather.effective?.context.city ||
                              data.context.city}
                          </Text>
                        </Text>
                        <Text style={[s.subtitle, { fontSize: 11 }]}>
                          {weather.effective?.source === 'automatic'
                            ? `Sensación ${Math.round(context.temperatureC)}° · ${context.raining ? 'Con precipitación' : 'Sin precipitación'}`
                            : `Clima manual · ${data.context.season}`}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, color: palette.ink }}>
                        {occasionLabels[data.context.occasion]}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: palette.rust,
                          marginTop: 5,
                        }}
                      >
                        Cambiar ↗
                      </Text>
                    </View>
                  </Pressable>
                  {data.weather.mode === 'automatic' ? (
                    <View style={{ marginTop: 12, gap: 8 }}>
                      <Text style={[s.subtitle, { fontSize: 11 }]}>
                        {weather.effective?.source === 'automatic'
                          ? `Actualizado ${new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(data.weather.snapshot!.fetchedAt))}`
                          : weather.loading
                            ? 'Consultando clima. Por ahora se usa el manual.'
                            : 'Sin clima reciente. Se usa el manual de respaldo.'}
                      </Text>
                      {weather.error ? (
                        <Text
                          accessibilityRole="alert"
                          style={{ color: palette.rust, fontSize: 12 }}
                        >
                          {weather.error}
                        </Text>
                      ) : null}
                      <View
                        style={[
                          s.row,
                          { justifyContent: 'space-between', flexWrap: 'wrap' },
                        ]}
                      >
                        <Pressable
                          accessibilityRole="link"
                          onPress={() =>
                            void Linking.openURL('https://open-meteo.com/')
                          }
                          style={{ paddingVertical: 10 }}
                        >
                          <Text
                            style={{
                              color: palette.green,
                              fontSize: 11,
                              textDecorationLine: 'underline',
                            }}
                          >
                            Open-Meteo
                          </Text>
                        </Pressable>
                        <Button
                          small
                          secondary
                          label={
                            weather.loading
                              ? 'Actualizando…'
                              : 'Actualizar clima'
                          }
                          disabled={weather.loading}
                          onPress={weather.refresh}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
                <View
                  style={[
                    s.row,
                    {
                      justifyContent: 'space-between',
                      marginTop: 30,
                      marginBottom: 14,
                    },
                  ]}
                >
                  <SectionLabel>Conjuntos</SectionLabel>
                  <Text style={{ color: palette.muted, fontSize: 11 }}>
                    {recommendations.length
                      ? `${recommendations.length} ${recommendations.length === 1 ? 'opción' : 'opciones'}`
                      : ''}
                  </Text>
                </View>
                {recommendations.length ? (
                  <>
                    <OutfitCard
                      compact={data.appearance.outfitLayout === 'compact'}
                      showReasons={data.appearance.showReasons}
                      outfit={recommendations[0]}
                      primary
                      saved={data.savedOutfits.some(
                        (item) => item.id === recommendations[0].id,
                      )}
                      onFavorite={() => favorite(recommendations[0])}
                      onWorn={() => worn(recommendations[0])}
                      onItem={(item) =>
                        setSwap({
                          outfit: recommendations[0],
                          category: item.category,
                        })
                      }
                      onDetails={() => setSelectedOutfit(recommendations[0])}
                    />
                    <>
                      {recommendations.length > 1 ? (
                        <View
                          style={[
                            s.row,
                            { justifyContent: 'space-between', marginTop: 24 },
                          ]}
                        >
                          <Text style={{ fontSize: 18, color: palette.ink }}>
                            Otras opciones
                          </Text>
                        </View>
                      ) : null}
                    </>
                    <View style={styles.alternatives}>
                      {recommendations.slice(1).map((outfit) => (
                        <View key={outfit.id} style={styles.alternative}>
                          <OutfitCard
                            compact={data.appearance.outfitLayout === 'compact'}
                            showReasons={data.appearance.showReasons}
                            outfit={outfit}
                            saved={data.savedOutfits.some(
                              (item) => item.id === outfit.id,
                            )}
                            onFavorite={() => favorite(outfit)}
                            onWorn={() => worn(outfit)}
                            onDetails={() => setSelectedOutfit(outfit)}
                          />
                        </View>
                      ))}
                    </View>
                    <Button
                      secondary
                      label="Otra combinación"
                      style={{ marginTop: 16 }}
                      onPress={() => {
                        update((current) => ({
                          ...current,
                          dislikedOutfitIds: [
                            ...new Set([
                              ...current.dislikedOutfitIds,
                              recommendations[0].id,
                            ]),
                          ],
                        }));
                        setGeneration((value) => value + 1);
                      }}
                    />
                  </>
                ) : (
                  <View style={[s.panel, { paddingVertical: 35 }]}>
                    <Text
                      style={{
                        fontSize: 28,
                        marginBottom: 14,
                        color: palette.ink,
                      }}
                    >
                      Sin conjuntos
                    </Text>
                    <Text style={s.subtitle}>
                      {result.outfits.length
                        ? 'No quedan opciones en esta selección.'
                        : result.message}
                    </Text>
                    <Text style={[s.subtitle, { marginTop: 12 }]}>
                      Revisa tus preferencias o agrega prendas.
                    </Text>
                    <View style={[s.row, { marginTop: 22, flexWrap: 'wrap' }]}>
                      <Button
                        label="Ir a mi clóset"
                        onPress={() => setTab('closet')}
                      />
                      {data.dislikedOutfitIds.length ? (
                        <Button
                          secondary
                          label="Recuperar opciones"
                          onPress={() =>
                            update((current) => ({
                              ...current,
                              dislikedOutfitIds: [],
                            }))
                          }
                        />
                      ) : (
                        <Button
                          secondary
                          label="Revisar mi estilo"
                          onPress={() => setTab('style')}
                        />
                      )}
                    </View>
                  </View>
                )}
              </>
            ) : null}
            {tab === 'closet' ? (
              <Closet
                items={data.items}
                hasDemo={hasDemo}
                onAdd={() => setEditor('new')}
                onEdit={setEditor}
                onToggle={(item) =>
                  update((current) => ({
                    ...current,
                    items: current.items.map((value) =>
                      value.id === item.id
                        ? { ...value, available: !value.available }
                        : value,
                    ),
                  }))
                }
                onManual={() => setManualOpen(true)}
                onRemoveDemo={() =>
                  update((current) => ({
                    ...current,
                    items: current.items.filter((item) => !item.isDemo),
                    savedOutfits: current.savedOutfits.filter(
                      (outfit) => !outfit.items.some((item) => item.isDemo),
                    ),
                  }))
                }
                onUseDemo={() => {
                  update((current) =>
                    current.items.length
                      ? current
                      : {
                          ...current,
                          items: seedWardrobe.map((item) => ({ ...item })),
                        },
                  );
                  noticeOnSave.current =
                    'Clóset de ejemplo listo. Quítalo cuando agregues tu ropa.';
                }}
              />
            ) : null}
            {tab === 'style' ? (
              <>
                <Text accessibilityRole="header" style={s.title}>
                  Mi estilo
                </Text>
                <View style={[s.panel, { marginTop: 24, marginBottom: 18 }]}>
                  <Text style={styles.sectionTitle}>
                    {data.profile.name || 'Estilos'}
                  </Text>
                  <Text style={[s.subtitle, { marginBottom: 16 }]}>
                    {data.profile.styleIds.length
                      ? data.profile.styleIds
                          .map(
                            (id) =>
                              STYLE_OPTIONS.find((style) => style.id === id)
                                ?.label,
                          )
                          .join(' · ')
                      : 'Sin estilos seleccionados'}
                  </Text>
                  <Button
                    secondary
                    label="Editar preferencias"
                    onPress={() => {
                      update((current) => ({
                        ...current,
                        onboarding: { step: 0 },
                      }));
                      setPersonalizing(true);
                    }}
                  />
                </View>
                <AppearanceSettings
                  value={data.appearance}
                  onChange={(appearance) =>
                    update((current) => ({ ...current, appearance }))
                  }
                />
                <View style={[s.panel, { marginTop: 18 }]}>
                  <Text style={styles.sectionTitle}>Colores favoritos</Text>
                  <Text
                    style={[s.subtitle, { marginBottom: 17, fontSize: 12 }]}
                  >
                    Tienen prioridad en las sugerencias.
                  </Text>
                  <View style={s.wrap}>
                    {COLOR_OPTIONS.map((color) => (
                      <Chip
                        key={color}
                        swatch={colorHex[color]}
                        label={colorLabels[color]}
                        selected={data.preferences.preferredColors.includes(
                          color,
                        )}
                        onPress={() =>
                          update((current) => ({
                            ...current,
                            preferences: {
                              ...current.preferences,
                              preferredColors: toggle(
                                current.preferences.preferredColors,
                                color,
                              ),
                              excludedColors:
                                current.preferences.excludedColors.filter(
                                  (value) => value !== color,
                                ),
                            },
                          }))
                        }
                      />
                    ))}
                  </View>
                  <View style={s.divider} />
                  <Text style={styles.sectionTitle}>Colores a evitar</Text>
                  <Text
                    style={[s.subtitle, { marginBottom: 17, fontSize: 12 }]}
                  >
                    Se excluyen de las sugerencias.
                  </Text>
                  <View style={s.wrap}>
                    {COLOR_OPTIONS.map((color) => (
                      <Chip
                        key={color}
                        swatch={colorHex[color]}
                        label={colorLabels[color]}
                        selected={data.preferences.excludedColors.includes(
                          color,
                        )}
                        onPress={() =>
                          update((current) => ({
                            ...current,
                            preferences: {
                              ...current.preferences,
                              excludedColors: toggle(
                                current.preferences.excludedColors,
                                color,
                              ),
                              preferredColors:
                                current.preferences.preferredColors.filter(
                                  (value) => value !== color,
                                ),
                            },
                          }))
                        }
                      />
                    ))}
                  </View>
                </View>
                <View style={[s.panel, { marginTop: 18 }]}>
                  <Text style={styles.sectionTitle}>Repetición de prendas</Text>
                  <Text
                    style={[s.subtitle, { fontSize: 12, marginBottom: 18 }]}
                  >
                    Tiempo entre usos. Puede repetirse una prenda si faltan
                    opciones.
                  </Text>
                  <View style={s.wrap}>
                    {[0, 3, 7, 14].map((days) => (
                      <Chip
                        key={days}
                        label={days ? `${days} días` : 'Sin rotación'}
                        selected={data.preferences.rotationDays === days}
                        onPress={() =>
                          update((current) => ({
                            ...current,
                            preferences: {
                              ...current.preferences,
                              rotationDays: days,
                            },
                          }))
                        }
                      />
                    ))}
                  </View>
                </View>
                <View
                  style={[
                    s.row,
                    {
                      justifyContent: 'space-between',
                      marginTop: 32,
                      marginBottom: 15,
                    },
                  ]}
                >
                  <Text style={styles.sectionTitle}>Guardados</Text>
                  <Text style={s.subtitle}>{data.savedOutfits.length}</Text>
                </View>
                {data.savedOutfits.length ? (
                  data.savedOutfits.map((outfit) => (
                    <Pressable
                      key={outfit.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver conjunto guardado: ${outfit.items.map((item) => item.name).join(', ')}`}
                      onPress={() => setSelectedOutfit(outfit)}
                      style={styles.savedRow}
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
                            : 'Conjunto guardado'}
                        </Text>
                        <Text style={[s.subtitle, { fontSize: 11 }]}>
                          {outfit.items.length} prendas · Ver conjunto ↗
                        </Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text style={s.subtitle}>No hay conjuntos guardados.</Text>
                )}
                <View
                  style={[
                    s.panel,
                    { marginTop: 26, backgroundColor: palette.wash },
                  ]}
                >
                  <Text style={styles.sectionTitle}>Almacenamiento</Text>
                  <Text style={[s.subtitle, { fontSize: 12 }]}>
                    Los datos y fotos se guardan en este dispositivo. Borrar sus
                    datos o desinstalar la app puede eliminarlos. Sin respaldo
                    en la nube. Al analizar una foto, se envía a OpenAI para
                    proponer sus atributos.
                  </Text>
                  <Text style={[s.subtitle, { fontSize: 12, marginTop: 10 }]}>
                    {data.wearHistory.length}{' '}
                    {data.wearHistory.length === 1
                      ? 'uso registrado'
                      : 'usos registrados'}{' '}
                    · {data.items.filter((item) => !item.isDemo).length} prendas
                    propias
                  </Text>
                </View>
              </>
            ) : null}
          </MotionIn>
        </ScrollView>
        {/* Floats over the content so showing or hiding it never moves the buttons under a tap. */}
        {notice ? (
          <Pressable
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            accessibilityHint="Toca para cerrar"
            onPress={() => setNotice('')}
            style={styles.notice}
          >
            <Text style={{ color: palette.ink, fontSize: 13, lineHeight: 19 }}>
              {notice}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        <View style={styles.tabInner}>
          {(
            [
              { id: 'today', icon: '☼', label: 'Hoy' },
              { id: 'closet', icon: '▥', label: 'Mi clóset' },
              { id: 'style', icon: '◌', label: 'Mi estilo' },
            ] as const
          ).map((value) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === value.id }}
              aria-selected={tab === value.id}
              key={value.id}
              onPress={() => {
                if (tab !== value.id) {
                  feedback.selection();
                  setTab(value.id);
                  setNotice('');
                }
              }}
              style={styles.tab}
            >
              <Text
                style={{
                  fontSize: 23,
                  color: tab === value.id ? palette.rust : palette.muted,
                }}
              >
                {value.icon}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: tab === value.id ? palette.ink : palette.muted,
                  fontWeight: tab === value.id ? '700' : '400',
                }}
              >
                {value.label}
              </Text>
              {tab === value.id ? <View style={styles.tabDot} /> : null}
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
      {editor ? (
        <ItemEditor
          item={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
          onSave={(item) => {
            update((current) => ({
              ...current,
              items: current.items.some((value) => value.id === item.id)
                ? current.items.map((value) =>
                    value.id === item.id ? item : value,
                  )
                : [item, ...current.items],
            }));
            setEditor(null);
            noticeOnSave.current = 'Prenda guardada.';
          }}
        />
      ) : null}
      {contextOpen ? (
        <ContextEditor
          value={data.context}
          weather={data.weather}
          onClose={() => setContextOpen(false)}
          onSave={(value, settings) => {
            update((current) => {
              const latest = current.weather.snapshot;
              const snapshot =
                settings.location?.id === current.weather.location?.id &&
                latest &&
                (!settings.snapshot ||
                  Date.parse(latest.fetchedAt) >
                    Date.parse(settings.snapshot.fetchedAt))
                  ? latest
                  : settings.snapshot;
              return {
                ...current,
                context: value,
                weather: { ...settings, snapshot },
                dislikedOutfitIds: [],
              };
            });
            setContextOpen(false);
          }}
        />
      ) : null}
      {manualOpen ? (
        <ManualBuilder
          items={data.items}
          onClose={() => setManualOpen(false)}
          onSave={(outfit) => {
            update((current) => ({
              ...current,
              savedOutfits: [outfit, ...current.savedOutfits],
            }));
            setManualOpen(false);
            setTab('style');
            noticeOnSave.current = 'Conjunto guardado.';
          }}
        />
      ) : null}
      {selectedOutfit ? (
        <Sheet title="Conjunto" onClose={() => setSelectedOutfit(null)}>
          {data.savedOutfits.some((item) => item.id === selectedOutfit.id) ? (
            <Text style={[s.subtitle, { fontSize: 12, marginBottom: 14 }]}>
              Guardado con los detalles originales. Revisa disponibilidad y
              clima antes de usarlo.
            </Text>
          ) : null}
          {saveError ? (
            <Text
              accessibilityRole="alert"
              style={{ color: palette.rust, marginBottom: 14 }}
            >
              {saveError}
            </Text>
          ) : null}
          <OutfitCard
            compact={data.appearance.outfitLayout === 'compact'}
            showReasons={data.appearance.showReasons}
            outfit={selectedOutfit}
            primary
            saved={data.savedOutfits.some(
              (item) => item.id === selectedOutfit.id,
            )}
            onFavorite={() => favorite(selectedOutfit)}
            onWorn={() => worn(selectedOutfit)}
            onItem={(item) => {
              setSwap({ outfit: selectedOutfit, category: item.category });
              setSelectedOutfit(null);
            }}
          />
        </Sheet>
      ) : null}
      {swap ? (
        <Sheet
          title={`Cambiar · ${categoryLabels[swap.category]}`}
          onClose={() => setSwap(null)}
        >
          <Text style={s.subtitle}>
            Prendas disponibles de esta categoría, sin los colores excluidos.
          </Text>
          {!data.items.some(
            (item) =>
              item.category === swap.category &&
              item.available &&
              !swap.outfit.items.some((current) => current.id === item.id) &&
              !item.colors.some((color) =>
                data.preferences.excludedColors.includes(color),
              ),
          ) ? (
            <Text style={[s.subtitle, { marginTop: 20 }]}>
              No hay otra prenda disponible. Agrega una en Mi clóset.
            </Text>
          ) : null}
          <View style={[s.wrap, { marginTop: 20 }]}>
            {data.items
              .filter(
                (item) =>
                  item.category === swap.category &&
                  !swap.outfit.items.some(
                    (current) => current.id === item.id,
                  ) &&
                  item.available &&
                  !item.colors.some((color) =>
                    data.preferences.excludedColors.includes(color),
                  ),
              )
              .map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Cambiar por ${item.name}`}
                  onPress={() => {
                    const change = swapOutfitItem(
                      swap.outfit,
                      swap.category,
                      item.id,
                      data.items,
                      context,
                    );
                    setNotice(change.message);
                    if (change.status === 'swapped') {
                      setSwap(null);
                      setSelectedOutfit(change.outfit);
                    }
                  }}
                  style={styles.swapItem}
                >
                  <Garment item={item} size={110} />
                  <Text
                    style={{ color: palette.ink, fontSize: 12, marginTop: 10 }}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
          </View>
        </Sheet>
      ) : null}
    </SafeAreaView>
  );
}

function OutfitCard({
  outfit,
  primary,
  compact,
  showReasons = true,
  saved,
  onFavorite,
  onWorn,
  onDetails,
  onItem,
}: {
  outfit: Outfit;
  primary?: boolean;
  compact?: boolean;
  showReasons?: boolean;
  saved: boolean;
  onFavorite: () => void;
  onWorn: () => void;
  onDetails?: () => void;
  onItem?: (item: WardrobeItem) => void;
}) {
  const { palette, s } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={[styles.outfitCard, !primary && { borderRadius: 20 }]}>
      <View
        style={[
          styles.outfitArt,
          primary && !compact ? { minHeight: 255 } : { minHeight: 150 },
        ]}
      >
        <View style={styles.garmentLine}>
          {outfit.items.map((item) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                onItem ? `Cambiar ${item.name}` : `Ver ${item.name}`
              }
              key={item.id}
              onPress={() => (onItem ? onItem(item) : onDetails?.())}
              style={{ alignItems: 'center', paddingHorizontal: 0 }}
            >
              <Garment item={item} size={primary && !compact ? 88 : 64} />
              {primary ? (
                <Text
                  numberOfLines={2}
                  style={{
                    maxWidth: 88,
                    minHeight: 32,
                    textAlign: 'center',
                    fontSize: 10,
                    color: palette.muted,
                    marginTop: 9,
                  }}
                >
                  {item.name}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
        {primary ? (
          <Text style={{ color: palette.green, fontSize: 10, marginTop: 6 }}>
            Toca una prenda para cambiarla
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            saved ? 'Quitar conjunto de guardados' : 'Guardar conjunto'
          }
          accessibilityState={{ selected: saved }}
          aria-pressed={saved}
          onPress={onFavorite}
          style={styles.heart}
        >
          <Text
            style={{ fontSize: 23, color: saved ? palette.rust : palette.ink }}
          >
            {saved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
      <View style={{ padding: primary ? 22 : 17 }}>
        {(showReasons ? outfit.reasons.slice(0, primary ? 3 : 1) : []).map(
          (reason) => (
            <Text
              key={reason}
              style={[
                s.subtitle,
                { fontSize: primary ? 12 : 11, lineHeight: 20 },
              ]}
            >
              · {reason}
            </Text>
          ),
        )}
        {(primary ? outfit.warnings : outfit.warnings.slice(0, 1)).map(
          (warning) => (
            <Text
              key={warning}
              style={{
                color: palette.rust,
                fontSize: 11,
                lineHeight: 19,
                marginTop: 5,
              }}
            >
              {warning}
            </Text>
          ),
        )}
        <View style={[s.row, { marginTop: 20 }]}>
          <Button
            label={primary ? 'Lo usé hoy' : 'Ver conjunto'}
            onPress={primary ? onWorn : () => onDetails?.()}
            small={!primary}
            style={{ flex: 1 }}
          />
          {primary ? (
            <Button
              secondary
              label={saved ? 'Guardado' : 'Guardar'}
              onPress={onFavorite}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function DemoBanner({ onStart }: { onStart: () => void }) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={styles.demo}>
      <Text
        style={{ color: palette.green, flex: 1, fontSize: 11, lineHeight: 17 }}
      >
        CLÓSET DE EJEMPLO
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        style={{ padding: 10 }}
      >
        <Text style={{ fontSize: 11, color: palette.rust, fontWeight: '600' }}>
          Usar mi ropa
        </Text>
      </Pressable>
    </View>
  );
}

function Closet({
  items,
  hasDemo,
  onAdd,
  onEdit,
  onToggle,
  onManual,
  onRemoveDemo,
  onUseDemo,
}: {
  items: WardrobeItem[];
  hasDemo: boolean;
  onAdd: () => void;
  onEdit: (item: WardrobeItem) => void;
  onToggle: (item: WardrobeItem) => void;
  onManual: () => void;
  onRemoveDemo: () => void;
  onUseDemo: () => void;
}) {
  const { palette, s } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <>
      <View style={styles.pageHeading}>
        <View>
          <Text accessibilityRole="header" style={s.title}>
            Mi clóset
          </Text>
          <Text style={[s.subtitle, { marginTop: 8 }]}>
            {items.length} prendas ·{' '}
            {items.filter((item) => item.available).length} disponibles
          </Text>
        </View>
        <Button label="+ Agregar prenda" onPress={onAdd} small />
      </View>
      {hasDemo ? (
        <View style={{ marginBottom: 16 }}>
          <DemoBanner onStart={onRemoveDemo} />
        </View>
      ) : null}
      {!items.length ? (
        <View style={[s.panel, { paddingVertical: 35 }]}>
          <Text style={styles.sectionTitle}>Agrega tus prendas</Text>
          <Text style={[s.subtitle, { marginBottom: 24 }]}>
            Para un conjunto necesitas una parte de arriba, una de abajo y
            calzado; o una prenda completa y calzado.
          </Text>
          <Button label="Agregar prenda" onPress={onAdd} />
          <Button
            secondary
            label="Usar clóset de ejemplo"
            onPress={onUseDemo}
            style={{ marginTop: 10 }}
          />
        </View>
      ) : // The rail needs cut-out photos, so it only presents the example closet; a person's own garments use the album grid.
      items.every((item) => item.isDemo) ? (
        <ClosetRail items={items} onEdit={onEdit} onToggle={onToggle} />
      ) : (
        <ClosetGrid items={items} onEdit={onEdit} />
      )}
      <Button
        secondary
        label="Armar conjunto"
        onPress={onManual}
        style={{ marginTop: 24 }}
      />
    </>
  );
}

function localDay(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function toggle(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: palette.paper },
    loading: {
      flex: 1,
      backgroundColor: palette.paper,
      justifyContent: 'center',
      padding: 36,
      alignItems: 'center',
    },
    logo: {
      fontSize: 48,
      lineHeight: 55,
      fontWeight: '700',
      letterSpacing: -5,
      color: palette.ink,
      paddingRight: 6,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderColor: palette.line,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    brand: {
      color: palette.ink,
      fontSize: 13,
      letterSpacing: -0.2,
      fontWeight: '600',
    },
    brandSub: { color: palette.muted, fontSize: 9, marginTop: 3 },
    localBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: palette.green,
    },
    main: {
      padding: 24,
      paddingTop: 32,
      paddingBottom: 50,
      width: '100%',
      maxWidth: 880,
      alignSelf: 'center',
    },
    pageHeading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 16,
      marginBottom: 20,
    },
    date: { color: palette.muted, fontSize: 12 },
    contextCard: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      backgroundColor: palette.sand,
      borderRadius: 16,
      gap: 10,
      marginTop: 16,
    },
    demo: {
      backgroundColor: palette.wash,
      paddingLeft: 14,
      paddingRight: 4,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      gap: 6,
    },
    outfitCard: {
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.white,
      borderRadius: 24,
      overflow: 'hidden',
    },
    outfitArt: {
      backgroundColor: palette.art,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
      paddingTop: 50,
    },
    outfitTag: { position: 'absolute', top: 19, left: 20 },
    garmentLine: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    heart: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: palette.floating,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alternatives: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      marginTop: 16,
    },
    alternative: { flexGrow: 1, flexBasis: 280, minWidth: 0 },
    footnote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 26,
    },
    tabBar: {
      borderTopWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.paper,
    },
    tabInner: {
      flexDirection: 'row',
      maxWidth: 560,
      alignSelf: 'center',
      width: '100%',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
      paddingBottom: 12,
      gap: 4,
      minHeight: 68,
    },
    tabDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.rust,
      position: 'absolute',
      bottom: 4,
    },
    notice: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 12,
      backgroundColor: palette.wash,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.line,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    error: {
      backgroundColor: palette.errorBg,
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      padding: 14,
    },
    onboarding: {
      maxWidth: 560,
      width: '100%',
      alignSelf: 'center',
      padding: 30,
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 50,
    },
    introArt: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      borderRadius: 28,
      backgroundColor: palette.wash,
      padding: 18,
      marginVertical: 26,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 19,
      color: palette.ink,
      letterSpacing: -0.4,
      marginBottom: 8,
    },
    savedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      padding: 16,
      backgroundColor: palette.white,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.line,
      marginBottom: 10,
      flexWrap: 'wrap',
    },
    swapItem: {
      backgroundColor: palette.white,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.line,
      width: 145,
    },
  });
