import React from 'react';
import { Image, Text, View } from 'react-native';
import {
  SKIN_DEPTH_LABELS,
  STYLE_OPTIONS,
  UNDERTONE_LABELS,
} from '../../domain';
import type { PersonStyleSuggestion } from '../../ai/personStyleContract';
import { photoAnalysisAvailable } from '../item-editor/localPhoto';
import {
  Button,
  Chip,
  ComingSoon,
  FieldLabel,
  SHOW_COMING_SOON,
  useUI,
} from '../ui';
import type { PersonPhoto } from './usePersonPhoto';

function summary(suggestion: PersonStyleSuggestion): string[] {
  const styles = STYLE_OPTIONS.filter((style) =>
    suggestion.styleIds.includes(style.id),
  ).map((style) => style.label);
  return [
    suggestion.skinDepth
      ? `Tono de piel: ${SKIN_DEPTH_LABELS[suggestion.skinDepth]}`
      : '',
    suggestion.undertone
      ? `Subtono: ${UNDERTONE_LABELS[suggestion.undertone]}`
      : '',
    styles.length ? `Estilos de la ropa: ${styles.join(', ')}` : '',
  ].filter(Boolean);
}

function Review({
  suggestion,
  onApply,
  onDismiss,
}: {
  suggestion: PersonStyleSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const { palette, s } = useUI();
  return (
    <View style={[s.panel, { marginTop: 16, borderColor: palette.green }]}>
      <Text
        accessibilityRole="header"
        style={[s.sectionTitle, { marginBottom: 8 }]}
      >
        Revisar análisis
      </Text>
      {summary(suggestion).map((line) => (
        <Text key={line} style={[s.subtitle, { fontSize: 13 }]}>
          {line}
        </Text>
      ))}
      <Text style={[s.subtitle, { fontSize: 11, marginTop: 10 }]}>
        Es una estimación y depende de la luz. Podrás corregirla.
      </Text>
      <Button label="Aplicar" style={{ marginTop: 14 }} onPress={onApply} />
      <Button
        secondary
        label="Descartar"
        style={{ marginTop: 8 }}
        onPress={onDismiss}
      />
    </View>
  );
}

/** Optional photo step. Nothing leaves the device until consent and an explicit tap. */
export function PersonPhotoSection({
  photo,
  onApply,
}: {
  photo: PersonPhoto;
  onApply: (suggestion: PersonStyleSuggestion) => void;
}) {
  const { palette, s } = useUI();
  if (!photoAnalysisAvailable())
    return SHOW_COMING_SOON ? (
      <>
        <FieldLabel>Foto · opcional</FieldLabel>
        <ComingSoon label="Analizar tu foto con IA" />
      </>
    ) : null;
  return (
    <>
      <FieldLabel>Foto · opcional</FieldLabel>
      <View style={s.row}>
        <Button
          secondary
          small
          label="Elegir foto"
          style={{ flex: 1 }}
          onPress={() => void photo.pick(false)}
        />
        <Button
          secondary
          small
          label="Tomar foto"
          style={{ flex: 1 }}
          onPress={() => void photo.pick(true)}
        />
      </View>
      {photo.uri ? (
        <View style={{ marginTop: 14 }}>
          <Image
            source={{ uri: photo.uri }}
            accessibilityLabel="Foto elegida para analizar"
            resizeMode="cover"
            style={{ width: 120, height: 150, borderRadius: 14 }}
          />
          <Text style={[s.subtitle, { fontSize: 12, marginVertical: 12 }]}>
            Al analizarla, esta foto se envía al servidor de la app y a OpenAI
            para proponer tu tono de piel y el estilo de tu ropa. La app no la
            guarda.
          </Text>
          <View style={s.wrap}>
            <Chip
              label="Acepto enviar esta foto a OpenAI"
              selected={photo.consent}
              onPress={() => photo.setConsent(!photo.consent)}
            />
          </View>
          <Button
            secondary
            label={photo.analyzing ? 'Analizando…' : 'Analizar foto'}
            disabled={!photo.consent || photo.analyzing}
            style={{ marginTop: 12 }}
            onPress={() => void photo.analyze()}
          />
          <Button
            secondary
            small
            label={photo.analyzing ? 'Cancelar análisis' : 'Quitar foto'}
            style={{ marginTop: 8 }}
            onPress={photo.analyzing ? photo.cancel : photo.clear}
          />
        </View>
      ) : null}
      {photo.error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, fontSize: 12, marginTop: 12 }}
        >
          {photo.error}
        </Text>
      ) : null}
      {photo.notice ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[s.subtitle, { fontSize: 12, marginTop: 12 }]}
        >
          {photo.notice}
        </Text>
      ) : null}
      {photo.suggestion ? (
        <Review
          suggestion={photo.suggestion}
          onDismiss={photo.cancel}
          onApply={() => {
            onApply(photo.suggestion!);
            photo.applied();
          }}
        />
      ) : null}
    </>
  );
}
