import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OCCASIONS,
  STYLE_IDS,
  createDefaultContext,
  generateRecommendations,
  parseReason,
  parseWarning,
  seedWardrobe,
} from '../src/domain';
import type {
  RecommendationContext,
  RecommendationProblem,
  WardrobeItem,
} from '../src/domain';
import { reasonText, warningText } from '../src/i18n/describe';
import { en } from '../src/i18n/en';
import { es } from '../src/i18n/es';

const NOW = '2026-11-09T16:00:00.000Z';
const CATALOGS = { es, en };

/** Contexts that together make the recommender write each of its reasons and warnings. */
function contexts(): RecommendationContext[] {
  const base = createDefaultContext(NOW);
  return [
    ...OCCASIONS.map((occasion) => ({ ...base, occasion })),
    { ...base, raining: true, temperatureC: 8 },
    { ...base, preferredColors: ['azul', 'blanco'], rotationDays: 5 },
    { ...base, styleIds: [...STYLE_IDS], explore: true },
  ];
}

function written() {
  const rainReady: WardrobeItem[] = seedWardrobe.map((item) => ({
    ...item,
    rainReady: true,
    styleIds: ['street', 'relaxed'],
  }));
  const worn = seedWardrobe.map((item) => ({ ...item, lastWornAt: NOW }));
  const reasons = new Set<string>();
  const warnings = new Set<string>();
  for (const wardrobe of [seedWardrobe, rainReady, worn])
    for (const context of contexts())
      for (const outfit of generateRecommendations(wardrobe, context, {
        limit: 10,
      }).outfits) {
        outfit.reasons.forEach((reason) => reasons.add(reason));
        outfit.warnings.forEach((warning) => warnings.add(warning));
      }
  return { reasons, warnings };
}

test('every reason and warning the recommender writes is a code each language words', () => {
  const { reasons, warnings } = written();
  assert.ok(reasons.size >= 6, `only ${reasons.size} distinct reasons`);
  assert.ok(warnings.size >= 3, `only ${warnings.size} distinct warnings`);
  for (const code of reasons) {
    assert.ok(parseReason(code), `"${code}" is not a reason code`);
    for (const [language, t] of Object.entries(CATALOGS)) {
      const said = reasonText(t, code);
      assert.notEqual(said, code, `${language} has no voice for "${code}"`);
      assert.match(said, /\.$/);
    }
  }
  for (const code of warnings) {
    assert.ok(parseWarning(code), `"${code}" is not a warning code`);
    for (const t of Object.values(CATALOGS))
      assert.notEqual(warningText(t, code), code);
  }
});

test('outfits saved before the codes keep their reasons, now in the active language', () => {
  assert.equal(
    reasonText(es, 'Estilo: urbano, relajado'),
    'Hoy vamos en plan urbano y relajado.',
  );
  assert.equal(
    reasonText(en, 'Estilo: urbano, relajado'),
    'Today we’re going street and relaxed.',
  );
  assert.deepEqual(parseReason('Ocasión: evento formal'), {
    kind: 'occasion',
    occasion: 'formal',
  });
  assert.equal(
    reasonText(es, 'Sin uso registrado en 3 días'),
    'Llevamos 3 días sin uso registrado.',
  );
  assert.equal(
    reasonText(es, 'Abrigo estimado para 22 °C'),
    'Calculamos el abrigo para 22 °C.',
  );
  assert.equal(
    warningText(en, 'Revisa el abrigo para 8 °C'),
    'Check the warmth for 8 °C',
  );
  assert.equal(reasonText(en, 'Motivo nuevo'), 'Motivo nuevo');
  assert.equal(parseReason('occasion:unknown'), undefined);
  assert.equal(parseReason('one-color:extra'), undefined);
});

/** Arrays must keep their length and functions their parameters, which the type does not check. */
function shape(value: unknown): unknown {
  if (typeof value === 'function') return `fn/${value.length}`;
  if (Array.isArray(value)) return `array/${value.length}`;
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape((value as Record<string, unknown>)[key])]),
    );
  return typeof value;
}

test('the English catalog has exactly the shape of the Spanish one', () => {
  assert.deepEqual(shape(en), shape(es));
  for (const id of Object.keys(es.demoNames))
    assert.ok(
      seedWardrobe.some((item) => item.id === id),
      `${id} is not an example garment`,
    );
  assert.equal(Object.keys(es.demoNames).length, seedWardrobe.length);
});

test('problems are worded for every kind in both languages', () => {
  for (const t of Object.values(CATALOGS)) {
    const problems: RecommendationProblem[] = [
      { kind: 'empty' },
      { kind: 'pinned-gone' },
      { kind: 'pinned-unavailable' },
      { kind: 'pinned-excluded' },
      { kind: 'pinned-missing', missing: ['shoes', 'bottom'] },
      { kind: 'missing', missing: ['shoes'], onePieceWouldDo: false },
      { kind: 'missing', missing: ['top', 'bottom'], onePieceWouldDo: true },
    ];
    for (const problem of problems)
      assert.match(t.problems.recommendation(problem), /\.$/);
    for (const problem of [
      'outfit-changed',
      'slot-missing',
      'no-option',
    ] as const)
      assert.match(t.problems.swap(problem, 'shoes'), /\.$/);
  }
  assert.match(
    en.problems.recommendation({
      kind: 'missing',
      missing: ['top'],
      onePieceWouldDo: true,
    }),
    /a top or a one-piece/,
  );
});
