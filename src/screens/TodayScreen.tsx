import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Outfit } from '../domain';
import type { LocalData } from '../storage/local';
import type { useWeather } from '../weather/useWeather';
import type { UpdateData } from '../hooks/useLocalData';
import type { useRecommendations } from '../hooks/useRecommendations';
import { DemoBanner, type Tab } from '../components/AppChrome';
import { OutfitCard } from '../components/OutfitCard';
import type { SwapTarget } from '../components/OutfitSheets';
import { WeatherCard } from '../components/WeatherCard';
import { Button, SectionLabel, useUI } from '../components/ui';
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
  onDetails: (outfit: Outfit) => void;
}

export function TodayScreen(props: TodayScreenProps) {
  const { data, update, recs, weather, onTab, onEditContext } = props;
  const { palette, s } = useUI();
  const count = recs.recommendations.length;
  return (
    <>
      <View style={s.pageHeading}>
        <View>
          {data.profile.name ? (
            <SectionLabel>{data.profile.name}</SectionLabel>
          ) : null}
          <Text accessibilityRole="header" style={s.title}>
            Hoy
          </Text>
        </View>
        <Text style={{ color: palette.muted, fontSize: 12 }}>
          {new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'long',
          }).format(new Date())}
        </Text>
      </View>
      {data.items.some((item) => item.isDemo) ? (
        <DemoBanner
          onStart={() => {
            update(withoutDemo);
            onTab('closet');
          }}
        />
      ) : null}
      <WeatherCard
        data={data}
        context={recs.context}
        weather={weather}
        onEdit={onEditContext}
      />
      <View
        style={[
          s.row,
          { justifyContent: 'space-between', marginTop: 30, marginBottom: 14 },
        ]}
      >
        <SectionLabel>Conjuntos</SectionLabel>
        <Text style={{ color: palette.muted, fontSize: 11 }}>
          {count ? `${count} ${count === 1 ? 'opción' : 'opciones'}` : ''}
        </Text>
      </View>
      {count ? <Recommendations {...props} /> : <NoOutfits {...props} />}
    </>
  );
}

function Recommendations({
  data,
  update,
  recs,
  actions,
  onSwap,
  onDetails,
}: TodayScreenProps) {
  const { palette } = useUI();
  const [first, ...others] = recs.recommendations;
  const cardProps = (outfit: Outfit) => ({
    compact: data.appearance.outfitLayout === 'compact',
    showReasons: data.appearance.showReasons,
    outfit,
    saved: actions.isSaved(outfit),
    onFavorite: () => actions.favorite(outfit),
    onWorn: () => actions.worn(outfit),
  });
  return (
    <>
      <OutfitCard
        {...cardProps(first)}
        primary
        onItem={(item) => onSwap({ outfit: first, category: item.category })}
        onDetails={() => onDetails(first)}
      />
      {others.length ? (
        <Text style={{ fontSize: 18, color: palette.ink, marginTop: 24 }}>
          Otras opciones
        </Text>
      ) : null}
      <View style={styles.alternatives}>
        {others.map((outfit) => (
          <View key={outfit.id} style={styles.alternative}>
            <OutfitCard
              {...cardProps(outfit)}
              onDetails={() => onDetails(outfit)}
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
              ...new Set([...current.dislikedOutfitIds, first.id]),
            ],
          }));
          recs.regenerate();
        }}
      />
    </>
  );
}

function NoOutfits({ data, update, recs, onTab }: TodayScreenProps) {
  const { palette, s } = useUI();
  return (
    <View style={[s.panel, { paddingVertical: 35 }]}>
      <Text style={{ fontSize: 28, marginBottom: 14, color: palette.ink }}>
        Sin conjuntos
      </Text>
      <Text style={s.subtitle}>
        {recs.result.outfits.length
          ? 'No quedan opciones en esta selección.'
          : recs.result.message}
      </Text>
      <Text style={[s.subtitle, { marginTop: 12 }]}>
        Revisa tus preferencias o agrega prendas.
      </Text>
      <View style={[s.row, { marginTop: 22, flexWrap: 'wrap' }]}>
        <Button label="Ir a mi clóset" onPress={() => onTab('closet')} />
        {data.dislikedOutfitIds.length ? (
          <Button
            secondary
            label="Recuperar opciones"
            onPress={() =>
              update((current) => ({ ...current, dislikedOutfitIds: [] }))
            }
          />
        ) : (
          <Button
            secondary
            label="Revisar mi estilo"
            onPress={() => onTab('style')}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alternatives: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 16,
  },
  alternative: { flexGrow: 1, flexBasis: 280, minWidth: 0 },
});
