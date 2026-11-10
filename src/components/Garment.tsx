import { useState } from 'react';
import type { WardrobeItem } from '../domain';

/** The kinds of generic drawing; each has a sticker in assets/garments/stickers. */
export type IllustrationKind =
  | 'tee'
  | 'shirt'
  | 'sweater'
  | 'trousers'
  | 'dress'
  | 'sneakers'
  | 'boots'
  | 'jacket'
  | 'scarf';

export function illustrationFor(item: WardrobeItem): IllustrationKind {
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

/** Says what the picture is, so a generic drawing is never read out as the garment's photo. */
export function garmentArtLabel(hasOwnPhoto: boolean, hasDemoPhoto: boolean) {
  if (hasOwnPhoto) return 'Foto';
  return hasDemoPhoto ? 'Foto de ejemplo' : 'Ilustración genérica';
}
