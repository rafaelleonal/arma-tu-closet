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

export const COLOR_TONES = [
  'spring-light',
  'spring-bright',
  'summer-light',
  'summer-mute',
  'autumn-mute',
  'autumn-deep',
  'winter-bright',
  'winter-deep',
] as const;
export type ColorTone = (typeof COLOR_TONES)[number];

/** Chosen by the person. A tone only exists after they finish the color test. */
export interface StyleGoal {
  targetStyleIds: StyleId[];
  exploring: boolean;
  colorTone?: ColorTone;
}

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
  wearMore?: boolean;
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
  /** Strengthens styleIds and favors rarely worn garments. Hard limits do not change. */
  explore?: boolean;
  /** ISO timestamp supplied by the caller for reproducible results. */
  now: string;
}

export interface Outfit {
  id: string;
  items: WardrobeItem[];
  score: number;
  /**
   * Reason and warning codes (see `reasons.ts`), worded by the interface in the active
   * language. Outfits saved before the codes may still hold Spanish sentences.
   */
  reasons: string[];
  warnings: string[];
}

/** A base piece the wardrobe lacks among available garments without an excluded color. */
export type MissingPiece = 'shoes' | 'top' | 'bottom';

/** Why there is no proposal. The interface turns it into a sentence. */
export type RecommendationProblem =
  | { kind: 'empty' }
  | { kind: 'pinned-gone' }
  | { kind: 'pinned-unavailable' }
  | { kind: 'pinned-excluded' }
  | { kind: 'pinned-missing'; missing: MissingPiece[] }
  /** `onePieceWouldDo` is false only when shoes are what is missing. */
  | { kind: 'missing'; missing: MissingPiece[]; onePieceWouldDo: boolean };

export interface RecommendationResult {
  status: 'ready' | 'empty' | 'insufficient';
  outfits: Outfit[];
  problem?: RecommendationProblem;
}

export type SwapProblem = 'outfit-changed' | 'slot-missing' | 'no-option';

export interface SwapResult {
  status: 'swapped' | 'unavailable';
  outfit: Outfit;
  problem?: SwapProblem;
}

export interface WearResult {
  status: 'recorded' | 'unavailable';
  wardrobe: WardrobeItem[];
}

export type Context = RecommendationContext;

/** Stored color ids. They stay in Spanish for compatibility; the interface translates them. */
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
] as const;
export type ColorId = (typeof COLOR_OPTIONS)[number];
