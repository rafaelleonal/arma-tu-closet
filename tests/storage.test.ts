import assert from 'node:assert/strict';
import test from 'node:test';
import { generateRecommendations, seedWardrobe, createDefaultContext } from '../src/domain';
import { MAX_WEB_PAYLOAD_CHARS, createLocalData, createDefaultAppearance, createDefaultProfile, isLocalData, parseLocalData, serializeLocalData, type LocalData, type LegacyLocalData, type LegacyLocalDataV2 } from '../src/storage/schema';
import type { WeatherLocation } from '../src/weather/types';

const fixture = (): LocalData => ({
  ...createLocalData(), onboarded: true, items: structuredClone(seedWardrobe),
  preferences: { preferredColors: ['negro'], excludedColors: [], rotationDays: 3 },
  context: { city: '', season: 'Otoño', temperatureC: 22, raining: false, occasion: 'casual' },
  savedOutfits: [], dislikedOutfitIds: [], wearHistory: [],
});

test('local round trip retains wardrobe, saved outfits, photos, preferences and history', () => {
  const data = fixture();
  const outfit = generateRecommendations(data.items, createDefaultContext('2026-10-23T18:00:00Z')).outfits[0];
  data.items[0].photoUri = 'file:///documents/wardrobe/photo.jpg';
  data.savedOutfits = [outfit];
  data.wearHistory = [{ id: outfit.id, itemIds: outfit.items.map(item => item.id), date: '2026-10-23T18:00:00Z' }];
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
});

test('empty own wardrobe is valid and never replaced with demonstration garments', () => {
  const data = fixture(); data.items = [];
  assert.deepEqual(parseLocalData(serializeLocalData(data)).items, []);
});

test('malformed nested data is rejected before the UI can hydrate it', () => {
  const badCases: Array<(data: any) => void> = [
    data => { data.version = 4; }, data => { data.preferences = null; },
    data => { data.preferences.excludedColors = 'negro'; },
    data => { data.context.temperatureC = '22'; }, data => { data.context.occasion = 'unknown'; },
    data => { data.items[0].category = 'unknown'; }, data => { data.items[0].occasions = null; },
    data => { data.items.push(data.items[0]); }, data => { data.dislikedOutfitIds = null; },
    data => { data.wearHistory = [{ id: 'outfit', itemIds: ['a'], date: 'invalid' }]; },
    data => { data.savedOutfits = [{ id: 'broken' }]; },
    data => { data.profile = null; }, data => { data.profile.name = 123; },
    data => { data.profile.styleIds = ['unknown']; }, data => { data.profile.styleIds = ['minimal', 'minimal']; },
    data => { data.items[0].styleIds = ['unknown']; }, data => { data.items[0].styleIds = 'minimal'; },
    data => { data.appearance = null; }, data => { data.appearance.themeId = 'unknown'; },
    data => { data.appearance.outfitLayout = 'grid'; }, data => { data.appearance.showReasons = 'yes'; },
    data => { data.onboarding = { step: 4 }; }, data => { data.onboarding = { step: 0.5 }; },
    data => { delete data.weather; }, data => { data.weather = null; },
    data => { data.weather.mode = 'live'; },
    data => { data.weather.location = { id: 1 }; },
  ];
  for (const mutate of badCases) {
    const data = fixture(); mutate(data);
    assert.throws(() => parseLocalData(JSON.stringify(data)), /no es compatible/);
  }
  assert.throws(() => parseLocalData('{invalid'));
});

