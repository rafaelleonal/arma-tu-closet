import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STYLE_IDS,
  createDefaultContext,
  generateRecommendations,
  isValidOutfit,
  recordOutfitWorn,
  seedWardrobe,
  swapOutfitItem,
} from '../src/domain';
import type { Category, RecommendationContext, WardrobeItem } from '../src/domain';

const NOW = '2026-10-23T16:00:00.000Z';
const context = (overrides: Partial<RecommendationContext> = {}): RecommendationContext => ({
  ...createDefaultContext(NOW),
  ...overrides,
});
function item(id: string, category: Category, overrides: Partial<WardrobeItem> = {}): WardrobeItem {
  return {
    id,
    name: id,
    category,
    colors: ['negro'],
    occasions: ['casual'],
    warmth: 1,
    rainReady: false,
    available: true,
    ...overrides,
  };
}
const minimal = () => [item('top', 'top'), item('bottom', 'bottom'), item('shoes', 'shoes')];

test('empty and incomplete wardrobes give actionable states and no invented garments', () => {
  assert.equal(generateRecommendations([], context()).status, 'empty');
  const incomplete = generateRecommendations([item('top', 'top')], context());
  assert.equal(incomplete.status, 'insufficient');
  assert.match(incomplete.message, /calzado/);
  assert.deepEqual(incomplete.outfits, []);
});

test('every recommendation uses unique, owned, available garments and a valid base', () => {
  const wardrobe = [...seedWardrobe, item('dirty', 'top', { available: false })];
  const ids = new Set(wardrobe.map((garment) => garment.id));
  const result = generateRecommendations(wardrobe, context(), { limit: 10 });
  assert.equal(result.status, 'ready');
  assert.equal(new Set(result.outfits.map((outfit) => outfit.id)).size, result.outfits.length);
  for (const outfit of result.outfits) {
    assert.ok(isValidOutfit(outfit.items));
    assert.ok(outfit.items.every((garment) => ids.has(garment.id) && garment.available));
    assert.ok(!outfit.items.some((garment) => garment.id === 'dirty'));
  }
});

test('excluded colors are hard constraints, including accents, case and multi-color garments', () => {
  const wardrobe = [...minimal(), item('brown-shirt', 'top', { colors: ['blanco', 'Café'] })];
  const result = generateRecommendations(
    wardrobe,
    context({ excludedColors: [' CAFE '], preferredColors: ['cafe'] }),
    { limit: 10 },
  );
  assert.ok(
    result.outfits.every((outfit) => !outfit.items.some((garment) => garment.id === 'brown-shirt')),
  );
  assert.equal(
    generateRecommendations(minimal(), context({ excludedColors: ['negro'] })).status,
    'insufficient',
  );
});

test('a mostly black wardrobe remains usable without requiring another color', () => {
  const result = generateRecommendations(minimal(), context({ preferredColors: ['rosa'] }));
  assert.equal(result.status, 'ready');
  assert.equal(result.outfits.length, 1);
  assert.ok(result.outfits[0].reasons.some((reason) => reason.includes('Un solo color')));
});

test('one-piece is an alternate complete base and never mixed with top or bottom', () => {
  const dress = item('dress', 'one-piece');
  const result = generateRecommendations([dress, item('shoes', 'shoes')], context());
  assert.equal(result.status, 'ready');
  assert.deepEqual(
    result.outfits[0].items.map((garment) => garment.id),
    ['dress', 'shoes'],
  );
  assert.equal(isValidOutfit([...minimal(), dress]), false);
  assert.equal(isValidOutfit([dress]), false);
});

test('recent wear is a flexible preference; scarcity can still repeat clothing', () => {
  const wardrobe = [...minimal(), item('fresh', 'top')].map((garment) =>
    garment.id === 'top' ? { ...garment, lastWornAt: '2026-10-22T16:00:00.000Z' } : garment,
  );
  assert.ok(
    generateRecommendations(wardrobe, context()).outfits[0].items.some(
      (garment) => garment.id === 'fresh',
    ),
  );
  const repeated = minimal().map((garment) => ({ ...garment, lastWornAt: NOW }));
  const result = generateRecommendations(repeated, context());
  assert.equal(result.status, 'ready');
  assert.ok(result.outfits[0].warnings.some((warning) => warning.includes('usadas recientemente')));
  assert.ok(
    !generateRecommendations(repeated, context({ rotationDays: 0 })).outfits[0].warnings.some(
      (warning) => warning.includes('usadas recientemente'),
    ),
  );
});

