import type { Category, WardrobeItem } from '../domain';

/** Where a garment lies on the table, as fractions of the stage. */
export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  z: number;
}
type Layout = Partial<Record<Category, Slot>>;

const SEPARATES: Layout = {
  top: { x: 0.02, y: 0, w: 0.54, h: 0.52, rotate: -4, z: 2 },
  bottom: { x: 0.52, y: 0.12, w: 0.42, h: 0.7, rotate: 5, z: 1 },
  shoes: { x: 0.04, y: 0.58, w: 0.46, h: 0.34, rotate: -6, z: 3 },
  accessory: { x: 0.64, y: 0.74, w: 0.32, h: 0.26, rotate: 8, z: 4 },
};
const SEPARATES_WITH_LAYER: Layout = {
  layer: { x: 0.46, y: 0, w: 0.52, h: 0.46, rotate: 6, z: 0 },
  top: { x: 0, y: 0.06, w: 0.5, h: 0.46, rotate: -4, z: 2 },
  // Starts where the layer's name tag ends, so the tag is never covered.
  bottom: { x: 0.54, y: 0.46, w: 0.38, h: 0.54, rotate: 5, z: 1 },
  shoes: { x: 0.04, y: 0.6, w: 0.44, h: 0.32, rotate: -6, z: 3 },
  accessory: { x: 0.3, y: 0.46, w: 0.26, h: 0.2, rotate: 8, z: 4 },
};
const ONE_PIECE: Layout = {
  'one-piece': { x: 0.06, y: 0, w: 0.5, h: 0.86, rotate: -3, z: 1 },
  layer: { x: 0.5, y: 0.02, w: 0.48, h: 0.46, rotate: 6, z: 0 },
  shoes: { x: 0.54, y: 0.5, w: 0.42, h: 0.3, rotate: -6, z: 3 },
  accessory: { x: 0.6, y: 0.78, w: 0.34, h: 0.22, rotate: 8, z: 4 },
};
const SPARE: Slot = { x: 0.3, y: 0.3, w: 0.4, h: 0.4, rotate: 0, z: 5 };

function layoutFor(categories: readonly Category[]): Layout {
  if (categories.includes('one-piece')) return ONE_PIECE;
  return categories.includes('layer') ? SEPARATES_WITH_LAYER : SEPARATES;
}

/** The place of a category on a table that holds `categories`, filled or still empty. */
export function slotForCategory(
  categories: readonly Category[],
  category: Category,
): Slot {
  return layoutFor(categories)[category] ?? SPARE;
}

/** The place of one garment among the rest of its outfit. */
export function slotFor(items: WardrobeItem[], item: WardrobeItem): Slot {
  return slotForCategory(
    items.map((value) => value.category),
    item.category,
  );
}
