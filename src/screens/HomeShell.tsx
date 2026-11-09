import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Outfit, WardrobeItem } from '../domain';
import type { LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';
import type { Autosave } from '../hooks/useAutosave';
import type { UpdateData } from '../hooks/useLocalData';
import type { useRecommendations } from '../hooks/useRecommendations';
import {
  FloatingNotice,
  SaveErrorBanner,
  TabBar,
  type Tab,
} from '../components/AppChrome';
import { ContextEditor } from '../components/ContextEditor';
import { MotionIn } from '../components/Feedback';
import { ManualBuilder } from '../components/ManualBuilder';
import {
  OutfitSheet,
  SwapSheet,
  type SwapTarget,
} from '../components/OutfitSheets';
import { QaClosetToggle, useQaCloset } from '../components/QaClosetToggle';
import { useUI } from '../components/ui';
import { createOutfitActions } from './actions';
import { ClosetSheets } from './ClosetSheets';
import { ClosetScreen } from './ClosetScreen';
import { StyleScreen } from './StyleScreen';
import { TodayScreen } from './TodayScreen';

export interface HomeShellProps {
  data: LocalData;
  update: UpdateData;
  autosave: Autosave;
  weather: ReturnType<typeof useWeather>;
  recs: ReturnType<typeof useRecommendations>;
  tab: Tab;
  onTab: (tab: Tab) => void;
  onPersonalize: () => void;
}

/** The three tabs plus the sheets and editors they open. */
export function HomeShell(props: HomeShellProps) {
  const { data, update, autosave, weather, recs, tab, onTab } = props;
  const { palette } = useUI();
  const contentScroll = useRef<ScrollViewInstance>(null);
  useEffect(() => {
    contentScroll.current?.scrollTo({ y: 0, animated: false });
  }, [tab]);
  const [editor, setEditor] = useState<WardrobeItem | 'new' | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [combineItemId, setCombineItemId] = useState<string | null>(null);
  const [swap, setSwap] = useState<SwapTarget | null>(null);
  const qa = useQaCloset();
  const actions = createOutfitActions(data, update, autosave, () => {
    setSelectedOutfit(null);
    setCombineItemId(null);
  });
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: palette.paper }]}
      edges={['top', 'left', 'right']}
    >
      <SaveErrorBanner
        message={autosave.saveError}
        onRetry={autosave.retrySave}
      />
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={contentScroll}
          contentContainerStyle={styles.main}
          keyboardShouldPersistTaps="handled"
        >
          <MotionIn trigger={tab}>
            {tab === 'today' ? (
              <TodayScreen
                data={data}
                update={update}
                recs={recs}
                weather={weather}
                actions={actions}
                onTab={onTab}
                onEditContext={() => setContextOpen(true)}
                onSwap={setSwap}
                onCombine={setCombineItemId}
              />
            ) : null}
            {tab === 'closet' ? (
              <ClosetScreen
                items={qa.items ?? data.items}
                // A test closet is read-only, so nothing it shows reaches the local document.
                update={qa.items ? () => {} : update}
                onAdd={() => setEditor('new')}
                onEdit={qa.items ? () => {} : setEditor}
                onManual={() => setManualOpen(true)}
                onDemoReady={() =>
                  autosave.noticeAfterSave(
                    'Listo, ya puedes ver el clóset de ejemplo. Quítalo cuando agregues tu ropa.',
                  )
                }
              />
            ) : null}
            {tab === 'style' ? (
              <StyleScreen
                data={data}
                update={update}
                onPersonalize={props.onPersonalize}
                onOpenOutfit={setSelectedOutfit}
                onNoticeAfterSave={autosave.noticeAfterSave}
              />
            ) : null}
          </MotionIn>
        </ScrollView>
        <FloatingNotice
          message={autosave.notice}
          onClose={() => autosave.setNotice('')}
        />
        {qa.enabled && tab === 'closet' ? (
          <QaClosetToggle mode={qa.mode} onChange={qa.setMode} />
        ) : null}
      </View>
      <TabBar
        tab={tab}
        onChange={(value) => {
          onTab(value);
          autosave.setNotice('');
        }}
      />
      <ClosetSheets
        data={data}
        update={update}
        autosave={autosave}
        context={recs.context}
        actions={actions}
        editor={editor}
        setEditor={setEditor}
        combineItemId={combineItemId}
        setCombineItemId={setCombineItemId}
      />
      {contextOpen ? (
        <ContextEditor
          value={data.context}
          weather={data.weather}
          onClose={() => setContextOpen(false)}
          onSave={(value, settings) => {
            update((current) => {
              // Keep a newer forecast fetched while the editor was open for the same city.
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
            onTab('style');
            autosave.noticeAfterSave('Outfit guardado.');
          }}
        />
      ) : null}
      {selectedOutfit ? (
        <OutfitSheet
          data={data}
          outfit={selectedOutfit}
          saved={actions.isSaved(selectedOutfit)}
          saveError={autosave.saveError}
          onClose={() => setSelectedOutfit(null)}
          onFavorite={() => actions.favorite(selectedOutfit)}
          onWorn={() => actions.worn(selectedOutfit)}
          onItem={(item) => {
            setSwap({ outfit: selectedOutfit, category: item.category });
            setSelectedOutfit(null);
          }}
        />
      ) : null}
      {swap ? (
        <SwapSheet
          data={data}
          swap={swap}
          context={recs.context}
          onClose={() => setSwap(null)}
          onResult={(change) => {
            autosave.setNotice(change.message);
            if (change.status === 'swapped') {
              setSwap(null);
              setSelectedOutfit(change.outfit);
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  main: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 50,
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
  },
});
