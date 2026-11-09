import { normalizeColor } from './recommendations';
import type { ColorTone, StyleGoal } from './types';

export interface Drape {
  label: string;
  hex: string;
}
export interface DrapePair {
  a: Drape;
  b: Drape;
}
export type DrapeVote = 'a' | 'b' | 'tie';

export interface ColorToneInfo {
  label: string;
  description: string;
  /** Drawn in the result. Finer than the wardrobe's 12 color names. */
  palette: string[];
  /** The same family expressed with the wardrobe's color names. */
  colors: string[];
}

/** Styling convention from personal color analysis, not a measurement of the person. */
export const COLOR_TONE_INFO: Record<ColorTone, ColorToneInfo> = {
  'spring-light': {
    label: 'Primavera clara',
    description: 'Colores cálidos, luminosos y suaves.',
    palette: ['#FBD3B6', '#FFE89A', '#CFE8A0', '#9ED9CC', '#F7A58A', '#FFF4E0'],
    colors: ['beige', 'rosa', 'amarillo', 'verde', 'blanco'],
  },
  'spring-bright': {
    label: 'Primavera brillante',
    description: 'Colores cálidos, vivos y alegres.',
    palette: ['#FF6B35', '#FFC400', '#4CC22E', '#00B5A5', '#F2385A', '#2F7DE1'],
    colors: ['naranja', 'amarillo', 'verde', 'rojo', 'azul'],
  },
  'summer-light': {
    label: 'Verano claro',
    description: 'Colores fríos, claros y delicados.',
    palette: ['#D8CDEB', '#BFD6EA', '#F2C9D6', '#BDE0DC', '#E9E9F2', '#A9B8DA'],
    colors: ['rosa', 'azul', 'morado', 'gris', 'blanco'],
  },
  'summer-mute': {
    label: 'Verano suave',
    description: 'Colores fríos, grisáceos y serenos.',
    palette: ['#8E7E9E', '#6E8799', '#B08896', '#7F9C96', '#A7A9B4', '#5F6F8C'],
    colors: ['gris', 'azul', 'rosa', 'morado', 'beige'],
  },
  'autumn-mute': {
    label: 'Otoño suave',
    description: 'Colores cálidos, terrosos y apagados.',
    palette: ['#C8A98A', '#A7A76F', '#C98C7A', '#8C8455', '#D9BE8F', '#7F6A55'],
    colors: ['beige', 'cafe', 'verde', 'naranja', 'amarillo'],
  },
  'autumn-deep': {
    label: 'Otoño profundo',
    description: 'Colores cálidos, intensos y oscuros.',
    palette: ['#5E3A1E', '#3D4A1F', '#7A1F1A', '#B5651D', '#1E5A5E', '#8A6A1F'],
    colors: ['cafe', 'verde', 'rojo', 'naranja', 'beige'],
  },
  'winter-bright': {
    label: 'Invierno brillante',
    description: 'Colores fríos, puros y de alto contraste.',
    palette: ['#F01478', '#0A58FF', '#00B08A', '#7A1FE0', '#111317', '#FFFFFF'],
    colors: ['negro', 'blanco', 'rojo', 'azul', 'rosa'],
  },
  'winter-deep': {
    label: 'Invierno profundo',
    description: 'Colores fríos, oscuros y elegantes.',
    palette: ['#6A0F3C', '#0B1F5C', '#053D3A', '#3E1A6E', '#111317', '#5B6270'],
    colors: ['negro', 'azul', 'morado', 'rojo', 'gris'],
  },
};

const drape = (label: string, hex: string): Drape => ({ label, hex });
const pair = (a: Drape, b: Drape): DrapePair => ({ a, b });

/** In every pair of this round, `a` is warm and `b` is cool. */
const TEMPERATURE = [
  pair(drape('Coral', '#F2785C'), drape('Fucsia', '#D63C8A')),
  pair(drape('Dorado', '#C9A24B'), drape('Plateado', '#AEB4BC')),
  pair(drape('Oliva', '#6F7A35'), drape('Azul verdoso', '#1F7F73')),
];
const SPRING_OR_AUTUMN = [
  pair(drape('Durazno', '#F7A58A'), drape('Terracota', '#A8502F')),
  pair(drape('Verde manzana', '#9CCB4E'), drape('Musgo', '#56602A')),
  pair(drape('Turquesa', '#2FB6A8'), drape('Petróleo', '#1E5A5E')),
];
const SUMMER_OR_WINTER = [
  pair(drape('Lavanda', '#B9A6D6'), drape('Violeta', '#5B1E9C')),
  pair(drape('Rosa empolvado', '#D9A0B4'), drape('Magenta', '#C00E6E')),
  pair(drape('Azul grisáceo', '#8FAFCB'), drape('Azul rey', '#1238A8')),
];

