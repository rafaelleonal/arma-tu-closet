import { seedWardrobe } from './seed';
import { CATEGORIES, COLOR_OPTIONS, type WardrobeItem } from './types';

/**
 * Development-only closets for stress-testing the Mi clóset screen. They are shown in place of the
 * stored items and never written to the local document.
 */
export type QaClosetMode = 'worst' | 'empty' | 'one' | 'many' | 'demoEdited';

const garment = (
  id: string,
  name: string,
  overrides: Partial<WardrobeItem> = {},
): WardrobeItem => ({
  id: `qa-${id}`,
  name,
  category: 'top',
  colors: ['negro'],
  occasions: ['casual'],
  warmth: 1,
  rainReady: false,
  available: true,
  ...overrides,
});

// Each of the first rows breaks something different, the way real data mixes them.
const WORST: WardrobeItem[] = [
  // The editor and the AI review cap names at 60; this one is 59.
  garment(
    'long',
    'Chamarra impermeable de plumas con capucha desmontable azul',
    {
      category: 'layer',
      colors: ['azul'],
    },
  ),
  garment('short', 'Top'),
  // The stored schema has no length limit; an older document or an import can carry this.
  garment(
    'over-limit',
    'Vestido largo de lino con botones de concha, regalo de la boda de mi prima en Oaxaca',
    { category: 'one-piece', colors: ['beige'], available: false },
  ),
  garment('unbroken', 'Sobrecamisa-oversize-de-pana-acanalada', {
    colors: [...COLOR_OPTIONS],
  }),
  // A photo whose file no longer exists, e.g. after the app's storage was cleared.
  garment('missing-photo', 'Jeans rectos', {
    category: 'bottom',
    colors: ['azul'],
    photoUri: 'file:///missing/arma-tu-outfit/photo-0001.jpg',
  }),
  garment('emoji', '🧥 Abrigo de la abuela', {
    category: 'layer',
    colors: ['cafe'],
    available: false,
  }),
  garment(
    'missing-cutout',
    'Tenis de correr para maratón edición limitada (los buenos)',
    {
      category: 'shoes',
      colors: ['blanco', 'naranja'],
      photoUri: 'file:///missing/arma-tu-outfit/photo-0002.jpg',
      cutoutUri: 'file:///missing/arma-tu-outfit/cutout-0002.png',
    },
  ),
  garment('hangul', 'Hanbok 한복 de gala', {
    category: 'one-piece',
    colors: ['rosa', 'blanco'],
  }),
  // A color outside the palette, as an older version or a hand-edited backup could store.
  garment('unknown-color', 'Bolsa vino', {
    category: 'accessory',
    colors: ['vino tinto'],
  }),
];

const NAMES = [
  'Playera básica',
  'Pantalón de vestir',
  'Vestido de verano',
  'Botas de piel',
  'Saco de lana',
  'Bufanda tejida',
];

// A large, unpaginated closet: every category, some in the laundry.
const MANY: WardrobeItem[] = Array.from({ length: 400 }, (_, index) =>
  garment(`many-${index}`, `${NAMES[index % 6]} ${index + 1}`, {
    category: CATEGORIES[index % 6],
    colors: [COLOR_OPTIONS[index % COLOR_OPTIONS.length]],
    available: index % 7 !== 0,
  }),
);

// The example closet after the person renamed one garment and sent two to the laundry.
const demoEdited = (): WardrobeItem[] =>
  seedWardrobe.map((item, index) =>
    index === 0
      ? {
          ...item,
          name: 'Playera blanca de algodón orgánico que uso para dormir',
        }
      : index < 3
        ? { ...item, available: false }
        : { ...item },
  );

export function qaCloset(mode: QaClosetMode): WardrobeItem[] {
  switch (mode) {
    case 'worst':
      return WORST;
    case 'empty':
      return [];
    case 'one':
      return [garment('one', 'Camisa de lino', { colors: ['blanco'] })];
    case 'many':
      return MANY;
    case 'demoEdited':
      return demoEdited();
  }
}
