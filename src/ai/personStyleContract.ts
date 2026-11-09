import { z } from 'zod';
import { SKIN_DEPTHS, STYLE_IDS, UNDERTONES } from '../domain/types';

/** Strict on purpose: any other attribute about the person is rejected, never stored. */
export const personStyleSuggestion = z
  .object({
    skinDepth: z.enum(SKIN_DEPTHS).nullable(),
    undertone: z.enum(UNDERTONES).nullable(),
    styleIds: z.array(z.enum(STYLE_IDS)).max(3),
  })
  .strict();

export type PersonStyleSuggestion = z.infer<typeof personStyleSuggestion>;

export function parsePersonStyleSuggestion(
  value: unknown,
): PersonStyleSuggestion {
  const suggestion = personStyleSuggestion.parse(value);
  if (new Set(suggestion.styleIds).size !== suggestion.styleIds.length)
    throw new Error('La propuesta de estilo no es válida.');
  return suggestion;
}