const SUBTYPES: Record<
  'spring' | 'summer' | 'autumn' | 'winter',
  { a: ColorTone; b: ColorTone; pairs: DrapePair[] }
> = {
  spring: {
    a: 'spring-light',
    b: 'spring-bright',
    pairs: [
      pair(drape('Melocotón', '#FBD3B6'), drape('Naranja vivo', '#FF6B35')),
      pair(drape('Verde tierno', '#CFE8A0'), drape('Verde vivo', '#4CC22E')),
      pair(drape('Vainilla', '#FFE89A'), drape('Amarillo vivo', '#FFC400')),
    ],
  },
  summer: {
    a: 'summer-light',
    b: 'summer-mute',
    pairs: [
      pair(drape('Lila claro', '#D8CDEB'), drape('Malva gris', '#8E7E9E')),
      pair(drape('Azul pálido', '#BFD6EA'), drape('Azul humo', '#6E8799')),
      pair(drape('Rosa pálido', '#F2C9D6'), drape('Rosa viejo', '#B08896')),
    ],
  },
  autumn: {
    a: 'autumn-mute',
    b: 'autumn-deep',
    pairs: [
      pair(drape('Camel', '#C8A98A'), drape('Chocolate', '#5E3A1E')),
      pair(drape('Salvia', '#A7A76F'), drape('Verde bosque', '#3D4A1F')),
      pair(drape('Teja suave', '#C98C7A'), drape('Vino tostado', '#7A1F1A')),
    ],
  },
  winter: {
    a: 'winter-bright',
    b: 'winter-deep',
    pairs: [
      pair(drape('Fucsia vivo', '#F01478'), drape('Vino frío', '#6A0F3C')),
      pair(drape('Azul eléctrico', '#0A58FF'), drape('Marino', '#0B1F5C')),
      pair(drape('Esmeralda', '#00B08A'), drape('Pino', '#053D3A')),
    ],
  },
};

const ROUND = 3;
export const COLOR_TEST_STEPS = ROUND * 3;

function winner(votes: DrapeVote[]): 'a' | 'b' | null {
  const a = votes.filter((vote) => vote === 'a').length;
  const b = votes.filter((vote) => vote === 'b').length;
  return a === b ? null : a > b ? 'a' : 'b';
}

/** A tied round falls back to its first option; the result then reports low confidence. */
function season(votes: DrapeVote[]) {
  const warm = (winner(votes.slice(0, ROUND)) ?? 'a') === 'a';
  const first = (winner(votes.slice(ROUND, ROUND * 2)) ?? 'a') === 'a';
  if (warm) return first ? ('spring' as const) : ('autumn' as const);
  return first ? ('summer' as const) : ('winter' as const);
}

export interface ColorTestStep {
  index: number;
  round: 0 | 1 | 2;
  pair: DrapePair;
  /** Sides alternate so a preference for one side cannot decide a round. */
  aOnLeft: boolean;
}

/** Null once every comparison has an answer. Later rounds depend on earlier votes. */
export function colorTestStep(votes: DrapeVote[]): ColorTestStep | null {
  const index = votes.length;
  if (index >= COLOR_TEST_STEPS) return null;
  const position = index % ROUND;
  const round = Math.floor(index / ROUND) as 0 | 1 | 2;
  const warm = (winner(votes.slice(0, ROUND)) ?? 'a') === 'a';
  const pairs =
    round === 0
      ? TEMPERATURE
      : round === 1
        ? warm
          ? SPRING_OR_AUTUMN
          : SUMMER_OR_WINTER
        : SUBTYPES[season(votes)].pairs;
  return { index, round, pair: pairs[position], aOnLeft: index % 2 === 0 };
}

export interface ColorTestResult {
  tone: ColorTone;
  /** False when a round tied, which usually means poor light or an unclear photo. */
  confident: boolean;
}

export function colorTestResult(votes: DrapeVote[]): ColorTestResult | null {
  if (votes.length < COLOR_TEST_STEPS) return null;
  const subtype = SUBTYPES[season(votes)];
  const last = winner(votes.slice(ROUND * 2));
  return {
    tone: (last ?? 'a') === 'a' ? subtype.a : subtype.b,
    confident:
      last !== null &&
      winner(votes.slice(0, ROUND)) !== null &&
      winner(votes.slice(ROUND, ROUND * 2)) !== null,
  };
}

/** Empty until the test is done. An excluded color is never suggested. */
export function suggestedColors(
  goal: Pick<StyleGoal, 'colorTone'>,
  excludedColors: string[],
): string[] {
  if (!goal.colorTone) return [];
  const excluded = new Set(excludedColors.map(normalizeColor));
  return COLOR_TONE_INFO[goal.colorTone].colors.filter(
    (color) => !excluded.has(normalizeColor(color)),
  );
}
