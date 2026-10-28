export const CATEGORIES = [
  'top',
  'bottom',
  'one-piece',
  'shoes',
  'layer',
  'accessory',
] as const;
export type Category = (typeof CATEGORIES)[number];
export type OutfitSlot = Category;
export const OCCASIONS = [
  'casual',
  'work',
  'formal',
  'sport',
  'outing',
] as const;
export type Occasion = (typeof OCCASIONS)[number];
export const STYLE_IDS = [
  'minimal',
  'classic',
  'street',
  'relaxed',
  'creative',
  'sport',
  'girly',
  'feminine',
] as const;
export type StyleId = (typeof STYLE_IDS)[number];
export const STYLE_OPTIONS: ReadonlyArray<{
  id: StyleId;
  label: string;
  description: string;
}> = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Líneas simples y combinaciones discretas.',
  },
  {
    id: 'classic',
    label: 'Clásico',
    description: 'Prendas de siempre y detalles sobrios.',
  },
  {
    id: 'street',
    label: 'Urbano',
    description: 'Inspiración de calle y contrastes casuales.',
  },
  {
    id: 'relaxed',
    label: 'Relajado',
    description: 'Comodidad y un aire despreocupado.',
  },
  {
    id: 'creative',
    label: 'Creativo',
    description: 'Colores, mezclas y detalles con personalidad.',
  },
  {
    id: 'sport',
    label: 'Deportivo',
    description: 'Prendas con inspiración deportiva.',
  },
  {
    id: 'girly',
    label: 'Girly',
    description: 'Tonos suaves, moños y detalles juguetones.',
  },
  {
    id: 'feminine',
    label: 'Femenino',
    description: 'Siluetas definidas y detalles delicados.',
  },
];

/** Plain, JSON-serializable local wardrobe data. No gender is inferred. */
export interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  colors: string[];
  occasions: Occasion[];
  /** 0 = muy ligera, 3 = muy abrigadora. */
  warmth: 0 | 1 | 2 | 3;
  rainReady: boolean;
  available: boolean;
  lastWornAt?: string;
  wearCount?: number;
  photoUri?: string;
  /** Optional in v3: background-free PNG made on the device from photoUri; the original photo is kept. */
  cutoutUri?: string;
  isDemo?: boolean;
  /** Optional explicit labels; legacy garments stay untagged. */
  styleIds?: StyleId[];
}

export interface RecommendationContext {
  occasion: Occasion;
  temperatureC: number;
  raining: boolean;
  preferredColors: string[];
  /** Hard exclusion: any matching color excludes the entire garment. */
  excludedColors: string[];
  /** Soft rotation window. 0 disables the recent-wear penalty. */
  rotationDays: number;
  /** Soft affinity only; missing tags never exclude a garment. */
  styleIds?: StyleId[];
  /** ISO timestamp supplied by the caller for reproducible results. */
  now: string;
}

export interface Outfit {
  id: string;
  items: WardrobeItem[];
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface RecommendationResult {
  status: 'ready' | 'empty' | 'insufficient';
  outfits: Outfit[];
  message: string;
}

export interface SwapResult {
  status: 'swapped' | 'unavailable';
  outfit: Outfit;
  message: string;
}

export interface WearResult {
  status: 'recorded' | 'unavailable';
  wardrobe: WardrobeItem[];
  message: string;
}

export type Context = RecommendationContext;

export const CATEGORY_LABELS: Record<Category, string> = {
  top: 'Parte de arriba',
  bottom: 'Parte de abajo',
  'one-piece': 'Prenda completa',
  shoes: 'Calzado',
  layer: 'Capa exterior',
  accessory: 'Accesorio',
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: 'Día a día',
  work: 'Trabajo',
  formal: 'Evento formal',
  sport: 'Actividad física',
  outing: 'Salida',
};

export const COLOR_OPTIONS = [
  'negro',
  'blanco',
  'gris',
  'beige',
  'azul',
  'verde',
  'cafe',
  'rojo',
  'rosa',
  'amarillo',
  'morado',
  'naranja',
];

export const categoryLabels = CATEGORY_LABELS;
export const occasionLabels = OCCASION_LABELS;
export const colorLabels: Record<string, string> = Object.fromEntries(
  COLOR_OPTIONS.map((color) => [
    color,
    color === 'cafe' ? 'Café' : color.charAt(0).toUpperCase() + color.slice(1),
  ]),
);
