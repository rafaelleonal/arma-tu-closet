import { CATEGORIES, COLOR_OPTIONS, type Category } from '../domain/types';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export interface GarmentSuggestion {
  name: string;
  category: Category;
  colors: string[];
}

/** Shared client/server boundary. Suggestions never contain inferred operational attributes. */
export function parseGarmentSuggestion(value: unknown): GarmentSuggestion {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('La sugerencia de prenda no es válida.');
  const candidate = value as Record<string, unknown>;
  if (Object.keys(candidate).some(key => !['name', 'category', 'colors'].includes(key))
    || typeof candidate.name !== 'string' || !candidate.name.trim() || candidate.name.trim().length > 60
    || /[\u0000-\u001f\u007f]/.test(candidate.name)
    || typeof candidate.category !== 'string' || !(CATEGORIES as readonly string[]).includes(candidate.category)
    || !Array.isArray(candidate.colors) || !candidate.colors.length || candidate.colors.length > COLOR_OPTIONS.length
    || candidate.colors.some(color => typeof color !== 'string' || !COLOR_OPTIONS.includes(color))
    || new Set(candidate.colors).size !== candidate.colors.length) {
    throw new Error('La sugerencia de prenda no es válida.');
  }
  return { name: candidate.name.trim(), category: candidate.category as Category, colors: [...candidate.colors] as string[] };
}
