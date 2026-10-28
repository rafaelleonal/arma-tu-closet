import {
  parseGarmentSuggestion,
  type GarmentSuggestion,
} from '../src/ai/contracts';

export type AnalysisResult =
  | { status: 'ok'; suggestion: GarmentSuggestion }
  | {
      status: 'multiple_garments' | 'unclear' | 'not_garment';
      suggestion: null;
    };

export interface AnalysisImage {
  bytes: Uint8Array;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export type GarmentAnalyzer = (
  image: AnalysisImage,
  signal: AbortSignal,
) => Promise<unknown>;

/** Validate again at the HTTP boundary, even with an injected provider. */
export function parseAnalysisResult(value: unknown): AnalysisResult {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid analysis output');
  const result = value as Record<string, unknown>;
  if (
    Object.keys(result).some((key) => !['status', 'suggestion'].includes(key))
  )
    throw new Error('Invalid analysis output');
  if (result.status === 'ok')
    return {
      status: 'ok',
      suggestion: parseGarmentSuggestion(result.suggestion),
    };
  if (
    ['multiple_garments', 'unclear', 'not_garment'].includes(
      String(result.status),
    ) &&
    result.suggestion === null
  ) {
    return {
      status: result.status as 'multiple_garments' | 'unclear' | 'not_garment',
      suggestion: null,
    };
  }
  throw new Error('Invalid analysis output');
}

export const rejectionMessages = {
  multiple_garments:
    'Hay varias prendas en la foto. Usa una foto de una sola prenda.',
  unclear:
    'No se distingue una sola prenda con claridad. Prueba otra foto o completa los datos a mano.',
  not_garment:
    'No identificamos una prenda en la foto. Elige otra foto o completa los datos a mano.',
} as const;
