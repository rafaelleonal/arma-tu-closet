import type { Category, WardrobeItem } from '../domain';
import { colorName } from '../i18n/describe';
import type { Copy } from '../i18n/es';

/** True for each field that still needs a value; the form words it. */
export function itemFormErrors(
  item: Pick<WardrobeItem, 'name' | 'colors' | 'occasions'>,
) {
  return {
    name: !item.name.trim(),
    colors: !item.colors.length,
    occasions: !item.occasions.length,
  };
}

/** Name used when the person leaves it empty; neutral wording avoids gender agreement with the category. */
export function suggestedItemName(
  t: Copy,
  category: Category,
  colors: string[],
): string {
  if (!colors.length) return '';
  const names = colors
    .slice(0, 2)
    .map((color) => colorName(t, color).toLowerCase());
  return t.itemForm.suggestedName(
    t.categories[category],
    names,
    colors.length > 2,
  );
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
    item.wearMore === true,
    item.photoUri ?? null,
    item.cutoutUri ?? null,
  ]);
}
