import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LocalData } from '../storage/local';
import type { Autosave } from '../hooks/useAutosave';
import type { UpdateData } from '../hooks/useLocalData';
import { Logo, SaveErrorBanner } from '../components/AppChrome';
import { Onboarding, type OnboardingEntry } from '../components/Onboarding';
import { Button, useUI } from '../components/ui';
import { withDemo } from './actions';

export function LoadingScreen({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const { palette, s } = useUI();
  return (
    <SafeAreaView style={[styles.loading, { backgroundColor: palette.paper }]}>
      <Logo />
      {error ? (
        <>
          <Text
            accessibilityRole="alert"
            style={[s.subtitle, { textAlign: 'center', marginVertical: 24 }]}
          >
            {error}
          </Text>
          <Button label="Intentar de nuevo" onPress={onRetry} />
        </>
      ) : (
        <ActivityIndicator color={palette.green} />
      )}
    </SafeAreaView>
  );
}

/** First run and later edits. Choosing the example closet only applies on the first run. */
export function OnboardingScreen({
  data,
  update,
  autosave,
  onClose,
  onFinish,
}: {
  data: LocalData;
  update: UpdateData;
  autosave: Autosave;
  onClose: () => void;
  onFinish: (entry: OnboardingEntry) => void;
}) {
  const { palette } = useUI();
  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <SaveErrorBanner
        message={autosave.saveError}
        onRetry={autosave.retrySave}
      />
      <Onboarding
        data={data}
        mode={data.onboarded ? 'edit' : 'initial'}
        onChange={(patch) => update((current) => ({ ...current, ...patch }))}
        onClose={data.onboarded ? onClose : undefined}
        onFinish={(entry) => {
          update((current) => {
            const next: LocalData = {
              ...current,
              onboarded: true,
              onboarding: { step: 0 },
            };
            return current.onboarded || entry !== 'demo'
              ? next
              : withDemo(next);
          });
          autosave.noticeAfterSave('Preferencias guardadas.');
          onFinish(entry);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    padding: 36,
    alignItems: 'center',
  },
});
