import React from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import type { WardrobeItem } from '../../domain';
import type { GarmentSuggestion } from '../../ai/contracts';
import { Garment } from '../Garment';
import { GarmentSuggestionReview } from '../GarmentSuggestionReview';
import { Button, FieldLabel, useUI } from '../ui';
import type { GarmentPhoto } from './useGarmentPhoto';

/** Photo preview, picker, background removal and the optional analysis. */
export function PhotoSection({
  draft,
  photo,
  onApply,
}: {
  draft: WardrobeItem;
  photo: GarmentPhoto;
  onApply: (suggestion: GarmentSuggestion) => void;
}) {
  const { palette, s } = useUI();
  return (
    <>
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
          label={photo.busy ? 'Guardando foto…' : 'Elegir foto'}
          disabled={photo.busy}
          onPress={() => void photo.pick(false)}
          style={{ flex: 1 }}
        />
        <Button
          secondary
          small
          label="Tomar foto"
          disabled={photo.busy}
          onPress={() => void photo.pick(true)}
          style={{ flex: 1 }}
        />
      </View>
      <ErrorText message={photo.error} />
      {photo.permissionBlocked && Platform.OS !== 'web' ? (
        <Button
          secondary
          small
          label="Abrir Ajustes"
          style={{ marginTop: 8 }}
          onPress={() =>
            void Linking.openSettings().catch(() =>
              photo.setError('Abre Ajustes y activa Cámara para esta app.'),
            )
          }
        />
      ) : null}
      {photo.photoUri ? (
        <>
          <Button
            secondary
            small
            label="Quitar foto"
            onPress={photo.remove}
            style={{ marginTop: 8 }}
          />
          {photo.cutoutSupported ? <CutoutControls photo={photo} /> : null}
          <AnalysisControls photo={photo} />
          {photo.suggestion ? (
            <GarmentSuggestionReview
              suggestion={photo.suggestion}
              onDismiss={photo.cancelAnalysis}
              onApply={(confirmed) => {
                onApply(confirmed);
                photo.suggestionApplied();
              }}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}

function ErrorText({ message }: { message: string }) {
  const { palette } = useUI();
  if (!message) return null;
  return (
    <Text
      accessibilityRole="alert"
      style={{
        color: palette.rust,
        fontSize: 12,
        lineHeight: 19,
        marginTop: 12,
      }}
    >
      {message}
    </Text>
  );
}

function CutoutControls({ photo }: { photo: GarmentPhoto }) {
  const { s } = useUI();
  return (
    <View style={{ marginTop: 14 }}>
      {photo.cutoutUri ? (
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={[s.subtitle, { fontSize: 12, flex: 1 }]}>
            Se mostrará sin fondo. La foto original se conserva.
          </Text>
          <Button
            secondary
            small
            label="Usar original"
            onPress={photo.keepOriginal}
          />
        </View>
      ) : (
        <>
          <Button
            secondary
            small
            label={photo.cutting ? 'Quitando fondo…' : 'Quitar fondo'}
            disabled={photo.cutting || photo.busy}
            onPress={() => void photo.cutBackground()}
          />
          <Text style={[s.subtitle, { fontSize: 11, marginTop: 6 }]}>
            Se hace en este teléfono; la foto no se envía.
          </Text>
        </>
      )}
    </View>
  );
}

function analysisLabel(photo: GarmentPhoto) {
  if (photo.analyzing) return 'Analizando…';
  if (photo.analysisError) return 'Reintentar análisis';
  return photo.suggestion ? 'Analizar de nuevo' : 'Analizar foto';
}

function AnalysisControls({ photo }: { photo: GarmentPhoto }) {
  const { s } = useUI();
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
        Se enviará esta foto a OpenAI para proponer nombre, categoría y colores.
        Es opcional; puedes completar los datos a mano.
      </Text>
      <Button
        secondary
        label={analysisLabel(photo)}
        disabled={photo.busy || photo.analyzing}
        onPress={() => void photo.analyze()}
      />
      {photo.analyzing ? (
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
            onPress={photo.cancelAnalysis}
            style={{ marginTop: 8 }}
          />
        </>
      ) : null}
      <ErrorText message={photo.analysisError} />
      {photo.analysisNotice ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[s.subtitle, { fontSize: 12, marginTop: 12 }]}
        >
          {photo.analysisNotice}
        </Text>
      ) : null}
    </View>
  );
}
