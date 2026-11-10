import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getTheme,
  STICKER_INK,
  STICKER_PAPER,
  THEME_OPTIONS,
} from '../src/theme/palettes';

function luminance(hex: string): number {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((value) => parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(a: string, b: string): number {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

for (const { id } of THEME_OPTIONS) {
  test(`${id}: body, secondary, action and label text retain 4.5:1 contrast on app surfaces`, () => {
    const palette = getTheme(id);
    for (const foreground of ['ink', 'muted', 'rust', 'green'] as const) {
      for (const background of [
        'paper',
        'white',
        'wash',
        'sand',
        'art',
        'errorBg',
      ] as const) {
        assert.ok(
          contrast(palette[foreground], palette[background]) >= 4.5,
          `${id} ${foreground} on ${background}`,
        );
      }
    }
    assert.ok(
      contrast(palette.onInk, palette.ink) >= 4.5,
      `${id} button and selection text`,
    );
  });
}

test('what is written on sticker paper reads in every theme, since the paper never changes', () => {
  assert.ok(contrast(STICKER_INK, STICKER_PAPER) >= 4.5, 'sticker ink');
  for (const { id } of THEME_OPTIONS)
    assert.ok(
      contrast(getTheme(id).stickerMark, STICKER_PAPER) >= 4.5,
      `${id} sticker mark`,
    );
});
