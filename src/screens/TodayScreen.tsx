import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';
import type { UpdateData } from '../hooks/useLocalData';
import type { useRecommendations } from '../hooks/useRecommendations';
import { useAiOutfitChoice } from '../hooks/useAiOutfitChoice';
import { DemoBanner, type Tab } from '../components/AppChrome';
import type { SwapTarget } from '../components/OutfitSheets';
import {
  ExploreGaps,
  ExploreToggle,
} from '../components/style-goal/ExploreControl';
import { OutfitDeck } from '../components/today/OutfitDeck';
import { WearMoreNudge } from '../components/today/WearMoreNudge';
import { WeatherNotice, WeatherPill } from '../components/WeatherCard';
import { Button, useUI } from '../components/ui';
import { useI18n, type Copy } from '../i18n';
import { withoutDemo, type OutfitActions } from './actions';

interface TodayScreenProps {
  data: LocalData;
  update: UpdateData;
  recs: ReturnType<typeof useRecommendations>;
  weather: ReturnType<typeof useWeather>;
  actions: OutfitActions;
  onTab: (tab: Tab) => void;
  onEditContext: () => void;
  onSwap: (swap: SwapTarget) => void;
  onCombine: (itemId: string) => void;
}

/** Height of the example-closet banner and its margin. */
const DEMO_BANNER = 56;

function todayLabel(name: string, locale: string) {
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  return name
    ? `${name} · ${date}`
    : date.charAt(0).toUpperCase() + date.slice(1);
}

export function TodayScreen(props: TodayScreenProps) {
  const { data, update, recs, weather, onTab, onEditContext } = props;
  const { palette, s } = useUI();
  const { t, locale } = useI18n();
  return (
    <>
      <Text style={{ color: palette.muted, fontSize: 12 }}>
        {todayLabel(data.profile.name, locale)}
      </Text>
      <View style={[s.pageHeading, { columnGap: 12, rowGap: 8 }]}>
        <Text accessibilityRole="header" style={s.title}>
          {t.today.title}
        </Text>
        <WeatherPill
          data={data}
          context={recs.context}
          weather={weather}
          onEdit={onEditContext}
        />
      </View>
      {data.items.some((item) => item.isDemo) ? (
        <View style={{ marginBottom: 16 }}>
          <DemoBanner
            onStart={() => {
              update(withoutDemo);
              onTab('closet');
            }}
          />
        </View>
      ) : null}
      {recs.recommendations.length ? (
        <Recommendations {...props} />
      ) : (
        <NoOutfits {...props} />
      )}
      <ExploreGaps data={data} context={recs.context} />
      {data.weather.mode === 'automatic' ? (
        <WeatherNotice weather={weather} />
      ) : null}
    </>
  );
}

function Recommendations({
  data,
  update,
  recs,
  actions,
  onSwap,
  onCombine,
}: TodayScreenProps) {
  const ai = useAiOutfitChoice(recs.recommendations, recs.context);
  const wearMore = recs.wearMoreItem;
  return (
    <>
      <OutfitDeck
        // A new set of ideas starts again from its first page.
        key={ai.outfits.map((outfit) => outfit.id).join('|')}
        outfits={ai.outfits}
        compact={data.appearance.outfitLayout === 'compact'}
        reserved={data.items.some((item) => item.isDemo) ? DEMO_BANNER : 0}
        showReasons={data.appearance.showReasons}
        isSaved={actions.isSaved}
        onFavorite={actions.favorite}
        onWorn={actions.worn}
        onItem={(outfit, item) => onSwap({ outfit, category: item.category })}
        onDismiss={(outfit) => {
          update((current) => ({
            ...current,
            dislikedOutfitIds: [
              ...new Set([...current.dislikedOutfitIds, outfit.id]),
            ],
          }));
          recs.regenerate();
        }}
        trailing={<ExploreToggle data={data} update={update} />}
      />
      {wearMore ? (
        <WearMoreNudge item={wearMore} onPress={() => onCombine(wearMore.id)} />
      ) : null}
      {ai.enabled ? <AiChoiceControl choice={ai} /> : null}
    </>
  );
}

/** A quiet link: the idea on screen stays the protagonist. A choice made by AI always says so. */
function AiChoiceControl({
  choice,
}: {
  choice: ReturnType<typeof useAiOutfitChoice>;
}) {
  const { palette, s } = useUI();
  const { t } = useI18n();
  const note = [s.subtitle, { fontSize: 12 }];
  const pending = choice.status === 'pending';
  if (choice.status === 'ready')
    return (
      <Text accessibilityLiveRegion="polite" style={[note, { marginTop: 12 }]}>
        {t.today.aiChosen}
      </Text>
    );
  return (
    <View style={[s.row, { marginTop: 4, gap: 12 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: pending }}
        disabled={pending}
        onPress={() => void choice.request()}
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: pending ? palette.muted : palette.rust,
          }}
        >
          {pending ? t.today.aiPending : t.today.aiChoose}
        </Text>
      </Pressable>
      {choice.status === 'failed' ? (
        <Text accessibilityRole="alert" style={[note, { flex: 1 }]}>
          {t.today.aiFailed}
        </Text>
      ) : null}
    </View>
  );
}

function noOutfitsMessage(t: Copy, result: TodayScreenProps['recs']['result']) {
  if (result.outfits.length) return t.today.noMoreIdeas;
  return result.problem ? t.problems.recommendation(result.problem) : '';
}

function NoOutfits({ data, update, recs, onTab }: TodayScreenProps) {
  const { palette, s } = useUI();
  const { t } = useI18n();
  return (
    <>
      <View style={[s.panel, { paddingVertical: 35 }]}>
        <Text style={{ fontSize: 28, marginBottom: 14, color: palette.ink }}>
          {t.today.emptyTitle}
        </Text>
        <Text style={s.subtitle}>{noOutfitsMessage(t, recs.result)}</Text>
        <View style={[s.row, { marginTop: 22, flexWrap: 'wrap' }]}>
          <Button label={t.today.goToCloset} onPress={() => onTab('closet')} />
          {data.dislikedOutfitIds.length ? (
            <Button
              secondary
              label={t.today.showPrevious}
              onPress={() =>
                update((current) => ({ ...current, dislikedOutfitIds: [] }))
              }
            />
          ) : (
            <Button
              secondary
              label={t.today.reviewStyle}
              onPress={() => onTab('style')}
            />
          )}
        </View>
      </View>
      {/* Without ideas the toggle still has to be reachable to turn exploring off. */}
      <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
        <ExploreToggle data={data} update={update} />
      </View>
    </>
  );
}
