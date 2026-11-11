import { normalizeColor } from './recommendations';
import type { ColorTone, StyleGoal } from './types';

/** `id` names the swatch for the interface, which words it. */
export interface Drape {
  id: string;
  hex: string;
}
export interface DrapePair {
  a: Drape;
  b: Drape;
}
export type DrapeVote = 'a' | 'b' | 'tie';

export interface ColorToneInfo {
  /** Drawn in the result. Finer than the wardrobe's 12 color names. */
  palette: string[];
  /** The same family expressed with the wardrobe's color names. */
  colors: string[];
}

/** Styling convention from personal color analysis, not a measurement of the person. */
export const COLOR_TONE_INFO: Record<ColorTone, ColorToneInfo> = {
  'spring-light': {
    palette: ['#FBD3B6', '#FFE89A', '#CFE8A0', '#9ED9CC', '#F7A58A', '#FFF4E0'],
    colors: ['beige', 'rosa', 'amarillo', 'verde', 'blanco'],
  },
  'spring-bright': {
    palette: ['#FF6B35', '#FFC400', '#4CC22E', '#00B5A5', '#F2385A', '#2F7DE1'],
    colors: ['naranja', 'amarillo', 'verde', 'rojo', 'azul'],
  },
  'summer-light': {
    palette: ['#D8CDEB', '#BFD6EA', '#F2C9D6', '#BDE0DC', '#E9E9F2', '#A9B8DA'],
    colors: ['rosa', 'azul', 'morado', 'gris', 'blanco'],
  },
  'summer-mute': {
    palette: ['#8E7E9E', '#6E8799', '#B08896', '#7F9C96', '#A7A9B4', '#5F6F8C'],
    colors: ['gris', 'azul', 'rosa', 'morado', 'beige'],
  },
  'autumn-mute': {
    palette: ['#C8A98A', '#A7A76F', '#C98C7A', '#8C8455', '#D9BE8F', '#7F6A55'],
    colors: ['beige', 'cafe', 'verde', 'naranja', 'amarillo'],
  },
  'autumn-deep': {
    palette: ['#5E3A1E', '#3D4A1F', '#7A1F1A', '#B5651D', '#1E5A5E', '#8A6A1F'],
    colors: ['cafe', 'verde', 'rojo', 'naranja', 'beige'],
  },
  'winter-bright': {
    palette: ['#F01478', '#0A58FF', '#00B08A', '#7A1FE0', '#111317', '#FFFFFF'],
    colors: ['negro', 'blanco', 'rojo', 'azul', 'rosa'],
  },
  'winter-deep': {
    palette: ['#6A0F3C', '#0B1F5C', '#053D3A', '#3E1A6E', '#111317', '#5B6270'],
    colors: ['negro', 'azul', 'morado', 'rojo', 'gris'],
  },
};

const drape = (id: string, hex: string): Drape => ({ id, hex });
const pair = (a: Drape, b: Drape): DrapePair => ({ a, b });

/** In every pair of this round, `a` is warm and `b` is cool. */
const TEMPERATURE = [
  pair(drape('coral', '#F2785C'), drape('fuchsia', '#D63C8A')),
  pair(drape('gold', '#C9A24B'), drape('silver', '#AEB4BC')),
  pair(drape('olive', '#6F7A35'), drape('teal', '#1F7F73')),
];
const SPRING_OR_AUTUMN = [
  pair(drape('peach', '#F7A58A'), drape('terracotta', '#A8502F')),
  pair(drape('apple-green', '#9CCB4E'), drape('moss', '#56602A')),
  pair(drape('turquoise', '#2FB6A8'), drape('petrol', '#1E5A5E')),
];
const SUMMER_OR_WINTER = [
  pair(drape('lavender', '#B9A6D6'), drape('violet', '#5B1E9C')),
  pair(drape('dusty-pink', '#D9A0B4'), drape('magenta', '#C00E6E')),
  pair(drape('gray-blue', '#8FAFCB'), drape('royal-blue', '#1238A8')),
];

const SUBTYPES: Record<
  'spring' | 'summer' | 'autumn' | 'winter',
  { a: ColorTone; b: ColorTone; pairs: DrapePair[] }
> = {
  spring: {
    a: 'spring-light',
    b: 'spring-bright',
    pairs: [
      pair(drape('apricot', '#FBD3B6'), drape('bright-orange', '#FF6B35')),
      pair(drape('soft-green', '#CFE8A0'), drape('bright-green', '#4CC22E')),
      pair(drape('vanilla', '#FFE89A'), drape('bright-yellow', '#FFC400')),
    ],
  },
  summer: {
    a: 'summer-light',
    b: 'summer-mute',
    pairs: [
      pair(drape('light-lilac', '#D8CDEB'), drape('gray-mauve', '#8E7E9E')),
      pair(drape('pale-blue', '#BFD6EA'), drape('smoke-blue', '#6E8799')),
      pair(drape('pale-pink', '#F2C9D6'), drape('old-rose', '#B08896')),
    ],
  },
  autumn: {
    a: 'autumn-mute',
    b: 'autumn-deep',
    pairs: [
      pair(drape('camel', '#C8A98A'), drape('chocolate', '#5E3A1E')),
      pair(drape('sage', '#A7A76F'), drape('forest-green', '#3D4A1F')),
      pair(drape('soft-tile', '#C98C7A'), drape('burnt-wine', '#7A1F1A')),
    ],
  },
  winter: {
    a: 'winter-bright',
    b: 'winter-deep',
    pairs: [
      pair(drape('bright-fuchsia', '#F01478'), drape('cool-wine', '#6A0F3C')),
      pair(drape('electric-blue', '#0A58FF'), drape('navy', '#0B1F5C')),
      pair(drape('emerald', '#00B08A'), drape('pine', '#053D3A')),
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
