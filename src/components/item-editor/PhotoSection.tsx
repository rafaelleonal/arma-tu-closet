import React from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import type { GarmentSuggestion } from '../../ai/contracts';
import { GarmentSuggestionReview } from '../GarmentSuggestionReview';
import { Button, ComingSoon, useUI } from '../ui';
import { photoAnalysisAvailable } from './localPhoto';
import type { GarmentPhoto } from './useGarmentPhoto';
import { useCopy, type Copy } from '../../i18n';

/** Photo picker, background removal and the optional analysis. The preview sits above it. */
export function PhotoSection({
  photo,
  onApply,
}: {
  photo: GarmentPhoto;
  onApply: (suggestion: GarmentSuggestion) => void;
}) {
  const { s } = useUI();
  const t = useCopy();
  return (
    <>
      <View style={[s.row, { marginTop: 16 }]}>
        <Button
          secondary
          small
          label={photo.busy ? t.photo.saving : t.photo.choose}
          disabled={photo.busy}
          onPress={() => void photo.pick(false)}
          style={{ flex: 1 }}
        />
        <Button
          secondary
          small
          label={t.photo.take}
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
          label={t.city.openSettings}
          style={{ marginTop: 8 }}
          onPress={() =>
            void Linking.openSettings().catch(() =>
              photo.setError(t.photo.openSettingsFailed),
            )
          }
        />
      ) : null}
      {photo.photoUri ? (
        <>
          <Button
            secondary
            small
            label={t.photo.remove}
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
  const t = useCopy();
  return (
    <View style={{ marginTop: 14 }}>
      {photo.cutoutUri ? (
        <Button
          secondary
          small
          label={t.photo.keepBackground}
          onPress={photo.keepOriginal}
        />
      ) : (
        <>
          <Button
            secondary
            small
            label={photo.cutting ? t.photo.cutting : t.photo.cut}
            disabled={photo.cutting || photo.busy}
            onPress={() => void photo.cutBackground()}
          />
          <Text style={[s.subtitle, { fontSize: 11, marginTop: 6 }]}>
            {t.photo.cutLocal}
          </Text>
        </>
      )}
    </View>
  );
}

function analysisLabel(t: Copy, photo: GarmentPhoto) {
  if (photo.analyzing) return t.photo.analyzing;
  if (photo.analysisError) return t.photo.retryAnalysis;
  return photo.suggestion ? t.photo.analyzeAgain : t.photo.analyze;
}

function AnalysisControls({ photo }: { photo: GarmentPhoto }) {
  const { s } = useUI();
  const t = useCopy();
  if (!photoAnalysisAvailable())
    return (
      <View style={{ marginTop: 18 }}>
        <ComingSoon label={t.photo.analyzeWithAi} />
      </View>
    );
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={[s.subtitle, { fontSize: 12, marginBottom: 12 }]}>
        {t.photo.analysisPrivacy}
      </Text>
      <Button
        secondary
        label={analysisLabel(t, photo)}
        disabled={photo.busy || photo.analyzing}
        onPress={() => void photo.analyze()}
      />
      {photo.analyzing ? (
        <Button
          secondary
          small
          label={t.photo.cancelAnalysis}
          onPress={photo.cancelAnalysis}
          style={{ marginTop: 8 }}
        />
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
