import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultWarmth,
  itemFormErrors,
  itemFormFingerprint,
  suggestedItemName,
} from '../src/components/itemForm';
import { CATEGORIES, seedWardrobe } from '../src/domain';

test('save rejects empty required attributes and accepts corrected values', () => {
  const item = { ...seedWardrobe[0], name: '  ', colors: [], occasions: [] };
  assert.ok(Object.values(itemFormErrors(item)).every(Boolean));
  assert.ok(Object.values(itemFormErrors(seedWardrobe[0])).every((value) => !value));
});

test('discard protection catches photos and edits, while restored values are clean', () => {
  const initial = { ...seedWardrobe[0], colors: ['negro', 'blanco'] };
  const fingerprint = itemFormFingerprint(initial);
  assert.equal(
    itemFormFingerprint({ ...initial, colors: ['blanco', 'negro'], wearCount: 9 }),
    fingerprint,
  );
  for (const patch of [
    { name: 'Nueva' },
    { available: !initial.available },
    { photoUri: 'file:///photo.jpg' },
    { colors: ['azul'] },
  ]) {
    assert.notEqual(itemFormFingerprint({ ...initial, ...patch }), fingerprint);
  }
  assert.equal(itemFormFingerprint({ ...initial }), fingerprint);
});

test('an empty name becomes a valid name only once a color is chosen', () => {
  for (const category of CATEGORIES) {
    assert.equal(suggestedItemName(category, []), '');
    const name = suggestedItemName(category, ['negro', 'cafe', 'azul']);
    assert.ok(!itemFormErrors({ name, colors: ['negro'], occasions: ['casual'] }).name);
    assert.match(name, /café/);
    assert.doesNotMatch(name, /azul/);
  }
});

test('default warmth stays inside the stored range and layers start warmer than base pieces', () => {
  for (const category of CATEGORIES) assert.ok([0, 1, 2, 3].includes(defaultWarmth(category)));
  assert.ok(defaultWarmth('layer') > defaultWarmth('top'));
});
