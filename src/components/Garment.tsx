import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colorLabels, type WardrobeItem } from '../domain';
import { useTheme } from '../theme/ThemeProvider';
import { colorHex } from './ui';
import { demoPhotoFor } from './demoPhotos';

const illustrations = {
  tee: require('../../assets/garments/tee.png'),
  shirt: require('../../assets/garments/shirt.png'),
  sweater: require('../../assets/garments/sweater.png'),
  trousers: require('../../assets/garments/trousers.png'),
  dress: require('../../assets/garments/dress.png'),
  sneakers: require('../../assets/garments/sneakers.png'),
  boots: require('../../assets/garments/boots.png'),
  jacket: require('../../assets/garments/jacket.png'),
  scarf: require('../../assets/garments/scarf.png'),
};
type IllustrationKind = keyof typeof illustrations;

/** Decorative, tintable ink drawing. User photos never pass through this component. */
export function GarmentIllustration({
  kind,
  size = 100,
  ink,
}: {
  kind: IllustrationKind;
  size?: number;
  ink: string;
}) {
  return (
    <Image
      accessible={false}
      source={illustrations[kind]}
      resizeMode="contain"
      style={{ width: size, height: size, tintColor: ink }}
    />
  );
}

function illustrationFor(item: WardrobeItem): IllustrationKind {
  const name = item.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  switch (item.category) {
    case 'top':
      if (/sueter|sweater|sudadera|jersey/.test(name)) return 'sweater';
      if (/camisa|blusa|shirt/.test(name) && !/camiseta|t-shirt/.test(name))
        return 'shirt';
      return 'tee';
    case 'bottom':
      return 'trousers';
    case 'one-piece':
      return 'dress';
    case 'shoes':
      return /bota|botin|boot/.test(name) ? 'boots' : 'sneakers';
    case 'layer':
      return 'jacket';
    case 'accessory':
      return 'scarf';
  }
}

/**
 * The garment's own images that can still be shown. A file that fails to load (deleted, or saved
 * on another device) falls back to the next one: cut-out, then photo, then the drawing.
 */
export function useGarmentImages(item: WardrobeItem) {
  const [failed, setFailed] = useState<readonly string[]>([]);
  const usable = (uri?: string) =>
    uri && !failed.includes(uri) ? uri : undefined;
  return {
    cutoutUri: usable(item.cutoutUri),
    photoUri: usable(item.photoUri),
    fail: (uri: string) => () =>
      setFailed((current) =>
        current.includes(uri) ? current : [...current, uri],
      ),
  };
}

const SWATCH_SLOT = 13;
const MORE_WIDTH = 18;

export function Garment({
  item,
  size = 100,
}: {
  item: WardrobeItem;
  size?: number;
}) {
  const { palette } = useTheme();
  const { cutoutUri, photoUri, fail } = useGarmentImages(item);
  const colors = item.colors
    .map((color) => colorLabels[color] || color)
    .join(', ');
  const demoPhoto = item.photoUri ? undefined : demoPhotoFor(item);
  // One row of swatches; the rest are counted, and the label still names every color.
  const fits = Math.floor((size + 4) / SWATCH_SLOT);
  const shown =
    item.colors.length > fits
      ? Math.max(1, Math.floor((size + 4 - MORE_WIDTH) / SWATCH_SLOT))
      : item.colors.length;
  return (
    <View
      accessible
      accessibilityLabel={`${cutoutUri || photoUri ? 'Foto' : demoPhoto ? 'Foto de ejemplo' : 'Ilustración genérica'} de ${item.name}${colors ? `. Colores: ${colors}` : ''}`}
      style={styles.art}
    >
      {cutoutUri ? (
        <Image
          accessible={false}
          source={{ uri: cutoutUri }}
          onError={fail(cutoutUri)}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      ) : photoUri ? (
        <Image
          accessible={false}
          source={{ uri: photoUri }}
          onError={fail(photoUri)}
          style={{
            width: size,
            height: size,
            borderRadius: 10,
            backgroundColor: palette.art,
          }}
          resizeMode="contain"
        />
      ) : demoPhoto ? (
        <Image
          accessible={false}
          source={demoPhoto}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      ) : (
        <GarmentIllustration
          kind={illustrationFor(item)}
          size={size}
          ink={palette.green}
        />
      )}
      {item.colors.length ? (
        <View style={[styles.colors, { maxWidth: size }]}>
          {item.colors.slice(0, shown).map((color) => (
            <View
              key={color}
              style={[
                styles.swatch,
                {
                  backgroundColor: colorHex[color] || palette.muted,
                  borderColor: palette.swatchBorder,
                },
              ]}
            />
          ))}
          {shown < item.colors.length ? (
            <Text style={[styles.more, { color: palette.muted }]}>
              +{item.colors.length - shown}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', justifyContent: 'center' },
  colors: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 7,
  },
  swatch: { width: 9, height: 9, borderRadius: 5, borderWidth: 1 },
  more: { fontSize: 9, lineHeight: 10, fontWeight: '600' },
});