test('manual cold and rain context prefers available protection but warns when missing', () => {
  const weather = context({ temperatureC: 8, raining: true });
  const sparse = generateRecommendations(minimal(), weather);
  assert.equal(sparse.status, 'ready');
  assert.ok(sparse.outfits[0].warnings.some((warning) => warning.includes('abrigo')));
  assert.ok(sparse.outfits[0].warnings.some((warning) => warning.includes('lluvia')));
  const protectedWardrobe = [
    ...minimal(),
    item('boots', 'shoes', { rainReady: true, warmth: 2 }),
    item('coat', 'layer', { warmth: 3, rainReady: true }),
  ];
  const best = generateRecommendations(protectedWardrobe, weather).outfits[0];
  assert.ok(best.items.some((garment) => garment.id === 'coat'));
  assert.ok(best.items.some((garment) => garment.id === 'boots'));
});

test('warm weather does not force an outer layer', () => {
  const wardrobe = [
    ...minimal().map((garment) => ({ ...garment, warmth: 0 as const })),
    item('coat', 'layer', { warmth: 3 }),
  ];
  assert.ok(
    !generateRecommendations(wardrobe, context({ temperatureC: 31 })).outfits[0].items.some(
      (garment) => garment.category === 'layer',
    ),
  );
});

test('hot dry weather ranks lighter shoes ahead of otherwise identical warm boots', () => {
  const wardrobe = [
    ...minimal().filter((garment) => garment.category !== 'shoes'),
    item('boots', 'shoes', { warmth: 3 }),
    item('light-shoes', 'shoes', { warmth: 0 }),
  ];
  const best = generateRecommendations(wardrobe, context({ temperatureC: 35 })).outfits[0];
  assert.ok(best.items.some((garment) => garment.id === 'light-shoes'));
});

test('occasion and preferred color affect ranking without discarding the rest', () => {
  const wardrobe = [
    ...minimal(),
    item('work-shirt', 'top', { colors: ['azul'], occasions: ['work'] }),
  ];
  const result = generateRecommendations(
    wardrobe,
    context({ occasion: 'work', preferredColors: ['azul'] }),
  );
  assert.ok(result.outfits[0].items.some((garment) => garment.id === 'work-shirt'));
  assert.ok(result.outfits[0].reasons.some((reason) => reason.includes('Color favorito')));
  assert.equal(result.status, 'ready');
});

test('ranking is deterministic, independent of wardrobe input order, and does not mutate input', () => {
  const snapshot = JSON.stringify(seedWardrobe);
  const first = generateRecommendations(seedWardrobe, context(), { limit: 5 });
  assert.deepEqual(
    first,
    generateRecommendations([...seedWardrobe].reverse(), context(), { limit: 5 }),
  );
  assert.equal(JSON.stringify(seedWardrobe), snapshot);
});

test('additional options diversify garments when comparable alternatives exist', () => {
  const wardrobe = ['a', 'b'].flatMap((prefix) =>
    minimal().map((garment) => ({ ...garment, id: `${prefix}-${garment.id}` })),
  );
  const outfits = generateRecommendations(wardrobe, context(), { limit: 2 }).outfits;
  assert.equal(outfits.length, 2);
  const firstIds = new Set(outfits[0].items.map((garment) => garment.id));
  assert.ok(outfits[1].items.every((garment) => !firstIds.has(garment.id)));
});

test('swap replaces only the requested slot and respects exclusions and availability', () => {
  const wardrobe = [
    ...minimal(),
    item('other-top', 'top'),
    item('pink', 'top', { colors: ['rosa'] }),
    item('dirty', 'top', { available: false }),
  ];
  const original = generateRecommendations(minimal(), context()).outfits[0];
  const swapped = swapOutfitItem(
    original,
    'top',
    undefined,
    wardrobe,
    context({ excludedColors: ['rosa'] }),
  );
  assert.equal(swapped.status, 'swapped');
  assert.ok(isValidOutfit(swapped.outfit.items));
  assert.ok(swapped.outfit.items.some((garment) => garment.id === 'other-top'));
  assert.ok(swapped.outfit.items.some((garment) => garment.id === 'bottom'));
  assert.equal(
    swapOutfitItem(original, 'top', 'pink', wardrobe, context({ excludedColors: ['rosa'] })).status,
    'unavailable',
  );
  assert.equal(swapOutfitItem(original, 'top', 'dirty', wardrobe, context()).status, 'unavailable');
  assert.equal(
    swapOutfitItem(original, 'one-piece', undefined, wardrobe, context()).status,
    'unavailable',
  );
});

test('stale snapshots cannot be swapped or marked worn after deletion or availability changes', () => {
  const wardrobe = minimal();
  const outfit = generateRecommendations(wardrobe, context()).outfits[0];
  const removed = wardrobe.filter((garment) => garment.id !== 'shoes');
  const unavailable = wardrobe.map((garment) =>
    garment.id === 'shoes' ? { ...garment, available: false } : garment,
  );
  assert.equal(recordOutfitWorn(removed, outfit, NOW).status, 'unavailable');
  assert.equal(recordOutfitWorn(unavailable, outfit, NOW).status, 'unavailable');
  assert.equal(swapOutfitItem(outfit, 'top', undefined, removed, context()).status, 'unavailable');
});

