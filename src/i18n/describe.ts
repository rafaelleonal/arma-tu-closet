import { parseReason, parseWarning } from '../domain/reasons';
import type { Copy } from './es';

/** A reason in the garments' voice. Text it does not recognize comes back as written. */
export function reasonText(t: Copy, code: string): string {
  const reason = parseReason(code);
  if (!reason) return code;
  const voice = t.reasons;
  switch (reason.kind) {
    case 'style':
      return voice.style(
        t.list(reason.styleIds.map((id) => t.styles[id].label.toLowerCase())),
      );
    case 'occasion':
      return voice.occasion[reason.occasion];
    case 'warmth':
      return voice.warmth(reason.temperatureC);
    case 'rotation':
      return voice.rotation(reason.days);
    case 'lightly-used':
      return voice.lightlyUsed;
    case 'favorite-color':
      return voice.favoriteColor;
    case 'rain-ready':
      return voice.rainReady;
    case 'one-color':
      return voice.oneColor;
  }
}

/** Warnings are said plainly, without the garments' voice. */
export function warningText(t: Copy, code: string): string {
  const warning = parseWarning(code);
  if (!warning) return code;
  const say = t.warnings;
  switch (warning.kind) {
    case 'warmth':
      return say.warmth(warning.temperatureC);
    case 'occasion-untagged':
      return say.occasionUntagged;
    case 'worn-recently':
      return say.wornRecently;
    case 'shoes-not-rain-ready':
      return say.shoesNotRainReady;
    case 'no-rain-layer':
      return say.noRainLayer;
  }
}

/** A stored color id in the active language; a color typed by the person stays as written. */
export function colorName(t: Copy, color: string): string {
  return (t.colors as Record<string, string>)[color] ?? color;
}
