import {
  categoryLabels,
  colorLabels,
  type Category,
  type WardrobeItem,
} from '../domain';

export function itemFormErrors(
  item: Pick<WardrobeItem, 'name' | 'colors' | 'occasions'>,
) {
  return {
    name: item.name.trim() ? '' : 'Escribe un nombre.',
    colors: item.colors.length ? '' : 'Elige al menos un color.',
    occasions: item.occasions.length ? '' : 'Elige al menos una ocasión.',
  };
}

/** Name used when the person leaves it empty; neutral wording avoids gender agreement with the category. */
export function suggestedItemName(
  category: Category,
  colors: string[],
): string {
  if (!colors.length) return '';
  const names = colors
    .slice(0, 2)
    .map((color) => (colorLabels[color] ?? color).toLowerCase());
  return `${categoryLabels[category]} · ${names.join(' y ')}${colors.length > 2 ? ' y más' : ''}`;
}

/** Starting warmth for a new item until the person chooses one; layers usually add more than a base piece. */
export function defaultWarmth(category: Category): WardrobeItem['warmth'] {
  return category === 'layer' ? 2 : category === 'accessory' ? 0 : 1;
}

/** Compare editable values; usage counters and the order of tags are not edits. */
export function itemFormFingerprint(item: WardrobeItem): string {
  return JSON.stringify([
    item.name.trim(),
    item.category,
    [...item.colors].sort(),
    [...item.occasions].sort(),
    [...(item.styleIds ?? [])].sort(),
    item.warmth,
    item.rainReady,
    item.available,
    item.photoUri ?? null,
    item.cutoutUri ?? null,
  ]);
}
