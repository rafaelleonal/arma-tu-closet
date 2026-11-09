import { isItemEligible, normalizeColor } from './recommendations';
import type {
  Category,
  RecommendationContext,
  SkinDepth,
  StyleGoal,
  StyleId,
  Undertone,
  WardrobeItem,
} from './types';

export const EMPTY_STYLE_GOAL: StyleGoal = {
  targetStyleIds: [],
  exploring: false,
};

/** The goal replaces the current styles only while the person is exploring. */
export function styleContext(
  styleIds: StyleId[],
  goal?: StyleGoal,
): Pick<RecommendationContext, 'styleIds' | 'explore'> {
  return goal?.exploring && goal.targetStyleIds.length
    ? { styleIds: goal.targetStyleIds, explore: true }
    : { styleIds };
}

/**
 * Styling convention, not a measurement: a starting point the person accepts or ignores.
 * It only ever adds favorites, so it never removes a garment from the suggestions.
 */
const TONE_COLORS: Record<SkinDepth, Record<Undertone, string[]>> = {
  light: {
    warm: ['beige', 'cafe', 'verde', 'naranja', 'azul'],
    neutral: ['azul', 'verde', 'gris', 'beige', 'rosa'],
    cool: ['azul', 'gris', 'rosa', 'morado', 'negro'],
  },
  medium: {
    warm: ['verde', 'naranja', 'cafe', 'rojo', 'beige'],
    neutral: ['azul', 'verde', 'rojo', 'beige', 'blanco'],
    cool: ['azul', 'morado', 'rosa', 'gris', 'blanco'],
  },
  deep: {
    warm: ['amarillo', 'naranja', 'rojo', 'verde', 'blanco'],
    neutral: ['blanco', 'rojo', 'azul', 'verde', 'amarillo'],
    cool: ['blanco', 'morado', 'azul', 'rosa', 'rojo'],
  },
};

/** Empty until the person sets a tone. An excluded color is never suggested. */
export function suggestedColors(
  goal: Pick<StyleGoal, 'skinDepth' | 'undertone'>,
  excludedColors: string[],
): string[] {
  if (!goal.skinDepth && !goal.undertone) return [];
  const excluded = new Set(excludedColors.map(normalizeColor));
  return TONE_COLORS[goal.skinDepth ?? 'medium'][
    goal.undertone ?? 'neutral'
  ].filter((color) => !excluded.has(normalizeColor(color)));
}

/** Base categories with no eligible garment tagged with the goal's styles. */
export function styleGaps(
  wardrobe: WardrobeItem[],
  context: RecommendationContext,
): Category[] {
  const target = new Set(context.styleIds ?? []);
  if (!target.size) return [];
  const has = (category: Category) =>
    wardrobe.some(
      (item) =>
        item.category === category &&
        isItemEligible(item, context) &&
        item.styleIds?.some((style) => target.has(style)),
    );
  const body: Category[] = has('one-piece')
    ? []
    : (['top', 'bottom'] as const).filter((category) => !has(category));
  return has('shoes') ? body : [...body, 'shoes'];
}