test('v1 migration preserves every original field and completed users stay onboarded', () => {
  const current = fixture();
  current.items = current.items.map(({ styleIds, ...garment }) => garment);
  current.items[0].photoUri = 'file:///documents/wardrobe/existing-photo.jpg';
  current.items[1].available = false;
  current.items[2].lastWornAt = '2026-10-22T18:00:00Z';
  current.preferences = { preferredColors: ['azul'], excludedColors: ['rosa'], rotationDays: 14 };
  current.context = { city: 'Comitán', season: 'Invierno', temperatureC: 11, raining: true, occasion: 'work' };
  const outfit = generateRecommendations(current.items, createDefaultContext('2026-10-23T18:00:00Z')).outfits[0];
  current.savedOutfits = [outfit];
  current.dislikedOutfitIds = ['old-outfit'];
  current.wearHistory = [{ id: 'history-1', itemIds: outfit.items.map(garment => garment.id), date: '2026-10-22T18:00:00Z' }];
  const { profile, appearance, onboarding, weather, ...oldFields } = current;
  const legacy: LegacyLocalData = { ...oldFields, version: 1 };
  const raw = JSON.stringify(legacy);
  const migrated = parseLocalData(raw);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.onboarded, true);
  assert.equal(migrated.onboarding, undefined);
  const { profile: newProfile, appearance: newAppearance, weather: newWeather, ...retained } = migrated;
  assert.deepEqual(retained, { ...legacy, version: 3 });
  assert.deepEqual(newWeather, { mode: 'manual' });
  assert.deepEqual(newProfile, createDefaultProfile());
  assert.deepEqual(newAppearance, createDefaultAppearance());
  assert.equal(JSON.stringify(legacy), raw);
  assert.deepEqual(parseLocalData(serializeLocalData(migrated)), migrated);
});

test('v1 empty closet and unfinished completion flag survive migration without demo insertion', () => {
  const { profile, appearance, onboarding, weather, ...oldFields } = fixture();
  const migrated = parseLocalData(JSON.stringify({ ...oldFields, version: 1, onboarded: false, items: [] }));
  assert.equal(migrated.onboarded, false);
  assert.deepEqual(migrated.items, []);
  assert.equal(migrated.onboarding, undefined);
});

test('unknown versions and invalid v1 payloads reject instead of yielding fresh data', () => {
  const data = fixture();
  for (const version of [0, 4, '3', null]) assert.throws(() => parseLocalData(JSON.stringify({ ...data, version })), /no es compatible/);
  assert.throws(() => parseLocalData(JSON.stringify({ ...data, version: 1, items: null })), /no es compatible/);
});

test('v3 stores partial onboarding, styles and appearance through a semantic round trip', () => {
  const data = fixture();
  data.profile = { name: 'Rafael', styleIds: ['minimal', 'street'] };
  data.appearance = { themeId: 'midnight', outfitLayout: 'compact', showReasons: false };
  data.onboarded = false;
  data.onboarding = { step: 2 };
  assert.ok(isLocalData(data));
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
  delete data.onboarding;
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
});

test('a cutout is optional, keeps its original photo and is rejected without one', () => {
  const data = fixture();
  data.items[0] = { ...data.items[0], photoUri: 'file:///wardrobe/a.jpg', cutoutUri: 'file:///wardrobe/cutout-a.png' };
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
  const orphan = fixture();
  orphan.items[0] = { ...orphan.items[0], cutoutUri: 'file:///wardrobe/cutout-a.png' };
  assert.equal(isLocalData(orphan), false);
  const blank = fixture();
  blank.items[0] = { ...blank.items[0], photoUri: 'file:///wardrobe/a.jpg', cutoutUri: ' ' };
  assert.equal(isLocalData(blank), false);
});

test('styles and themes added after v3 stay valid in the same document version', () => {
  const data = fixture();
  data.profile = { name: '', styleIds: ['girly', 'feminine', 'minimal'] };
  data.items[0] = { ...data.items[0], styleIds: ['feminine'] };
  data.appearance = { ...data.appearance, themeId: 'bubblegum' };
  assert.equal(data.version, 3);
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
});

test('v2 migrates to manual weather preserving profile, appearance, progress and all existing fields', () => {
  const current = fixture();
  current.profile = { name: 'Rafael', styleIds: ['minimal', 'creative'] };
  current.appearance = { themeId: 'midnight', outfitLayout: 'compact', showReasons: false };
  current.onboarding = { step: 3 };
  current.context = { occasion: 'work', city: 'Comitán', season: 'Invierno', temperatureC: 13, raining: true };
  current.items[0].photoUri = 'file:///documents/existing.jpg';
  current.items[0].lastWornAt = '2026-10-22T18:00:00Z';
  current.items[1].available = false;
  current.preferences = { preferredColors: ['azul'], excludedColors: ['rosa'], rotationDays: 7 };
  const outfit = generateRecommendations(current.items, createDefaultContext('2026-10-23T18:00:00Z')).outfits[0];
  current.savedOutfits = [outfit];
  current.dislikedOutfitIds = ['old-outfit'];
  current.wearHistory = [{ id: 'history', itemIds: outfit.items.map(item => item.id), date: '2026-10-22T18:00:00Z' }];
  const { weather, ...existing } = current;
  const legacy: LegacyLocalDataV2 = { ...existing, version: 2 };
  const raw = JSON.stringify(legacy);
  const migrated = parseLocalData(raw);
  assert.deepEqual(migrated, { ...legacy, version: 3, weather: { mode: 'manual' } });
  assert.equal(JSON.stringify(legacy), raw);
  assert.deepEqual(parseLocalData(serializeLocalData(migrated)), migrated);
  assert.deepEqual(parseLocalData(JSON.stringify({ ...legacy, items: [] })).items, []);
  assert.throws(() => parseLocalData(JSON.stringify({ ...legacy, profile: null })), /no es compatible/);
});

