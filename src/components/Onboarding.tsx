import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOR_OPTIONS, colorLabels, OCCASIONS, occasionLabels, seedWardrobe, STYLE_OPTIONS, type StyleId } from '../domain';
import type { LocalData } from '../storage/schema';
import { MotionIn, useFeedback } from './Feedback';
import { AppearanceSettings } from './AppearanceSettings';
import { CityPicker } from './CityPicker';
import { WelcomeRail } from './ClosetRail';
import { Button, Chip, colorHex, FieldLabel, useUI } from './ui';

export type PersonalizationPatch = Partial<Pick<LocalData, 'profile' | 'preferences' | 'appearance' | 'context' | 'onboarding' | 'weather'>>;
export interface OnboardingProps {
  data: LocalData;
  mode: 'initial' | 'edit';
  onChange: (patch: PersonalizationPatch) => void;
  onFinish: (entry: 'own' | 'demo' | 'keep') => void;
  onClose?: () => void;
}
const stepNames = ['Tu estilo', 'Colores', 'Tu rutina', 'Apariencia'];
const styleMarks: Record<StyleId, string> = { minimal: '—', classic: '◇', street: '↗', relaxed: '≈', creative: '✱', sport: '⌁', girly: '♡', feminine: '❀' };

export function Onboarding({ data, mode, onChange, onFinish, onClose }: OnboardingProps) {
  const { s, palette } = useUI();
  const feedback = useFeedback();
  const [step, setStep] = useState(mode === 'edit' ? 0 : data.onboarding?.step ?? 0);
  const [colorMode, setColorMode] = useState<'favorite' | 'avoid'>('favorite');
  const [styleNotice, setStyleNotice] = useState('');
  // Shown once per launch before the first step; not persisted, so it needs no schema change.
  const [welcome, setWelcome] = useState(mode === 'initial' && (data.onboarding?.step ?? 0) === 0);
  const scroll = useRef<ScrollViewInstance>(null);
  const edit = mode === 'edit';
  function go(next: number) {
    const safe = Math.max(0, Math.min(3, next)) as 0 | 1 | 2 | 3;
    if (safe !== step) feedback.selection();
    setStep(safe); onChange({ onboarding: { step: safe } });
    setStyleNotice(''); scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function selectStyle(id: StyleId) {
    const existing = data.profile.styleIds;
    if (!existing.includes(id) && existing.length >= 3) { setStyleNotice('Máximo 3. Quita uno para elegir otro.'); return; }
    feedback.selection(); setStyleNotice(''); onChange({ profile: { ...data.profile, styleIds: existing.includes(id) ? existing.filter(value => value !== id) : [...existing, id] } });
  }
  function selectColor(color: string) {
    feedback.selection();
    const { preferredColors, excludedColors } = data.preferences;
    const selected = colorMode === 'favorite' ? preferredColors : excludedColors;
    const next = selected.includes(color) ? selected.filter(value => value !== color) : [...selected, color];
    onChange({ preferences: { ...data.preferences, preferredColors: colorMode === 'favorite' ? next : preferredColors.filter(value => value !== color), excludedColors: colorMode === 'avoid' ? next : excludedColors.filter(value => value !== color) } });
  }
  if (welcome) return <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: palette.paper }}>
    <View style={{ flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 }}>
      <Text style={{ fontSize: 37, lineHeight: 44, fontWeight: '700', letterSpacing: -4, color: palette.ink, paddingRight: 6, alignSelf: 'flex-start' }}>a.</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}><MotionIn trigger="welcome">
        <WelcomeRail items={seedWardrobe.filter(item => ['demo2-tee-gray', 'demo2-shirt-denim', 'demo2-tee-white', 'demo2-jacket-denim', 'demo2-sweater-navy'].includes(item.id))}/>
        <Text accessibilityRole="header" style={{ fontSize: 44, lineHeight: 48, fontWeight: '600', letterSpacing: -2, color: palette.ink, marginTop: 40 }}>Arma tu outfit</Text>
        <Text style={[s.subtitle, { fontSize: 16, lineHeight: 24, marginTop: 14 }]}>Conjuntos con la ropa de tu clóset, según el clima y la ocasión del día.</Text>
      </MotionIn></View>
      <Button label="Empezar" onPress={() => { feedback.selection(); setWelcome(false); }}/>
      <Text style={[s.subtitle, { fontSize: 11, textAlign: 'center', marginTop: 14 }]}>Sin cuenta. Tus datos se quedan en este dispositivo.</Text>
    </View>
  </SafeAreaView>;
  return <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: palette.paper }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <View style={{ width: '100%', maxWidth: 660, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 37, lineHeight: 44, fontWeight: '700', letterSpacing: -4, color: palette.ink, paddingRight: 6 }}>a.</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}><Text style={{ color: palette.muted, fontSize: 11 }}>{step + 1} de 4</Text>{onClose ? <Pressable accessibilityRole="button" accessibilityLabel="Cerrar personalización" onPress={onClose} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}><Text style={{ color: palette.ink, fontSize: 12 }}>Cerrar</Text></Pressable> : null}</View></View>
      <View accessibilityLabel={`Paso ${step + 1} de 4`} style={{ flexDirection: 'row', gap: 6, marginTop: 17 }}>{stepNames.map((label, index) => <View key={label} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: index <= step ? palette.ink : palette.line }}/>)}</View>
    </View>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ width: '100%', maxWidth: 660, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 32 }}>
      <MotionIn trigger={step}>{step === 0 ? <>
        <Text accessibilityRole="header" style={s.title}>Tu estilo</Text><Text style={[s.subtitle, { marginTop: 12, marginBottom: 20 }]}>Elige hasta 3.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{STYLE_OPTIONS.map(option => { const selected = data.profile.styleIds.includes(option.id); return <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={`Estilo ${option.label}`} accessibilityState={{ selected }} aria-pressed={selected} onPress={() => selectStyle(option.id)} style={{ flexBasis: '30%', minWidth: 120, flexGrow: 1, minHeight: 112, padding: 18, borderRadius: 16, backgroundColor: selected ? palette.ink : palette.white, borderWidth: 1, borderColor: selected ? palette.ink : palette.line }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}><Text style={{ color: selected ? palette.onInk : palette.green, fontSize: 26, lineHeight: 28 }}>{styleMarks[option.id]}</Text><Text style={{ color: selected ? palette.onInk : palette.muted, fontSize: 15 }}>{selected ? '✓' : '+'}</Text></View><Text style={{ color: selected ? palette.onInk : palette.ink, fontSize: 15, fontWeight: '600' }}>{option.label}</Text></Pressable>; })}</View>
        <Text accessibilityLiveRegion="polite" style={{ color: styleNotice ? palette.rust : palette.muted, marginTop: 14, fontSize: 11 }}>{styleNotice || `${data.profile.styleIds.length} de 3 · Opcional`}</Text>
        <FieldLabel>Nombre · opcional</FieldLabel><TextInput accessibilityLabel="Tu nombre, opcional" placeholder="Tu nombre" placeholderTextColor={palette.muted} value={data.profile.name} onChangeText={name => onChange({ profile: { ...data.profile, name } })} maxLength={40} autoComplete="given-name" style={s.input}/>
      </> : null}
      {step === 1 ? <>
        <Text accessibilityRole="header" style={[s.title, { marginBottom: 22 }]}>Colores</Text>
        <View style={{ backgroundColor: palette.wash, borderRadius: 14, padding: 5, flexDirection: 'row', marginBottom: 22 }}>{([{ id: 'favorite', label: 'Me gustan', count: data.preferences.preferredColors.length }, { id: 'avoid', label: 'Evitar', count: data.preferences.excludedColors.length }] as const).map(modeOption => <Pressable key={modeOption.id} accessibilityRole="tab" accessibilityState={{ selected: colorMode === modeOption.id }} aria-selected={colorMode === modeOption.id} onPress={() => setColorMode(modeOption.id)} style={{ flex: 1, minHeight: 47, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: colorMode === modeOption.id ? palette.white : 'transparent' }}><Text style={{ fontSize: 12, color: palette.ink, fontWeight: colorMode === modeOption.id ? '600' : '400' }}>{modeOption.label} · {modeOption.count}</Text></Pressable>)}</View>
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 20 }]}>{colorMode === 'favorite' ? 'Se priorizan en tus sugerencias.' : 'Excluye prendas con estos colores registrados.'}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{COLOR_OPTIONS.map(color => { const selected = (colorMode === 'favorite' ? data.preferences.preferredColors : data.preferences.excludedColors).includes(color); const otherMode = (colorMode === 'favorite' ? data.preferences.excludedColors : data.preferences.preferredColors).includes(color); return <Pressable accessibilityRole="button" accessibilityLabel={`${colorLabels[color]}${selected ? ', seleccionado' : ''}${otherMode ? colorMode === 'favorite' ? ', actualmente evitado' : ', actualmente favorito' : ''}`} accessibilityState={{ selected }} aria-pressed={selected} key={color} onPress={() => selectColor(color)} style={{ flexBasis: 83, flexGrow: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 15, backgroundColor: selected ? palette.sand : palette.white, borderWidth: 1, borderColor: selected ? palette.ink : palette.line }}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colorHex[color], borderWidth: 1, borderColor: palette.swatchBorder, alignItems: 'center', justifyContent: 'center' }}>{selected ? <Text style={{ color: ['negro', 'azul', 'cafe', 'rojo', 'morado'].includes(color) ? '#FFFFFF' : '#242923', fontSize: 17 }}>{colorMode === 'favorite' ? '✓' : '−'}</Text> : null}</View><Text style={{ color: palette.ink, fontSize: 11, marginTop: 9 }}>{colorLabels[color]}</Text>{otherMode ? <Text style={{ fontSize: 8, marginTop: 3, color: palette.muted }}>{colorMode === 'favorite' ? 'En evitar' : 'En favoritos'}</Text> : null}</Pressable>; })}</View>
        <Text style={[s.subtitle, { marginTop: 19, fontSize: 11 }]}>Elegir un color lo quita del otro grupo.</Text>
      </> : null}
      {step === 2 ? <>
        <Text accessibilityRole="header" style={s.title}>Tu rutina</Text><FieldLabel>Ocasión habitual</FieldLabel><View style={s.wrap}>{OCCASIONS.map(occasion => <Chip key={occasion} label={occasionLabels[occasion]} selected={data.context.occasion === occasion} onPress={() => onChange({ context: { ...data.context, occasion } })}/>)}</View>
        <View style={[s.panel, { marginTop: 30 }]}><Text style={{ color: palette.ink, fontSize: 19, letterSpacing: -.4, marginBottom: 10 }}>Rotación</Text><Text style={[s.subtitle, { fontSize: 12, marginBottom: 20 }]}>Preferimos no repetir durante este periodo. Puede repetirse si faltan alternativas.</Text><View style={s.wrap}>{[0, 3, 7, 14].map(days => <Chip key={days} label={days ? `${days} días` : 'Sin rotación'} selected={data.preferences.rotationDays === days} onPress={() => onChange({ preferences: { ...data.preferences, rotationDays: days } })}/>)}</View></View>
        <View style={[s.panel, { marginTop: 22 }]}><Text style={{ color: palette.ink, fontSize: 19, letterSpacing: -.4, marginBottom: 10 }}>Clima · opcional</Text><Text style={[s.subtitle, { fontSize: 12, marginBottom: 18 }]}>Con tu ciudad ajustamos el abrigo al clima actual. Puedes cambiarlo en Hoy.</Text>
          <CityPicker value={data.weather.mode === 'automatic' ? data.weather.location : undefined} onSelect={place => onChange({ weather: { mode: 'automatic', location: place, snapshot: data.weather.location?.id === place.id ? data.weather.snapshot : undefined } })}/></View>
      </> : null}
      {step === 3 ? <>
        <Text accessibilityRole="header" style={[s.title, { marginBottom: 24 }]}>Apariencia</Text><AppearanceSettings compact value={data.appearance} onChange={appearance => onChange({ appearance })}/>
        {!edit ? <View style={{ marginTop: 32 }}><Text style={{ color: palette.ink, fontSize: 20, letterSpacing: -.5, marginBottom: 10 }}>Clóset</Text><Text style={[s.subtitle, { fontSize: 12, marginBottom: 17 }]}>El ejemplo contiene prendas ficticias.</Text><Button label="Empezar con mi ropa" onPress={() => onFinish('own')}/><Button secondary label="Usar clóset de ejemplo" onPress={() => onFinish('demo')} style={{ marginTop: 10 }}/></View> : <View style={{ marginTop: 28 }}><Button label="Listo" onPress={() => onFinish('keep')}/></View>}
        <Text style={[s.subtitle, { fontSize: 10, textAlign: 'center', marginTop: 21 }]}>Datos solo en este dispositivo.</Text>
      </> : null}
      </MotionIn>
    </ScrollView>
    <View style={{ borderTopWidth: 1, borderColor: palette.line, backgroundColor: palette.paper, paddingHorizontal: 24, paddingVertical: 15 }}><View style={{ width: '100%', maxWidth: 612, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10 }}>{step > 0 ? <Button secondary label="Atrás" onPress={() => go(step - 1)}/> : null}{step < 3 ? <><Pressable accessibilityRole="button" onPress={() => go(step + 1)} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 12, color: palette.muted }}>Ahora no</Text></Pressable><Button label="Continuar" onPress={() => go(step + 1)} style={{ flex: 1 }}/></> : null}</View></View>
  </KeyboardAvoidingView></SafeAreaView>;
}
