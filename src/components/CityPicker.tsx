import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import type { WeatherLocation } from '../weather/types';
import { searchLocations, WeatherRequestError } from '../weather/openMeteo';
import {
  deviceLocationSupported,
  findDeviceCity,
} from '../weather/deviceLocation';
import { Button, useUI } from './ui';
import { useI18n } from '../i18n';

/** Location first on iOS/Android; the search by name stays available and opens after a denial or failure. */
export function CityPicker({
  value,
  onSelect,
  hideSelected,
}: {
  value?: WeatherLocation;
  onSelect: (place: WeatherLocation) => void;
  /** For a caller that already shows the chosen city itself. */
  hideSelected?: boolean;
}) {
  const { palette, s } = useUI();
  const { t, language } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(!deviceLocationSupported);
  const [settingsBlocked, setSettingsBlocked] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  function begin() {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setError('');
    setSettingsBlocked(false);
    setLocating(false);
    setSearching(false);
    return active;
  }
  function resetSearch(text: string) {
    controller.current?.abort();
    controller.current = null;
    setQuery(text);
    setResults([]);
    setSearched(false);
    setSearching(false);
    setLocating(false);
    setError('');
  }
  function choose(place: WeatherLocation) {
    resetSearch('');
    setSearchOpen(!deviceLocationSupported);
    onSelect(place);
  }
  async function locate() {
    const active = begin();
    setLocating(true);
    setResults([]);
    setSearched(false);
    try {
      const result = await findDeviceCity(active.signal, language);
      if (active.signal.aborted) return;
      if (result.status === 'found') {
        choose(result.location);
        return;
      }
      setSearchOpen(true);
      if (result.status === 'denied') {
        setSettingsBlocked(!result.canAskAgain);
        setError(result.canAskAgain ? t.city.denied : t.city.blocked);
      } else setError(t.city.failures[result.reason]);
    } catch {
      if (!active.signal.aborted) {
        setSearchOpen(true);
        setError(t.city.failures.position);
      }
    } finally {
      if (controller.current === active) setLocating(false);
    }
  }
  async function search() {
    const active = begin();
    setSearching(true);
    setSearched(false);
    try {
      const places = await searchLocations(
        query.trim(),
        active.signal,
        language,
      );
      if (!active.signal.aborted) {
        setResults(places);
        setSearched(true);
      }
    } catch (cause) {
      if (!active.signal.aborted)
        setError(
          cause instanceof WeatherRequestError
            ? t.city.failures[cause.code]
            : t.city.searchFailed,
        );
    } finally {
      if (controller.current === active) setSearching(false);
    }
  }

  return (
    <View>
      {value && !hideSelected ? (
        <Text style={[s.subtitle, { marginBottom: 12 }]}>
          {t.city.selected}{' '}
          <Text style={{ color: palette.ink }}>{placeLabel(value)}</Text>
        </Text>
      ) : null}
      {deviceLocationSupported ? (
        <>
          <Button
            secondary={!!value}
            label={
              locating
                ? t.city.locating
                : value
                  ? t.city.updateWithLocation
                  : t.city.useLocation
            }
            disabled={locating}
            onPress={() => void locate()}
          />
          <Text
            style={[s.subtitle, { fontSize: 11, lineHeight: 17, marginTop: 8 }]}
          >
            {t.city.locationPrivacy}
          </Text>
        </>
      ) : null}
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{
            color: palette.rust,
            fontSize: 12,
            lineHeight: 19,
            marginTop: 12,
          }}
        >
          {error}
        </Text>
      ) : null}
      {settingsBlocked ? (
        <Button
          secondary
          small
          label={t.city.openSettings}
          style={{ marginTop: 8 }}
          onPress={() =>
            void Linking.openSettings().catch(() =>
              setError(t.city.openSettingsFailed),
            )
          }
        />
      ) : null}
      {searchOpen ? (
        <View style={{ marginTop: deviceLocationSupported ? 16 : 0 }}>
          <CitySearch
            query={query}
            onQuery={resetSearch}
            searching={searching}
            searched={searched}
            results={results}
            onSearch={() => void search()}
            onChoose={choose}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setSearchOpen(true)}
          style={{ minHeight: 44, justifyContent: 'center', marginTop: 4 }}
        >
          <Text
            style={{
              color: palette.green,
              fontSize: 13,
              textDecorationLine: 'underline',
            }}
          >
            {t.city.searchByName}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function CitySearch({
  query,
  onQuery,
  searching,
  searched,
  results,
  onSearch,
  onChoose,
}: {
  query: string;
  onQuery: (text: string) => void;
  searching: boolean;
  searched: boolean;
  results: WeatherLocation[];
  onSearch: () => void;
  onChoose: (place: WeatherLocation) => void;
}) {
  const { palette, s } = useUI();
  const { t } = useI18n();
  return (
    <>
      <TextInput
        accessibilityLabel={t.city.search}
        placeholder={t.city.placeholder}
        placeholderTextColor={palette.muted}
        value={query}
        onChangeText={onQuery}
        maxLength={100}
        returnKeyType="search"
        style={s.input}
        onSubmitEditing={() => {
          if (query.trim().length >= 2) onSearch();
        }}
      />
      <Button
        secondary
        label={searching ? t.city.searching : t.city.search}
        disabled={searching || query.trim().length < 2}
        onPress={onSearch}
        style={{ marginTop: 12 }}
      />
      <View style={{ gap: 8, marginTop: results.length ? 12 : 0 }}>
        {results.map((place) => (
          <Button
            key={place.id}
            secondary
            label={placeLabel(place)}
            onPress={() => onChoose(place)}
          />
        ))}
      </View>
      {searched && !results.length ? (
        <Text style={[s.subtitle, { marginTop: 12 }]}>{t.city.notFound}</Text>
      ) : null}
    </>
  );
}

export function placeLabel(place: WeatherLocation) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(', ');
}