test('v3 weather roundtrip preserves manual controls and validates snapshot location and timestamps', () => {
  const data = fixture();
  const location: WeatherLocation = { id: 3530367, name: 'Comitán', country: 'México', admin1: 'Chiapas', latitude: 16.25, longitude: -92.13, timezone: 'America/Mexico_City' };
  data.weather = { mode: 'automatic', location, snapshot: { locationId: location.id, temperatureC: 17, apparentTemperatureC: 15, raining: true, weatherCode: 61, observedAt: '2026-10-23T18:00:00Z', fetchedAt: '2026-10-23T18:05:00Z' } };
  const manual = structuredClone(data.context);
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
  assert.deepEqual(data.context, manual);
  for (const mutate of [
    (bad: any) => { bad.weather.snapshot.locationId += 1; },
    (bad: any) => { delete bad.weather.location; },
    (bad: any) => { bad.weather.location.latitude = 91; },
    (bad: any) => { bad.weather.snapshot.temperatureC = '17'; },
    (bad: any) => { bad.weather.snapshot.weatherCode = 777; },
    (bad: any) => { bad.weather.snapshot.observedAt = '2026-10-23T18:00:00'; },
    (bad: any) => { bad.weather.snapshot.observedAt = '2026-10-24T18:00:00Z'; },
  ]) {
    const bad = structuredClone(data); mutate(bad);
    assert.throws(() => parseLocalData(JSON.stringify(bad)), /no es compatible/);
  }
});

test('fresh factories return independent empty user data and valid defaults', () => {
  const a = createLocalData(); const b = createLocalData();
  a.profile.styleIds.push('minimal');
  a.appearance.themeId = 'sage';
  a.items.push(seedWardrobe[0]);
  assert.deepEqual(b.profile, { name: '', styleIds: [] });
  assert.equal(b.appearance.themeId, 'linen');
  assert.deepEqual(b.items, []);
  assert.deepEqual(b.onboarding, { step: 0 });
  assert.equal(b.onboarded, false);
  assert.deepEqual(b.weather, { mode: 'manual' });
  assert.ok(isLocalData(b));
});

test('web photo budget checks aggregate data before writing and leaves input untouched', () => {
  const data = fixture();
  const photo = `data:image/jpeg;base64,${'a'.repeat(MAX_WEB_PAYLOAD_CHARS / 2)}`;
  data.items[0].photoUri = photo;
  data.items[1].photoUri = photo;
  assert.throws(() => serializeLocalData(data, true), /límite de fotos/);
  assert.equal(data.items[0].photoUri, photo);
  // Native uses filesystem URIs rather than embedding photo bytes in JSON.
  data.items[0].photoUri = 'file:///documents/a.jpg';
  data.items[1].photoUri = 'file:///documents/b.jpg';
  assert.doesNotThrow(() => serializeLocalData(data, true));
});

test('v3 without haptics stays readable and an explicit opt-out survives a round trip', () => {
  const data = fixture();
  const original = JSON.stringify(data);
  assert.deepEqual(parseLocalData(original), data);
  data.appearance.hapticsEnabled = false;
  assert.deepEqual(parseLocalData(serializeLocalData(data)), data);
  const malformed = { ...data, appearance: { ...data.appearance, hapticsEnabled: 'false' } };
  assert.throws(() => parseLocalData(JSON.stringify(malformed)), /no es compatible/);
});
