import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OCCASIONS,
  STYLE_IDS,
  createDefaultContext,
  generateRecommendations,
  reasonInVoice,
  seedWardrobe,
} from '../src/domain';
import type { RecommendationContext, WardrobeItem } from '../src/domain';

const NOW = '2026-11-09T16:00:00.000Z';

/** Contexts that together make the recommender write each of its reasons. */
function contexts(): RecommendationContext[] {
  const base = createDefaultContext(NOW);
  return [
    ...OCCASIONS.map((occasion) => ({ ...base, occasion })),
    { ...base, raining: true, temperatureC: 8 },
    { ...base, preferredColors: ['azul', 'blanco'], rotationDays: 5 },
    { ...base, styleIds: [...STYLE_IDS], explore: true },
  ];
}

test('every reason the recommender writes has a voice of its own', () => {
  const rainReady: WardrobeItem[] = seedWardrobe.map((item) => ({
    ...item,
    rainReady: true,
    styleIds: ['street', 'relaxed'],
  }));
  const seen = new Set<string>();
  for (const wardrobe of [seedWardrobe, rainReady])
    for (const context of contexts())
      for (const outfit of generateRecommendations(wardrobe, context, {
        limit: 10,
      }).outfits)
        outfit.reasons.forEach((reason) => seen.add(reason));
  assert.ok(seen.size >= 6, `only ${seen.size} distinct reasons were produced`);
  for (const reason of seen) {
    const voiced = reasonInVoice(reason);
    assert.notEqual(voiced, reason, `no voice for "${reason}"`);
    assert.match(voiced, /\.$/);
  }
});

test('the voice keeps the facts of a reason and leaves unknown ones alone', () => {
  assert.equal(
    reasonInVoice('Estilo: urbano, relajado'),
    'Hoy vamos en plan urbano y relajado.',
  );
  assert.equal(
    reasonInVoice('Sin uso registrado en 3 días'),
    'Llevamos 3 días sin uso registrado.',
  );
  assert.equal(
    reasonInVoice('Abrigo estimado para 22 °C'),
    'Calculamos el abrigo para 22 °C.',
  );
  assert.equal(reasonInVoice('Motivo nuevo'), 'Motivo nuevo');
});
