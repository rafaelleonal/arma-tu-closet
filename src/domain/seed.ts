import type { RecommendationContext, WardrobeItem } from './types';

/** Example garments only. The app can remove these and start with an empty wardrobe. */
export const SEED_WARDROBE: WardrobeItem[] = [
  { id: 'demo-top-black', name: 'Playera negra', category: 'top', colors: ['negro'], occasions: ['casual', 'outing', 'sport'], warmth: 0, rainReady: false, available: true, styleIds: ['minimal', 'street', 'relaxed'] },
  { id: 'demo-top-white', name: 'Camisa blanca', category: 'top', colors: ['blanco'], occasions: ['casual', 'work', 'formal', 'outing'], warmth: 1, rainReady: false, available: true, styleIds: ['minimal', 'classic'] },
  { id: 'demo-top-green', name: 'Suéter verde', category: 'top', colors: ['verde'], occasions: ['casual', 'work', 'outing'], warmth: 3, rainReady: false, available: true, styleIds: ['relaxed', 'creative'] },
  { id: 'demo-bottom-blue', name: 'Jeans azules', category: 'bottom', colors: ['azul'], occasions: ['casual', 'outing'], warmth: 1, rainReady: false, available: true, styleIds: ['street', 'relaxed'] },
  { id: 'demo-bottom-black', name: 'Pantalón negro', category: 'bottom', colors: ['negro'], occasions: ['casual', 'work', 'formal', 'outing'], warmth: 1, rainReady: false, available: true, styleIds: ['minimal', 'classic'] },
  { id: 'demo-bottom-gray', name: 'Pantalón deportivo gris', category: 'bottom', colors: ['gris'], occasions: ['sport', 'casual'], warmth: 1, rainReady: false, available: true, styleIds: ['sport', 'relaxed'] },
  { id: 'demo-onepiece-black', name: 'Vestido negro', category: 'one-piece', colors: ['negro'], occasions: ['casual', 'work', 'formal', 'outing'], warmth: 1, rainReady: false, available: true, styleIds: ['minimal', 'classic'] },
  { id: 'demo-shoes-white', name: 'Tenis blancos', category: 'shoes', colors: ['blanco'], occasions: ['casual', 'sport', 'outing'], warmth: 1, rainReady: false, available: true, styleIds: ['street', 'sport', 'relaxed'] },
  { id: 'demo-shoes-black', name: 'Botines negros', category: 'shoes', colors: ['negro'], occasions: ['casual', 'work', 'formal', 'outing'], warmth: 2, rainReady: true, available: true, styleIds: ['classic', 'creative'] },
  { id: 'demo-layer-beige', name: 'Chamarra beige', category: 'layer', colors: ['beige'], occasions: ['casual', 'work', 'outing'], warmth: 2, rainReady: true, available: true, styleIds: ['relaxed', 'street'] },
  { id: 'demo-layer-black', name: 'Saco negro', category: 'layer', colors: ['negro'], occasions: ['work', 'formal', 'outing'], warmth: 2, rainReady: false, available: true, styleIds: ['classic', 'minimal'] },
  { id: 'demo-accessory-gray', name: 'Bufanda gris', category: 'accessory', colors: ['gris'], occasions: ['casual', 'work', 'outing'], warmth: 2, rainReady: false, available: true, styleIds: ['classic', 'relaxed'] },
];

export const seedWardrobe: WardrobeItem[] = SEED_WARDROBE.map(item => ({ ...item, isDemo: true }));

export function createDefaultContext(now = new Date().toISOString()): RecommendationContext {
  return { occasion: 'casual', temperatureC: 22, raining: false, preferredColors: [], excludedColors: [], rotationDays: 3, now };
}
