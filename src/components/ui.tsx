import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { MotionPressable } from './Feedback';
import { useTheme, type Palette } from '../theme/ThemeProvider';

export function useUI() {
  const { palette } = useTheme();
  const s = useMemo(() => createStyles(palette), [palette]);
  return { palette, s };
}

export function Button({ label, onPress, secondary, disabled, small, style }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; small?: boolean; style?: ViewStyle }) {
  const { palette, s } = useUI();
  return <MotionPressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, small && s.small, disabled && { opacity: .4 }, pressed && { opacity: .72 }, style]}><Text style={[s.buttonText, secondary && { color: palette.ink }]}>{label}</Text></MotionPressable>;
}
export function Chip({ label, selected, onPress, swatch }: { label: string; selected?: boolean; onPress: () => void; swatch?: string }) {
  const { palette, s } = useUI();
  return <MotionPressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} aria-pressed={!!selected} onPress={onPress} style={[s.chip, selected && s.chipSelected]}>{swatch ? <View style={[s.swatch, { backgroundColor: swatch }]} /> : null}<Text style={[s.chipText, selected && { color: palette.onInk }]}>{label}</Text></MotionPressable>;
}
export function SectionLabel({ children }: { children: React.ReactNode }) { const { s } = useUI(); return <Text style={s.label}>{children}</Text>; }
export function FieldLabel({ children }: { children: React.ReactNode }) { const { s } = useUI(); return <Text style={s.fieldLabel}>{children}</Text>; }
export const colorHex: Record<string, string> = { negro: '#303431', blanco: '#FBFAF5', beige: '#D6C7A6', azul: '#516980', verde: '#7A8462', rosa: '#D4A5AA', café: '#815E47', cafe: '#815E47', rojo: '#B86250', gris: '#A0A19B', amarillo: '#D5B966', naranja: '#C78055', morado: '#9986AA' };
const createStyles = (palette: Palette) => StyleSheet.create({
  button: { backgroundColor: palette.ink, paddingHorizontal: 20, paddingVertical: 15, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.line }, small: { paddingHorizontal: 13, paddingVertical: 11, minHeight: 44 },
  buttonText: { fontSize: 14, color: palette.onInk, fontWeight: '600' },
  chip: { flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 44, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 13, borderRadius: 24, backgroundColor: palette.white },
  chipSelected: { backgroundColor: palette.ink, borderColor: palette.ink }, chipText: { color: palette.ink, fontSize: 13 }, swatch: { width: 17, height: 17, borderRadius: 9, borderWidth: 1, borderColor: palette.swatchBorder },
  label: { fontSize: 10, letterSpacing: 2, fontWeight: '700', color: palette.green, textTransform: 'uppercase', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: palette.ink, marginBottom: 10, marginTop: 22 },
  title: { fontSize: 38, fontWeight: '400', letterSpacing: -1.8, color: palette.ink, lineHeight: 44 },
  subtitle: { fontSize: 14, lineHeight: 22, color: palette.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, wrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  input: { borderWidth: 1, borderColor: palette.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: palette.white, fontSize: 15, color: palette.ink, minHeight: 48 },
  panel: { padding: 20, borderRadius: 20, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  divider: { height: 1, backgroundColor: palette.line, marginVertical: 22 },
});
