import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import type { Category, WardrobeItem } from '../domain';
import { Garment } from './Garment';
import { demoPhotoFor, photoAspect } from './demoPhotos';
import { useUI } from './ui';

export const HANGING: ReadonlySet<Category> = new Set<Category>(['top', 'layer', 'one-piece', 'bottom']);
// Approximate hanging length so a dress reads longer than a tee on the same rod.
export const LENGTH: Record<Category, number> = { top: 170, layer: 190, bottom: 230, 'one-piece': 250, shoes: 70, accessory: 70 };
export const ROD_TOP = 16;
const MAX_WIDTH = 210;

export function sourceFor(item: WardrobeItem): ImageSourcePropType | undefined {
  return item.cutoutUri ? { uri: item.cutoutUri } : item.photoUri ? { uri: item.photoUri } : demoPhotoFor(item);
}

/** Width for a garment drawn at `height`; user photos load asynchronously, so they assume a portrait ratio. */
export function garmentWidth(item: WardrobeItem, height: number): number {
  const source = sourceFor(item);
  const fallback = !HANGING.has(item.category) ? 1.3 : source ? .8 : .75;
  return Math.min(MAX_WIDTH, Math.round(height * (photoAspect(item.photoUri ? undefined : source) ?? fallback)));
}

/** Cut-out photo, or the generic drawing under a drawn hanger when the garment has no photo. */
export function GarmentImage({ item, width, height }: { item: WardrobeItem; width: number; height: number }) {
  const { palette } = useUI();
  const source = sourceFor(item);
  if (source) return <Image accessible={false} source={source} style={{ width, height }} resizeMode="contain"/>;
  if (!HANGING.has(item.category)) return <Garment item={item} size={height}/>;
  return <View style={{ alignItems: 'center' }}>
    <Svg width={44} height={30} viewBox="0 0 44 30" aria-hidden><Path d="M22 3 q5 0 5 4.5 q0 3 -5 5.5 L3 26 h38 L22 13" fill="none" stroke={palette.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>
    <View style={{ marginTop: -4 }}><Garment item={item} size={Math.min(width, height - 40)}/></View>
  </View>;
}

/** Dotted wall with a chrome rod across the top; children are positioned by the caller. */
export function RailWall({ height, children, style }: { height: number; children: React.ReactNode; style?: ViewStyle }) {
  const { palette } = useUI();
  return <View style={[styles.wall, { backgroundColor: palette.art, height }, style]}>
    <Svg style={StyleSheet.absoluteFill} aria-hidden>
      <Defs><Pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><Circle cx="2" cy="2" r="1" fill={palette.line}/></Pattern></Defs>
      <Rect width="100%" height="100%" fill="url(#dots)"/>
    </Svg>
    {children}
  </View>;
}

export function Rod({ style }: { style?: ViewStyle }) {
  return <View style={[styles.rod, style]}><View style={styles.rodHighlight}/></View>;
}

export const railStyles = StyleSheet.create({
  cap: { position: 'absolute', top: ROD_TOP - 5, width: 12, height: 13, borderRadius: 4, backgroundColor: '#A3A8AD' },
});

const styles = StyleSheet.create({
  wall: { borderRadius: 22, overflow: 'hidden', marginHorizontal: -4 },
  rod: { position: 'absolute', left: 0, right: 0, top: ROD_TOP - 2, height: 7, borderRadius: 4, backgroundColor: '#B9BDC1', borderBottomWidth: 1, borderBottomColor: '#8D9297', overflow: 'hidden' },
  rodHighlight: { height: 2, backgroundColor: '#F1F3F4', marginTop: 1, marginHorizontal: 4, borderRadius: 1 },
});
