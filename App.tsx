import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Tab } from './src/components/AppChrome';
import { FeedbackProvider } from './src/components/Feedback';
import { useAutosave } from './src/hooks/useAutosave';
import { useLocalData, type UpdateData } from './src/hooks/useLocalData';
import { useRecommendations } from './src/hooks/useRecommendations';
import { HomeShell } from './src/screens/HomeShell';
import { LoadingScreen, OnboardingScreen } from './src/screens/StartScreens';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { useWeather } from './src/weather/useWeather';

export default function App() {
  const local = useLocalData();
  const { data } = local;
  return (
    <SafeAreaProvider>
      <ThemeProvider themeId={data?.appearance.themeId ?? 'linen'}>
        <FeedbackProvider enabled={data?.appearance.hapticsEnabled !== false}>
          <Main local={local} />
        </FeedbackProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/** Chooses between loading, onboarding and the tabs; the data hooks live here so they survive that switch. */
function Main({ local }: { local: ReturnType<typeof useLocalData> }) {
  const { data, setData, hydrated, loadError, retry } = local;
  const autosave = useAutosave(data, hydrated, setData);
  const weather = useWeather(data, setData);
  const recs = useRecommendations(data, weather);
  const [personalizing, setPersonalizing] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  if (!hydrated || !data)
    return <LoadingScreen error={loadError} onRetry={retry} />;
  const update: UpdateData = (fn) =>
    setData((current) => (current ? fn(current) : current));
  if (!data.onboarded || personalizing)
    return (
      <OnboardingScreen
        data={data}
        update={update}
        autosave={autosave}
        onClose={() => setPersonalizing(false)}
        onFinish={(entry) => {
          setPersonalizing(false);
          setTab(
            entry === 'own' ? 'closet' : entry === 'keep' ? 'style' : 'today',
          );
        }}
      />
    );
  return (
    <HomeShell
      data={data}
      update={update}
      autosave={autosave}
      weather={weather}
      recs={recs}
      tab={tab}
      onTab={setTab}
      onPersonalize={() => {
        update((current) => ({ ...current, onboarding: { step: 0 } }));
        setPersonalizing(true);
      }}
    />
  );
}
