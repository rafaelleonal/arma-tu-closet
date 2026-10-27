import React, { useState } from 'react';
import { Linking, Switch, Text, TextInput, View } from 'react-native';
import { OCCASIONS, occasionLabels } from '../domain';
import type { LocalData } from '../storage/schema';
import type { WeatherSettings } from '../weather/types';
import { CityPicker } from './CityPicker';
import { Sheet } from './Sheet';
import { Button, Chip, FieldLabel, useUI } from './ui';

interface Props {
  value: LocalData['context'];
  weather: WeatherSettings;
  onSave: (context: LocalData['context'], weather: WeatherSettings) => void;
  onClose: () => void;
}

export function ContextEditor({ value, weather, onSave, onClose }: Props) {
  const { palette, s } = useUI();
  const [draft, setDraft] = useState(value);
  const [settings, setSettings] = useState(weather);
  const [temperature, setTemperature] = useState(String(value.temperatureC));
  const [error, setError] = useState('');
  const automatic = settings.mode === 'automatic';
  return <Sheet title="Clima y ocasión" onClose={onClose}>
    <View style={s.wrap}>
      <Chip label="Automático" selected={automatic} onPress={() => { setSettings(current => ({ ...current, mode: 'automatic' })); setError(''); }}/>
      <Chip label="Manual" selected={!automatic} onPress={() => { setSettings(current => ({ ...current, mode: 'manual' })); setError(''); }}/>
    </View>
    {automatic ? <>
      <FieldLabel>Ciudad</FieldLabel>
      <CityPicker value={settings.location} onSelect={place => { setSettings(current => ({ ...current, location: place, snapshot: current.location?.id === place.id ? current.snapshot : undefined })); setError(''); }}/>
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 12 }]}>Se consulta el clima actual de esa ciudad. Si el dato caduca, se usa el clima manual.</Text>
      <Text accessibilityRole="link" onPress={() => void Linking.openURL('https://open-meteo.com/')} style={{ color: palette.green, textDecorationLine: 'underline', marginTop: 12 }}>Datos de Open-Meteo</Text>
    </> : <>
      <FieldLabel>Ciudad · opcional</FieldLabel>
      <TextInput accessibilityLabel="Ciudad" placeholder="Ciudad" placeholderTextColor={palette.muted} value={draft.city} onChangeText={city => setDraft(current => ({ ...current, city }))} maxLength={60} style={s.input}/>
    </>}
    <FieldLabel>{automatic ? 'Temperatura manual de respaldo · °C' : 'Temperatura en °C'}</FieldLabel>
    <TextInput accessibilityLabel="Temperatura en grados Celsius" keyboardType="numbers-and-punctuation" value={temperature} onChangeText={setTemperature} style={s.input}/>
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 22 }]}><Text style={{ color: palette.ink }}>{automatic ? 'Lluvia manual de respaldo' : '¿Hay lluvia?'}</Text><Switch accessibilityLabel="Hay lluvia" value={draft.raining} onValueChange={raining => setDraft(current => ({ ...current, raining }))} trackColor={{ true: palette.green }}/></View>
    {!automatic ? <><FieldLabel>Estación</FieldLabel><View style={s.wrap}>{['Primavera', 'Verano', 'Otoño', 'Invierno'].map(season => <Chip key={season} label={season} selected={draft.season === season} onPress={() => setDraft(current => ({ ...current, season }))}/>)}</View></> : null}
    <FieldLabel>Ocasión</FieldLabel><View style={s.wrap}>{OCCASIONS.map(occasion => <Chip key={occasion} label={occasionLabels[occasion]} selected={draft.occasion === occasion} onPress={() => setDraft(current => ({ ...current, occasion }))}/>)}</View>
    {error ? <Text accessibilityRole="alert" style={{ color: palette.rust, marginTop: 20 }}>{error}</Text> : null}
    <Button label="Aplicar" style={{ marginTop: 28 }} onPress={() => {
      const temp = Number(temperature.replace(',', '.'));
      if (!temperature.trim() || !Number.isFinite(temp) || temp < -30 || temp > 55) { setError('Escribe una temperatura válida entre −30 y 55 °C.'); return; }
      if (automatic && !settings.location) { setError('Elige una ciudad para el clima automático.'); return; }
      onSave({ ...draft, temperatureC: temp }, settings);
    }}/>
  </Sheet>;
}
