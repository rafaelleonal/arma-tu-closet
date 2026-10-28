import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import type { WeatherLocation } from '../weather/types';
import { searchLocations } from '../weather/openMeteo';
import { deviceLocationSupported, findDeviceCity } from '../weather/deviceLocation';
import { Button, useUI } from './ui';

/** Location first on iOS/Android; the search by name stays available and opens after a denial or failure. */
export function CityPicker({
  value,
  onSelect,
}: {
  value?: WeatherLocation;
  onSelect: (place: WeatherLocation) => void;
}) {
  const { palette, s } = useUI();
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
      const result = await findDeviceCity(active.signal);
      if (active.signal.aborted) return;
      if (result.status === 'found') {
        choose(result.location);
        return;
      }
      setSearchOpen(true);
      if (result.status === 'denied') {
        setSettingsBlocked(!result.canAskAgain);
        setError(
          result.canAskAgain
            ? 'Sin permiso de ubicación. Busca tu ciudad por nombre.'
            : 'La ubicación está bloqueada para esta app. Actívala en Ajustes o busca tu ciudad.',
        );
      } else setError(result.message);
    } catch {
      if (!active.signal.aborted) {
        setSearchOpen(true);
        setError('No pudimos obtener tu ubicación. Busca tu ciudad por nombre.');
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
      const places = await searchLocations(query.trim(), active.signal);
      if (!active.signal.aborted) {
        setResults(places);
        setSearched(true);
      }
    } catch (cause) {
      if (!active.signal.aborted)
        setError(cause instanceof Error ? cause.message : 'No pudimos buscar la ciudad.');
    } finally {
      if (controller.current === active) setSearching(false);
    }
  }

  return (
    <View>
      {value ? (
        <Text style={[s.subtitle, { marginBottom: 12 }]}>
          Seleccionada: <Text style={{ color: palette.ink }}>{placeLabel(value)}</Text>
        </Text>
      ) : null}
      {deviceLocationSupported ? (
        <>
          <Button
            secondary={!!value}
            label={
              locating
                ? 'Buscando tu ciudad…'
                : value
                  ? 'Actualizar con mi ubicación'
                  : 'Usar mi ubicación'
            }
            disabled={locating}
            onPress={() => void locate()}
          />
          <Text style={[s.subtitle, { fontSize: 11, lineHeight: 17, marginTop: 8 }]}>
            Solo para encontrar tu ciudad. No guardamos tu ubicación exacta.
          </Text>
        </>
      ) : null}
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, fontSize: 12, lineHeight: 19, marginTop: 12 }}
        >
          {error}
        </Text>
      ) : null}
      {settingsBlocked ? (
        <Button
          secondary
          small
          label="Abrir Ajustes"
          style={{ marginTop: 8 }}
          onPress={() =>
            void Linking.openSettings().catch(() =>
              setError('Abre Ajustes y activa Ubicación para esta app.'),
            )
          }
        />
      ) : null}
      {searchOpen ? (
        <View style={{ marginTop: deviceLocationSupported ? 16 : 0 }}>
          <TextInput
            accessibilityLabel="Buscar ciudad"
            placeholder="Nombre de la ciudad"
            placeholderTextColor={palette.muted}
            value={query}
            onChangeText={resetSearch}
            maxLength={100}
            returnKeyType="search"
            style={s.input}
            onSubmitEditing={() => {
              if (query.trim().length >= 2) void search();
            }}
          />
          <Button
            secondary
            label={searching ? 'Buscando…' : 'Buscar ciudad'}
            disabled={searching || query.trim().length < 2}
            onPress={() => void search()}
            style={{ marginTop: 12 }}
          />
          <View style={{ gap: 8, marginTop: results.length ? 12 : 0 }}>
            {results.map((place) => (
              <Button
                key={place.id}
                secondary
                label={placeLabel(place)}
                onPress={() => choose(place)}
              />
            ))}
          </View>
          {searched && !results.length ? (
            <Text style={[s.subtitle, { marginTop: 12 }]}>
              No encontramos esa ciudad. Prueba otro nombre.
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setSearchOpen(true)}
          style={{ minHeight: 44, justifyContent: 'center', marginTop: 4 }}
        >
          <Text style={{ color: palette.green, fontSize: 13, textDecorationLine: 'underline' }}>
            Buscar por nombre
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function placeLabel(place: WeatherLocation) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(', ');
}
