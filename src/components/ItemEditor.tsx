import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  CATEGORIES,
  categoryLabels,
  COLOR_OPTIONS,
  colorLabels,
  OCCASIONS,
  occasionLabels,
  STYLE_OPTIONS,
  type Category,
  type Occasion,
  type StyleId,
  type WardrobeItem,
} from '../domain';
import { persistPhoto } from '../storage/local';
import { Garment } from './Garment';
import { Sheet } from './Sheet';
import { Button, Chip, colorHex, FieldLabel, useUI } from './ui';
import {
  analyzeGarmentPhoto,
  AiClientError,
  imageMimeTypeFromBase64,
  resolveAiApiUrl,
  validateImageDataUrl,
} from '../ai/client';
import { MAX_IMAGE_BYTES, type GarmentSuggestion } from '../ai/contracts';
import { useFeedback } from './Feedback';
import {
  defaultWarmth,
  itemFormErrors,
  itemFormFingerprint,
  suggestedItemName,
} from './itemForm';
import { GarmentSuggestionReview } from './GarmentSuggestionReview';
import {
  isSubjectCutoutAvailable,
  removeBackground,
} from '../../modules/subject-cutout';

const warmthLabels = [
  'Muy ligera',
  'Ligera',
  'Abrigadora',
  'Muy abrigadora',
] as const;