test('wear recording updates only current outfit items immutably', () => {
  const wardrobe = [...minimal(), item('spare', 'top')];
  const outfit = generateRecommendations(minimal(), context()).outfits[0];
  const result = recordOutfitWorn(wardrobe, outfit, NOW);
  assert.equal(result.status, 'recorded');
  assert.equal(wardrobe[0].lastWornAt, undefined);
  assert.ok(
    result.wardrobe
      .filter((garment) => garment.id !== 'spare')
      .every((garment) => garment.lastWornAt === NOW && garment.wearCount === 1),
  );
  assert.equal(result.wardrobe.find((garment) => garment.id === 'spare')?.lastWornAt, undefined);
  assert.equal(recordOutfitWorn(wardrobe, outfit, 'invalid-date').status, 'unavailable');
});

test('bounded pools handle a large wardrobe and preserve outfit invariants', () => {
  const wardrobe = Array.from({ length: 120 }, (_, index) =>
    seedWardrobe.map((garment) => ({ ...garment, id: `${index}-${garment.id}` })),
  ).flat();
  const result = generateRecommendations(wardrobe, context(), { limit: 10 });
  assert.equal(result.outfits.length, 10);
  assert.ok(result.outfits.every((outfit) => isValidOutfit(outfit.items)));
});

test('explicit known style affinity changes ranking with accurate reasons', () => {
  const wardrobe = [...minimal(), item('style-top', 'top', { styleIds: ['minimal'] })];
  const best = generateRecommendations(wardrobe, context({ styleIds: ['minimal'] })).outfits[0];
  assert.ok(best.items.some((garment) => garment.id === 'style-top'));
  assert.ok(best.reasons.some((reason) => reason.includes('Estilo: minimal')));
  const noMatch = generateRecommendations(minimal(), context({ styleIds: ['minimal'] }));
  assert.equal(noMatch.status, 'ready');
  assert.ok(!noMatch.outfits[0].reasons.some((reason) => reason.startsWith('Estilo:')));
});

test('missing and unknown style labels remain neutral and do not imply an inferred style', () => {
  const wardrobe = minimal();
  const plain = generateRecommendations(wardrobe, context());
  const unknown = generateRecommendations(
    wardrobe.map((garment) => ({ ...garment, styleIds: ['future-style'] as any })),
    context({ styleIds: ['future-style'] as any }),
  );
  assert.equal(unknown.outfits[0].score, plain.outfits[0].score);
  assert.deepEqual(unknown.outfits[0].reasons, plain.outfits[0].reasons);
  assert.equal(unknown.status, 'ready');
});

test('style choices never override excluded colors, availability or valid base structure', () => {
  const wardrobe = [
    ...minimal(),
    item('excluded-styled', 'top', { colors: ['rojo'], styleIds: ['creative'] }),
    item('unavailable-styled', 'top', { styleIds: ['creative'], available: false }),
  ];
  const ctx = context({ styleIds: ['creative'], excludedColors: ['rojo'] });
  const result = generateRecommendations(wardrobe, ctx, { limit: 10 });
  assert.ok(
    result.outfits.every(
      (outfit) =>
        isValidOutfit(outfit.items) &&
        outfit.items.every((garment) => !garment.id.endsWith('-styled')),
    ),
  );
  assert.equal(
    swapOutfitItem(result.outfits[0], 'top', 'excluded-styled', wardrobe, ctx).status,
    'unavailable',
  );
  assert.equal(
    generateRecommendations([item('dress', 'one-piece', { styleIds: ['creative'] })], ctx).status,
    'insufficient',
  );
});

test('demo styles are explicit known labels and duplicate tags do not boost scores', () => {
  assert.ok(
    seedWardrobe.every(
      (garment) =>
        garment.styleIds?.length && garment.styleIds.every((style) => STYLE_IDS.includes(style)),
    ),
  );
  const wardrobe = minimal().map((garment) => ({
    ...garment,
    styleIds: ['minimal'] as const as any,
  }));
  const score = generateRecommendations(wardrobe, context({ styleIds: ['minimal'] })).outfits[0]
    .score;
  const duplicated = wardrobe.map((garment) => ({
    ...garment,
    styleIds: ['minimal', 'minimal'] as any,
  }));
  assert.equal(
    generateRecommendations(duplicated, context({ styleIds: ['minimal'] })).outfits[0].score,
    score,
  );
});
