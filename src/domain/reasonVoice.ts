import { OCCASIONS, OCCASION_LABELS, type Occasion } from './types';

const OCCASION_VOICE: Record<Occasion, string> = {
  casual: 'Vamos bien para tu día a día.',
  work: 'Vamos bien para el trabajo.',
  formal: 'Vamos bien para un evento formal.',
  sport: 'Vamos bien para moverte.',
  outing: 'Vamos bien para salir.',
};

function withY(list: string) {
  const parts = list.split(', ');
  return parts.length > 1
    ? `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`
    : list;
}

/** One entry per reason that `generateRecommendations` writes. */
const VOICES: readonly [RegExp, (value: string) => string][] = [
  [/^Estilo: (.+)$/, (styles) => `Hoy vamos en plan ${withY(styles)}.`],
  [/^Incluye prendas poco usadas$/, () => 'Traemos prendas que casi no usas.'],
  [
    /^Ocasión: (.+)$/,
    (label) => {
      const occasion = OCCASIONS.find(
        (id) => OCCASION_LABELS[id].toLowerCase() === label,
      );
      return occasion ? OCCASION_VOICE[occasion] : `Vamos bien para: ${label}.`;
    },
  ],
  [
    /^Abrigo estimado para (.+) °C$/,
    (degrees) => `Calculamos el abrigo para ${degrees} °C.`,
  ],
  [/^Color favorito$/, () => 'Llevamos un color que te gusta.'],
  [
    /^Sin uso registrado en (\d+) días$/,
    (days) => `Llevamos ${days} días sin uso registrado.`,
  ],
  [
    /^Calzado y capa marcados para lluvia$/,
    () => 'Calzado y capa van marcados para lluvia.',
  ],
  [/^Un solo color$/, () => 'Vamos en un solo color.'],
];

/**
 * Says a reason in the garments' voice. It rewords and never adds a claim; a reason it does
 * not know comes back as written.
 */
export function reasonInVoice(reason: string): string {
  for (const [pattern, say] of VOICES) {
    const match = reason.match(pattern);
    if (match) return say(match[1] ?? '');
  }
  return reason;
}