export function ItemEditor({
  item,
  onSave,
  onClose,
}: {
  item?: WardrobeItem;
  onSave: (item: WardrobeItem) => void;
  onClose: () => void;
}) {
  const { palette, s } = useUI();
  const { reduceMotion } = useFeedback();
  const scroll = useRef<ScrollViewInstance>(null);
  const fieldY = useRef({ colors: 0, details: 0 });
  const id = useRef(item?.id || `item-${Date.now()}`);
  const [submitted, setSubmitted] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState<Category>(item?.category || 'top');
  // New items start without a color so a default is never saved by accident.
  const [colors, setColors] = useState<string[]>(item?.colors || []);
  const [occasions, setOccasions] = useState<Occasion[]>(
    item?.occasions || ['casual'],
  );
  const [styleIds, setStyleIds] = useState<StyleId[]>(item?.styleIds || []);
  const [styleNotice, setStyleNotice] = useState('');
  const [warmth, setWarmth] = useState<0 | 1 | 2 | 3>(
    item?.warmth ?? defaultWarmth('top'),
  );
  const warmthChosen = useRef(!!item);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rainReady, setRainReady] = useState(item?.rainReady || false);
  const [available, setAvailable] = useState(item?.available ?? true);
  const [photoUri, setPhotoUri] = useState(item?.photoUri);
  const [cutoutUri, setCutoutUri] = useState(item?.cutoutUri);
  const [cutting, setCutting] = useState(false);
  const cutoutSupported = useRef(isSubjectCutoutAvailable()).current;
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<GarmentSuggestion | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisNotice, setAnalysisNotice] = useState('');
  const active = useRef(true);
  const analysisJob = useRef(0);
  const photoJob = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      analysisJob.current++;
      photoJob.current++;
      controller.current?.abort();
    };
  }, []);
  function cancelAnalysis() {
    analysisJob.current++;
    controller.current?.abort();
    controller.current = null;
    setAnalyzing(false);
    setSuggestion(null);
    setAnalysisError('');
    setAnalysisNotice('');
  }
  function discardAndClose() {
    photoJob.current++;
    cancelAnalysis();
    onClose();
  }
  function closeEditor() {
    if (itemFormFingerprint(draft) === initialFingerprint.current) {
      discardAndClose();
      return;
    }
    setConfirmClose(true);
    scroll.current?.scrollTo({ y: 0, animated: !reduceMotion });
  }
  function chooseCategory(value: Category) {
    setCategory(value);
    if (!warmthChosen.current) setWarmth(defaultWarmth(value));
  }
  function save() {
    setSubmitted(true);
    if (errors.colors) {
      scroll.current?.scrollTo({
        y: fieldY.current.colors,
        animated: !reduceMotion,
      });
      return;
    }
    if (errors.occasions) {
      setDetailsOpen(true);
      scroll.current?.scrollTo({
        y: fieldY.current.details,
        animated: !reduceMotion,
      });
      return;
    }
    cancelAnalysis();
    onSave(draft);
  }
  async function cutBackground() {
    if (!photoUri) return;
    const job = photoJob.current;
    setCutting(true);
    setPhotoError('');
    try {
      const result = await removeBackground(photoUri);
      if (active.current && job === photoJob.current) setCutoutUri(result.uri);
    } catch (failure) {
      if (active.current && job === photoJob.current)
        setPhotoError(
          failure instanceof Error
            ? failure.message
            : 'No pudimos quitar el fondo. Puedes usar la foto original.',
        );
    } finally {
      if (active.current) setCutting(false);
    }
  }
  async function analyzePhoto() {
    if (!photoUri) return;
    cancelAnalysis();
    const job = analysisJob.current;
    const abort = new AbortController();
    controller.current = abort;
    setAnalyzing(true);
    try {
      const apiUrl = resolveAiApiUrl(
        Platform.OS,
        process.env.EXPO_PUBLIC_AI_API_URL,
        Platform.OS === 'web' ? window.location.hostname : undefined,
      );
      const imageDataUrl = await localPhotoDataUrl(photoUri);
      if (!active.current || job !== analysisJob.current) return;
      const result = await analyzeGarmentPhoto(imageDataUrl, {
        apiUrl,
        signal: abort.signal,
      });
      if (active.current && job === analysisJob.current) setSuggestion(result);
    } catch (failure) {
      if (
        active.current &&
        job === analysisJob.current &&
        !(failure instanceof AiClientError && failure.code === 'aborted')
      )
        setAnalysisError(
          failure instanceof Error
            ? failure.message
            : 'No pudimos analizar la foto. Puedes completar los datos manualmente.',
        );
    } finally {
      if (active.current && job === analysisJob.current) {
        setAnalyzing(false);
        controller.current = null;
      }
    }
  }
  const draft: WardrobeItem = {
    ...item,
    id: id.current,
    name: name.trim() || suggestedItemName(category, colors),
    category,
    colors,
    occasions,
    styleIds,
    warmth,
    rainReady,
    available,
    photoUri,
    cutoutUri: photoUri ? cutoutUri : undefined,
    isDemo: item?.isDemo || false,
  };
  const initialFingerprint = useRef(itemFormFingerprint(draft));
  const errors = itemFormErrors(draft);
  const detailsSummary = [
    occasions.map((value) => occasionLabels[value]).join(', ') || 'Sin ocasión',
    warmthLabels[warmth],
    rainReady ? 'Para lluvia' : '',
    styleIds.length
      ? `${styleIds.length} ${styleIds.length === 1 ? 'estilo' : 'estilos'}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
  async function pickPhoto(camera: boolean) {
    cancelAnalysis();
    const job = ++photoJob.current;
    setPhotoError('');
    setPermissionBlocked(false);
    setBusy(true);
    try {
      if (camera) {
        let permission = await ImagePicker.getCameraPermissionsAsync();
        if (!active.current || job !== photoJob.current) return;
        if (!permission.granted && permission.canAskAgain)
          permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!active.current || job !== photoJob.current) return;
        if (!permission.granted) {
          setPermissionBlocked(!permission.canAskAgain);
          setPhotoError(
            permission.canAskAgain
              ? 'Permite la cámara para tomar una foto.'
              : 'La cámara está bloqueada. Actívala en Ajustes o elige una foto.',
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.65,
        base64: Platform.OS === 'web',
        allowsEditing: false,
      };
      const result = camera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!active.current || job !== photoJob.current) return;
      if (result.canceled) return;
      const asset = result.assets[0];
      const persisted = await persistPhoto(
        asset.uri,
        asset.base64,
        asset.mimeType,
      );
      if (active.current && job === photoJob.current) {
        setPhotoUri(persisted);
        setCutoutUri(undefined);
      }
    } catch {
      if (active.current && job === photoJob.current)
        setPhotoError(
          'No pudimos guardar la foto. Revisa el permiso o usa una imagen más pequeña; también puedes continuar sin foto.',
        );
    } finally {
      if (active.current && job === photoJob.current) setBusy(false);
    }
  }
  return (
    <Sheet
      title={item ? 'Editar prenda' : 'Agregar prenda'}
      onClose={closeEditor}
      scrollRef={scroll}
    >
      {confirmClose ? (
        <View style={[s.panel, { marginTop: 16 }]}>
          <Text
            accessibilityRole="alert"
            style={{ color: palette.ink, fontSize: 18, marginBottom: 16 }}
          >
            ¿Descartar cambios?
          </Text>
          <Button
            label="Seguir editando"
            onPress={() => setConfirmClose(false)}
          />
          <Button
            secondary
            label="Descartar cambios"
            onPress={discardAndClose}
            style={{ marginTop: 8 }}
          />
        </View>
      ) : null}
      <FieldLabel>Foto · opcional</FieldLabel>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: palette.wash,
          padding: 20,
          borderRadius: 20,
          marginVertical: 18,
        }}
      >
        <Garment item={draft} size={150} />
      </View>
      <View style={s.row}>
        <Button
          secondary
          small
          label={busy ? 'Guardando foto…' : 'Elegir foto'}
          disabled={busy}
          onPress={() => void pickPhoto(false)}
          style={{ flex: 1 }}
        />
        <Button
          secondary
          small
          label="Tomar foto"
          disabled={busy}
          onPress={() => void pickPhoto(true)}
          style={{ flex: 1 }}
        />
      </View>
      {photoError ? (
        <Text
          accessibilityRole="alert"
          style={{
            color: palette.rust,
            fontSize: 12,
            lineHeight: 19,
            marginTop: 12,
          }}
        >
          {photoError}
        </Text>
      ) : null}
      {permissionBlocked && Platform.OS !== 'web' ? (
        <Button
          secondary
          small
          label="Abrir Ajustes"
          style={{ marginTop: 8 }}
          onPress={() =>
            void Linking.openSettings().catch(() =>
              setPhotoError('Abre Ajustes y activa Cámara para esta app.'),
            )
          }
        />
      ) : null}
      {photoUri ? (
        <>
          <Button
            secondary
            small
            label="Quitar foto"
            onPress={() => {
              cancelAnalysis();
              photoJob.current++;
              setPhotoUri(undefined);
              setCutoutUri(undefined);
              setBusy(false);
            }}
            style={{ marginTop: 8 }}
          />
          {cutoutSupported ? (
            <View style={{ marginTop: 14 }}>
              {cutoutUri ? (
                <View style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={[s.subtitle, { fontSize: 12, flex: 1 }]}>
                    Se mostrará sin fondo. La foto original se conserva.
                  </Text>
                  <Button
                    secondary
                    small
                    label="Usar original"
                    onPress={() => setCutoutUri(undefined)}
                  />
                </View>
              ) : (
                <>
                  <Button
                    secondary
                    small
                    label={cutting ? 'Quitando fondo…' : 'Quitar fondo'}
                    disabled={cutting || busy}
                    onPress={() => void cutBackground()}
                  />
                  <Text style={[s.subtitle, { fontSize: 11, marginTop: 6 }]}>
                    Se hace en este teléfono; la foto no se envía.
                  </Text>
                </>
              )}
            </View>
          ) : null}
          <View style={{ marginTop: 18 }}>
            <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
              Se enviará esta foto a OpenAI para proponer nombre, categoría y
              colores. Es opcional; puedes completar los datos a mano.
            </Text>
            <Button
              secondary
              label={
                analyzing
                  ? 'Analizando…'
                  : analysisError
                    ? 'Reintentar análisis'
                    : suggestion
                      ? 'Analizar de nuevo'
                      : 'Analizar foto'
              }
              disabled={busy || analyzing}
              onPress={() => void analyzePhoto()}
            />
            {analyzing ? (
              <>
                <Text
                  accessibilityLiveRegion="polite"
                  style={[s.subtitle, { fontSize: 11, marginTop: 10 }]}
                >
                  Puedes seguir editando a mano. El análisis no cambiará el
                  formulario.
                </Text>
                <Button
                  secondary
                  small
                  label="Cancelar análisis"
                  onPress={cancelAnalysis}
                  style={{ marginTop: 8 }}
                />
              </>
            ) : null}
            {analysisError ? (
              <Text
                accessibilityRole="alert"
                style={{
                  color: palette.rust,
                  fontSize: 12,
                  lineHeight: 19,
                  marginTop: 12,
                }}
              >
                {analysisError}
              </Text>
            ) : null}
            {analysisNotice ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[s.subtitle, { fontSize: 12, marginTop: 12 }]}
              >
                {analysisNotice}
              </Text>
            ) : null}
          </View>
          {suggestion ? (
            <GarmentSuggestionReview
              suggestion={suggestion}
              onDismiss={cancelAnalysis}
              onApply={(confirmed) => {
                setName(confirmed.name);
                chooseCategory(confirmed.category);
                setColors([...confirmed.colors]);
                setSuggestion(null);
                setAnalysisNotice(
                  'Datos aplicados. Revisa los demás campos y guarda la prenda.',
                );
              }}
            />
          ) : null}
        </>
      ) : null}
      <FieldLabel>Categoría</FieldLabel>
      <View style={s.wrap}>
        {CATEGORIES.map((value) => (
          <Chip
            key={value}
            label={categoryLabels[value]}
            selected={category === value}
            onPress={() => chooseCategory(value)}
          />
        ))}
      </View>
      <View
        onLayout={(event) => {
          fieldY.current.colors = event.nativeEvent.layout.y;
        }}
      >
        <FieldLabel>Colores</FieldLabel>
        <Text style={[s.subtitle, { fontSize: 11, marginBottom: 12 }]}>
          Incluye los detalles de color. Elige al menos uno.
        </Text>
        <View style={s.wrap}>
          {COLOR_OPTIONS.map((value) => (
            <Chip
              key={value}
              swatch={colorHex[value]}
              label={colorLabels[value]}
              selected={colors.includes(value)}
              onPress={() =>
                setColors((current) =>
                  current.includes(value)
                    ? current.filter((color) => color !== value)
                    : [...current, value],
                )
              }
            />
          ))}
        </View>
        {submitted && errors.colors ? (
          <Text
            accessibilityRole="alert"
            style={{ color: palette.rust, marginTop: 8, fontSize: 12 }}
          >
            {errors.colors}
          </Text>
        ) : null}
      </View>
      <FieldLabel>Nombre · opcional</FieldLabel>
      <TextInput
        accessibilityLabel="Nombre de la prenda, opcional"
        accessibilityHint={
          name.trim() || !colors.length
            ? undefined
            : `Si lo dejas vacío se llamará ${draft.name}`
        }
        placeholderTextColor={palette.muted}
        placeholder={
          name.trim()
            ? undefined
            : suggestedItemName(category, colors) || 'Ej. Camisa de lino'
        }
        value={name}
        maxLength={60}
        onChangeText={setName}
        style={s.input}
      />
      {item ? (
        <View
          style={[s.row, { justifyContent: 'space-between', marginTop: 22 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.ink }}>Disponible para usar</Text>
            <Text style={[s.subtitle, { fontSize: 12 }]}>
              Desactívala si está en la lavandería.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Disponible para usar"
            value={available}
            onValueChange={setAvailable}
            trackColor={{ true: palette.green }}
          />
        </View>
      ) : null}
      <View
        onLayout={(event) => {
          fieldY.current.details = event.nativeEvent.layout.y;
        }}
        style={{ marginTop: 24, borderTopWidth: 1, borderColor: palette.line }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: detailsOpen }}
          aria-expanded={detailsOpen}
          accessibilityLabel={`Más detalles: ${detailsSummary}`}
          onPress={() => setDetailsOpen((open) => !open)}
          style={{
            minHeight: 64,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: palette.ink, fontSize: 15, fontWeight: '600' }}
            >
              Más detalles
            </Text>
            <Text
              numberOfLines={2}
              style={[
                s.subtitle,
                { fontSize: 12, lineHeight: 18, marginTop: 3 },
              ]}
            >
              {detailsSummary}
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
            {detailsOpen ? '−' : '+'}
          </Text>
        </Pressable>
        {submitted && errors.occasions && !detailsOpen ? (
          <Text
            accessibilityRole="alert"
            style={{ color: palette.rust, fontSize: 12 }}
          >
            {errors.occasions}
          </Text>
        ) : null}
      </View>
      {detailsOpen ? (
        <>
          <Text style={[s.subtitle, { fontSize: 12 }]}>
            Afinan las sugerencias. Puedes dejarlos como están.
          </Text>
          <FieldLabel>¿Para qué la usas?</FieldLabel>
          <View style={s.wrap}>
            {OCCASIONS.map((value) => (
              <Chip
                key={value}
                label={occasionLabels[value]}
                selected={occasions.includes(value)}
                onPress={() =>
                  setOccasions((current) =>
                    current.includes(value)
                      ? current.filter((x) => x !== value)
                      : [...current, value],
                  )
                }
              />
            ))}
          </View>
          {submitted && errors.occasions ? (
            <Text
              accessibilityRole="alert"
              style={{ color: palette.rust, marginTop: 8, fontSize: 12 }}
            >
              {errors.occasions}
            </Text>
          ) : null}
          <FieldLabel>Qué tanto abriga</FieldLabel>
          <View style={s.wrap}>
            {warmthLabels.map((label, index) => (
              <Chip
                key={label}
                label={label}
                selected={warmth === index}
                onPress={() => {
                  warmthChosen.current = true;
                  setWarmth(index as 0 | 1 | 2 | 3);
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
              onValueChange={setRainReady}
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
                  setStyleIds((current) =>
                    current.includes(option.id)
                      ? current.filter((id) => id !== option.id)
                      : [...current, option.id],
                  );
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
      <Button
        label={item ? 'Guardar cambios' : 'Agregar prenda'}
        disabled={busy}
        style={{ marginTop: 26 }}
        onPress={save}
      />
    </Sheet>
  );
}

async function localPhotoDataUrl(uri: string): Promise<string> {
  if (uri.startsWith('data:')) {
    validateImageDataUrl(uri);
    return uri;
  }
  if (Platform.OS === 'web' || !uri.startsWith('file://'))
    throw new AiClientError(
      'image',
      'Elige una foto local JPEG, PNG o WebP para analizar.',
    );
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || info.isDirectory)
    throw new AiClientError(
      'image',
      'No encontramos la foto en este dispositivo. Vuelve a elegirla.',
    );
  if (info.size > MAX_IMAGE_BYTES)
    throw new AiClientError(
      'image',
      'La foto supera 4 MiB. Elige una más pequeña para analizar.',
    );
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imageDataUrl = `data:${imageMimeTypeFromBase64(base64)};base64,${base64}`;
  validateImageDataUrl(imageDataUrl);
  return imageDataUrl;
}
