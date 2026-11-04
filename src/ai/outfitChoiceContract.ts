import { z } from 'zod';
import {
  CATEGORIES,
  COLOR_OPTIONS,
  OCCASIONS,
  STYLE_IDS,
} from '../domain/types';
import type { Context, Outfit } from '../domain/types';

const color = z.enum(COLOR_OPTIONS);
const style = z.enum(STYLE_IDS);
const piece = z
  .object({
    category: z.enum(CATEGORIES),
    colors: z.array(color).max(COLOR_OPTIONS.length),
    styles: z.array(style).max(STYLE_IDS.length),
    warmth: z.number().int().min(0).max(3),
    rainReady: z.boolean(),
    fitsOccasion: z.boolean(),
    wornRecently: z.boolean(),
    wearMore: z.boolean(),
  })
  .strict();

export const outfitChoiceInput = z
  .object({
    occasion: z.enum(OCCASIONS),
    temperatureC: z.number().min(-100).max(100),
    raining: z.boolean(),
    preferredColors: z.array(color).max(COLOR_OPTIONS.length),
    preferredStyles: z.array(style).max(STYLE_IDS.length),
    candidates: z
      .array(z.array(piece).min(2).max(CATEGORIES.length))
      .min(2)
      .max(5),
  })
  .strict();

export const outfitChoiceOutput = z
  .object({ index: z.number().int().min(0).max(4) })
  .strict();
export type OutfitChoiceInput = z.infer<typeof outfitChoiceInput>;

export function buildOutfitChoice(
  outfits: Outfit[],
  context: Context,
): OutfitChoiceInput {
  const colors = (values: string[]) =>
    [...new Set(values)].flatMap((value) => {
      const parsed = color.safeParse(value);
      return parsed.success ? [parsed.data] : [];
    });
  return {
    occasion: context.occasion,
    temperatureC: context.temperatureC,
    raining: context.raining,
    preferredColors: colors(context.preferredColors),
    preferredStyles: [...new Set(context.styleIds ?? [])],
    candidates: outfits.map((outfit) =>
      outfit.items.map((item) => ({
        category: item.category,
        colors: colors(item.colors),
        styles: [...new Set(item.styleIds ?? [])],
        warmth: item.warmth,
        rainReady: item.rainReady,
        fitsOccasion: item.occasions.includes(context.occasion),
        wornRecently: Boolean(
          item.lastWornAt &&
          context.rotationDays > 0 &&
          Date.parse(context.now) - Date.parse(item.lastWornAt) <
            context.rotationDays * 86_400_000,
        ),
        wearMore: item.wearMore === true,
      })),
    ),
  };
}
