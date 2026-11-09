import { isItemEligible } from './recommendations';
import type {
  Category,
  RecommendationContext,
  StyleGoal,
  StyleId,
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
