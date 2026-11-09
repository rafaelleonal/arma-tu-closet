import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import type { WardrobeItem } from '../domain';
import { demoPhotoFor, photoAspect } from './demoPhotos';
import {
  illustrationFor,
  useGarmentImages,
  type IllustrationKind,
} from './Garment';

/** Face-free drawings on their own die-cut paper; made by scripts/garment-stickers.py. */
const drawings: Record<IllustrationKind, ImageSourcePropType> = {
  tee: require('../../assets/garments/stickers/tee.png'),
  shirt: require('../../assets/garments/stickers/shirt.png'),
  sweater: require('../../assets/garments/stickers/sweater.png'),
  trousers: require('../../assets/garments/stickers/trousers.png'),
  dress: require('../../assets/garments/stickers/dress.png'),
  sneakers: require('../../assets/garments/stickers/sneakers.png'),
  boots: require('../../assets/garments/stickers/boots.png'),
  jacket: require('../../assets/garments/stickers/jacket.png'),
  scarf: require('../../assets/garments/stickers/scarf.png'),
};

/** A sticker keeps its own light border on any theme, like a real one on any surface. */
const PAPER = '#FBFAF6';
/** Ink for words written on sticker paper; fixed because the paper is. */
export const STICKER_INK = '#242923';
export const STICKER_PAPER = PAPER;
/** Below this size the border would be thinner than a pixel, so the picture goes alone. */
const SMALL = 70;
/** Eight copies of the picture, pushed outwards, draw the border around any cut-out. */
const RING = [
  [1, 0],
  [0.71, 0.71],
  [0, 1],
  [-0.71, 0.71],
  [-1, 0],
  [-0.71, -0.71],
  [0, -1],
  [0.71, -0.71],
] as const;
const FALLBACK_ASPECT = 0.8;

// iOS has no drop-shadow filter; its view shadow follows the picture when there is no background.
export const lifted: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
      }
    : { filter: 'drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.18))' };

function useUriAspect(uri?: string) {
  const [aspects, setAspects] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!uri) return;
    let active = true;
    Image.getSize(
      uri,
      (width, height) => {
        if (active && width && height)
          setAspects((current) => ({ ...current, [uri]: width / height }));
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [uri]);
  return uri ? aspects[uri] : undefined;
}

function fit(aspect: number, maxWidth: number, maxHeight: number) {
  const width = Math.min(maxWidth, maxHeight * aspect);
  return { width, height: width / aspect };
}

function CutoutSticker({
  source,
  aspect,
  maxWidth,
  maxHeight,
  style,
  onError,
}: {
  source: ImageSourcePropType;
  aspect: number;
  maxWidth: number;
  maxHeight: number;
  style: ViewStyle;
  onError?: () => void;
}) {
  const box = fit(aspect, maxWidth, maxHeight);
  if (Math.min(maxWidth, maxHeight) < SMALL)
    return (
      <View style={[box, style]}>
        <Image
          accessible={false}
          source={source}
          onError={onError}
          resizeMode="contain"
          style={box}
        />
      </View>
    );
  const edge = Math.max(2, Math.round(Math.min(maxWidth, maxHeight) * 0.022));
  const picture = {
    width: box.width - edge * 2,
    height: box.height - edge * 2,
  };
  return (
    <View style={[lifted, box, style]}>
      {RING.map(([x, y]) => (
        <Image
          key={`${x},${y}`}
          accessible={false}
          source={source}
          resizeMode="contain"
          style={[
            styles.layer,
            picture,
            {
              left: edge + x * edge,
              top: edge + y * edge,
              tintColor: PAPER,
            },
          ]}
        />
      ))}
      <Image
        accessible={false}
        source={source}
        onError={onError}
        resizeMode="contain"
        style={[styles.layer, picture, { left: edge, top: edge }]}
      />
    </View>
  );
}

/**
 * A garment as a sticker: its cut-out with a border, its photo in a paper frame, or the generic
 * drawing when it has no photo. Decorative; the caller names the garment for assistive technology.
 */
export function Sticker({
  item,
  maxWidth,
  maxHeight,
  rotate = 0,
}: {
  item: WardrobeItem;
  maxWidth: number;
  maxHeight: number;
  rotate?: number;
}) {
  const { cutoutUri, photoUri, fail } = useGarmentImages(item);
  const cutoutAspect = useUriAspect(cutoutUri);
  const demoPhoto = item.photoUri ? undefined : demoPhotoFor(item);
  const turned: ViewStyle = { transform: [{ rotate: `${rotate}deg` }] };
  if (cutoutUri)
    return (
      <CutoutSticker
        source={{ uri: cutoutUri }}
        aspect={cutoutAspect ?? FALLBACK_ASPECT}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        style={turned}
        onError={fail(cutoutUri)}
      />
    );
  if (photoUri) {
    const side = Math.min(maxWidth, maxHeight);
    return (
      <View
        style={[lifted, styles.frame, turned, { width: side, height: side }]}
      >
        <Image
          accessible={false}
          source={{ uri: photoUri }}
          onError={fail(photoUri)}
          resizeMode="cover"
          style={styles.framed}
        />
      </View>
    );
  }
  if (demoPhoto)
    return (
      <CutoutSticker
        source={demoPhoto}
        aspect={photoAspect(demoPhoto) ?? FALLBACK_ASPECT}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        style={turned}
      />
    );
  return (
    <DrawingSticker
      kind={illustrationFor(item)}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      style={turned}
    />
  );
}

/** The generic drawing of a kind of garment on its sticker paper. Decorative. */
export function DrawingSticker({
  kind,
  maxWidth,
  maxHeight,
  style,
}: {
  kind: IllustrationKind;
  maxWidth: number;
  maxHeight: number;
  style?: ViewStyle;
}) {
  const drawing = drawings[kind];
  return (
    <View
      style={[Math.min(maxWidth, maxHeight) < SMALL ? null : lifted, style]}
    >
      <Image
        accessible={false}
        source={drawing}
        resizeMode="contain"
        style={fit(photoAspect(drawing) ?? 1, maxWidth, maxHeight)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
  frame: { padding: 5, borderRadius: 12, backgroundColor: PAPER },
  framed: { flex: 1, borderRadius: 8 },
});
