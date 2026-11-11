import { OCCASIONS, STYLE_IDS, type Occasion, type StyleId } from './types';

/**
 * Why an outfit fits, as data. The recommender stores each one as a short code
 * (`occasion:work`) so a saved outfit keeps the same JSON shape; the interface words it.
 */
export type OutfitReason =
  | { kind: 'style'; styleIds: StyleId[] }
  | { kind: 'lightly-used' }
  | { kind: 'occasion'; occasion: Occasion }
  | { kind: 'warmth'; temperatureC: number }
  | { kind: 'favorite-color' }
  | { kind: 'rotation'; days: number }
  | { kind: 'rain-ready' }
  | { kind: 'one-color' };

/** Warnings are never hidden with the reasons. */
export type OutfitWarning =
  | { kind: 'occasion-untagged' }
  | { kind: 'warmth'; temperatureC: number }
  | { kind: 'worn-recently' }
  | { kind: 'shoes-not-rain-ready' }
  | { kind: 'no-rain-layer' };

export function reasonCode(reason: OutfitReason): string {
  switch (reason.kind) {
    case 'style':
      return `style:${reason.styleIds.join(',')}`;
    case 'occasion':
      return `occasion:${reason.occasion}`;
    case 'warmth':
      return `warmth:${reason.temperatureC}`;
    case 'rotation':
      return `rotation:${reason.days}`;
    default:
      return reason.kind;
  }
}

export function warningCode(warning: OutfitWarning): string {
  return warning.kind === 'warmth'
    ? `warmth:${warning.temperatureC}`
    : warning.kind;
}

const number = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};
const occasion = (value: string) =>
  OCCASIONS.find((id) => id === value) as Occasion | undefined;
const styles = (value: string) => {
  const ids = value
    .split(',')
    .filter((id): id is StyleId =>
      (STYLE_IDS as readonly string[]).includes(id),
    );
  return ids.length ? ids : undefined;
};

/** Spanish labels the recommender wrote before codes, to read outfits saved back then. */
const LEGACY_OCCASIONS: Record<string, Occasion> = {
  'día a día': 'casual',
  trabajo: 'work',
  'evento formal': 'formal',
  'actividad física': 'sport',
  salida: 'outing',
};
const LEGACY_STYLES: Record<string, StyleId> = {
  minimal: 'minimal',
  clásico: 'classic',
  urbano: 'street',
  relajado: 'relaxed',
  creativo: 'creative',
  deportivo: 'sport',
  girly: 'girly',
  femenino: 'feminine',
};

function legacyReason(text: string): OutfitReason | undefined {
  let match = text.match(/^Estilo: (.+)$/);
  if (match) {
    const ids = match[1]
      .split(', ')
      .flatMap((label) => LEGACY_STYLES[label] ?? []);
    return ids.length ? { kind: 'style', styleIds: ids } : undefined;
  }
  match = text.match(/^Ocasión: (.+)$/);
  if (match) {
    const id = LEGACY_OCCASIONS[match[1]];
    return id ? { kind: 'occasion', occasion: id } : undefined;
  }
  match = text.match(/^Abrigo estimado para (.+) °C$/);
  if (match) {
    const value = number(match[1]);
    return value === undefined
      ? undefined
      : { kind: 'warmth', temperatureC: value };
  }
  match = text.match(/^Sin uso registrado en (\d+) días$/);
  if (match) return { kind: 'rotation', days: Number(match[1]) };
  const fixed: Record<string, OutfitReason> = {
    'Incluye prendas poco usadas': { kind: 'lightly-used' },
    'Color favorito': { kind: 'favorite-color' },
    'Calzado y capa marcados para lluvia': { kind: 'rain-ready' },
    'Un solo color': { kind: 'one-color' },
  };
  return fixed[text];
}

/** Undefined for text it does not recognize; the interface then shows it as written. */
export function parseReason(code: string): OutfitReason | undefined {
  const [kind, value = ''] = code.split(/:(.*)/s);
  switch (kind) {
    case 'style': {
      const ids = styles(value);
      return ids ? { kind, styleIds: ids } : undefined;
    }
    case 'occasion': {
      const id = occasion(value);
      return id ? { kind, occasion: id } : undefined;
    }
    case 'warmth': {
      const degrees = number(value);
      return degrees === undefined
        ? undefined
        : { kind, temperatureC: degrees };
    }
    case 'rotation': {
      const days = number(value);
      return days === undefined ? undefined : { kind, days };
    }
    case 'lightly-used':
    case 'favorite-color':
    case 'rain-ready':
    case 'one-color':
      return value ? undefined : { kind };
    default:
      return legacyReason(code);
  }
}

function legacyWarning(text: string): OutfitWarning | undefined {
  const match = text.match(/^Revisa el abrigo para (.+) °C$/);
  if (match) {
    const value = number(match[1]);
    return value === undefined
      ? undefined
      : { kind: 'warmth', temperatureC: value };
  }
  const fixed: Record<string, OutfitWarning> = {
    'Hay prendas sin etiqueta para esta ocasión': { kind: 'occasion-untagged' },
    'Incluye prendas usadas recientemente': { kind: 'worn-recently' },
    'Calzado sin marcar para lluvia': { kind: 'shoes-not-rain-ready' },
    'Sin capa marcada para lluvia': { kind: 'no-rain-layer' },
  };
  return fixed[text];
}

export function parseWarning(code: string): OutfitWarning | undefined {
  const [kind, value = ''] = code.split(/:(.*)/s);
  switch (kind) {
    case 'warmth': {
      const degrees = number(value);
      return degrees === undefined
        ? undefined
        : { kind, temperatureC: degrees };
    }
    case 'occasion-untagged':
    case 'worn-recently':
    case 'shoes-not-rain-ready':
    case 'no-rain-layer':
      return value ? undefined : { kind };
    default:
      return legacyWarning(code);
  }
}
