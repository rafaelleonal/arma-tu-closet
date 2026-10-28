import {
  CATEGORY_LABELS,
  OCCASION_LABELS,
  STYLE_IDS,
  STYLE_OPTIONS,
} from './types';
import type {
  Category,
  Outfit,
  OutfitSlot,
  RecommendationContext,
  RecommendationResult,
  SwapResult,
  WardrobeItem,
  WearResult,
} from './types';

const DAY_MS = 86_400_000;
const NEUTRALS = new Set(['negro', 'blanco', 'gris', 'beige', 'cafe']);

export function normalizeColor(color: string): string {
  return color
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalized(colors: string[]): Set<string> {
  return new Set(colors.map(normalizeColor).filter(Boolean));
}

export function isItemEligible(
  item: WardrobeItem,
  context: RecommendationContext,
): boolean {
  const excluded = normalized(context.excludedColors);
  return (
    item.available === true &&
    !item.colors.some((color) => excluded.has(normalizeColor(color)))
  );
}

function ageDays(item: WardrobeItem, now: string): number {
  if (!item.lastWornAt) return Infinity;
  const delta = Date.parse(now) - Date.parse(item.lastWornAt);
  return Number.isFinite(delta) ? Math.max(0, delta / DAY_MS) : Infinity;
}

function recent(item: WardrobeItem, context: RecommendationContext): boolean {
  return (
    context.rotationDays > 0 &&
    ageDays(item, context.now) < context.rotationDays
  );
}

function matchedStyles(
  item: WardrobeItem,
  context: RecommendationContext,
): string[] {
  const preferred = new Set(
    (context.styleIds ?? []).filter((style) => STYLE_IDS.includes(style)),
  );
  return (item.styleIds ?? []).filter(
    (style) => STYLE_IDS.includes(style) && preferred.has(style),
  );
}

function styleAffinity(
  items: WardrobeItem[],
  context: RecommendationContext,
): number {
  // Extra tags on one garment do not inflate its influence.
  return (
    items.filter((item) => matchedStyles(item, context).length > 0).length /
    Math.max(1, items.length)
  );
}

function temperature(context: RecommendationContext): number {
  return Number.isFinite(context.temperatureC) ? context.temperatureC : 22;
}

function targetWarmth(context: RecommendationContext): number {
  const temp = temperature(context);
  return temp < 12 ? 3.5 : temp < 18 ? 2.5 : temp < 25 ? 1.2 : 0.3;
}

function bodyWarmth(items: WardrobeItem[]): number {
  const base = items.filter((item) =>
    ['top', 'bottom', 'one-piece'].includes(item.category),
  );
  const baseWarmth =
    base.reduce((sum, item) => sum + item.warmth, 0) / Math.max(1, base.length);
  return (
    baseWarmth +
    items.reduce(
      (sum, item) =>
        sum +
        (item.category === 'layer'
          ? item.warmth * 0.8
          : item.category === 'accessory'
            ? item.warmth * 0.25
            : 0),
      0,
    )
  );
}

function itemPriority(
  item: WardrobeItem,
  context: RecommendationContext,
): number {
  const preferred = normalized(context.preferredColors);
  return (
    (item.occasions.includes(context.occasion) ? 12 : 0) +
    (item.colors.some((color) => preferred.has(normalizeColor(color)))
      ? 4
      : 0) +
    (context.raining && item.rainReady ? 5 : 0) +
    (matchedStyles(item, context).length ? 5 : 0) -
    (recent(item, context) ? 10 : 0) -
    Math.abs(item.warmth - Math.min(3, targetWarmth(context))) * 2
  );
}

function scoreItems(
  items: WardrobeItem[],
  context: RecommendationContext,
): number {
  const preferred = normalized(context.preferredColors);
  const occasionMatches = items.filter((item) =>
    item.occasions.includes(context.occasion),
  ).length;
  const colors = normalized(items.flatMap((item) => item.colors));
  const colorful = [...colors].filter((color) => !NEUTRALS.has(color)).length;
  const shoes = items.find((item) => item.category === 'shoes');
  const layer = items.find((item) => item.category === 'layer');
  const shoeTarget =
    temperature(context) < 12
      ? 2.5
      : temperature(context) < 18
        ? 2
        : temperature(context) < 25
          ? 1
          : 0.5;
  return (
    100 +
    (24 * occasionMatches) / Math.max(1, items.length) +
    styleAffinity(items, context) * 15 +
    Math.min(
      12,
      items.filter((item) =>
        item.colors.some((color) => preferred.has(normalizeColor(color))),
      ).length * 4,
    ) -
    Math.abs(bodyWarmth(items) - targetWarmth(context)) * 14 -
    (shoes ? Math.abs(shoes.warmth - shoeTarget) * 4 : 0) -
    items.filter((item) => recent(item, context)).length * 9 -
    Math.max(0, colorful - 2) * 3 -
    (context.raining && !shoes?.rainReady ? 12 : 0) -
    (context.raining && !layer?.rainReady ? 8 : 0) -
    (layer ? 0.5 : 0) -
    (items.some((item) => item.category === 'accessory') ? 0.5 : 0)
  );
}

function fingerprint(items: WardrobeItem[]): string {
  return items
    .map((item) => encodeURIComponent(item.id))
    .sort()
    .join('|');
}

function lexical(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareSets(
  a: WardrobeItem[],
  b: WardrobeItem[],
  context: RecommendationContext,
): number {
  return (
    scoreItems(b, context) - scoreItems(a, context) ||
    lexical(fingerprint(a), fingerprint(b))
  );
}

function rankSets(
  sets: WardrobeItem[][],
  context: RecommendationContext,
): WardrobeItem[][] {
  return sets
    .map((items) => ({
      items,
      score: scoreItems(items, context),
      key: fingerprint(items),
    }))
    .sort((a, b) => b.score - a.score || lexical(a.key, b.key))
    .map((candidate) => candidate.items);
}

function makeOutfit(
  items: WardrobeItem[],
  context: RecommendationContext,
): Outfit {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const preferred = normalized(context.preferredColors);
  const matchingOccasion = items.every((item) =>
    item.occasions.includes(context.occasion),
  );
  if (matchingOccasion)
    reasons.push(`Ocasión: ${OCCASION_LABELS[context.occasion].toLowerCase()}`);
  else warnings.push('Hay prendas sin etiqueta para esta ocasión');
  if (Math.abs(bodyWarmth(items) - targetWarmth(context)) <= 0.8)
    reasons.push(`Abrigo estimado para ${temperature(context)} °C`);
  else warnings.push(`Revisa el abrigo para ${temperature(context)} °C`);
  if (
    items.some((item) =>
      item.colors.some((color) => preferred.has(normalizeColor(color))),
    )
  )
    reasons.push('Color favorito');
  const styles = new Set(items.flatMap((item) => matchedStyles(item, context)));
  if (styles.size) {
    const labels = STYLE_OPTIONS.filter((style) => styles.has(style.id)).map(
      (style) => style.label.toLowerCase(),
    );
    reasons.unshift(`Estilo: ${labels.join(', ')}`);
  }
  if (!items.some((item) => recent(item, context))) {
    if (context.rotationDays > 0)
      reasons.push(`Sin uso registrado en ${context.rotationDays} días`);
  } else warnings.push('Incluye prendas usadas recientemente');
  if (context.raining) {
    if (!items.find((item) => item.category === 'shoes')?.rainReady)
      warnings.push('Calzado sin marcar para lluvia');
    if (!items.find((item) => item.category === 'layer')?.rainReady)
      warnings.push('Sin capa marcada para lluvia');
    if (
      items.find((item) => item.category === 'shoes')?.rainReady &&
      items.find((item) => item.category === 'layer')?.rainReady
    )
      reasons.push('Calzado y capa marcados para lluvia');
  }
  if (normalized(items.flatMap((item) => item.colors)).size === 1)
    reasons.push('Un solo color');
  return {
    id: fingerprint(items),
    items: [...items],
    score: Math.round(scoreItems(items, context) * 10) / 10,
    reasons,
    warnings,
  };
}

/** A complete base is top + bottom OR one-piece, always with shoes. Extras are optional. */
export function isValidOutfit(items: WardrobeItem[]): boolean {
  if (
    !items.length ||
    new Set(items.map((item) => item.id)).size !== items.length
  )
    return false;
  const counts = new Map<Category, number>();
  for (const item of items)
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  if (
    [...counts.values()].some((count) => count > 1) ||
    counts.get('shoes') !== 1
  )
    return false;
  return counts.get('one-piece') === 1
    ? !counts.has('top') && !counts.has('bottom')
    : counts.get('top') === 1 && counts.get('bottom') === 1;
}

/** Bounded candidate pools and beam ranking keep large local wardrobes responsive. */
export function generateRecommendations(
  wardrobe: WardrobeItem[],
  context: RecommendationContext,
  options: { limit?: number } = {},
): RecommendationResult {
  if (!wardrobe.length)
    return {
      status: 'empty',
      outfits: [],
      message: 'Agrega tus prendas para empezar a combinar.',
    };
  // Deduplicate IDs defensively after restoring local JSON or importing garments.
  const unique = [...new Map(wardrobe.map((item) => [item.id, item])).values()];
  const eligible = unique.filter((item) => isItemEligible(item, context));
  const pool = (category: Category, cap: number) =>
    eligible
      .filter((item) => item.category === category)
      .sort(
        (a, b) =>
          itemPriority(b, context) - itemPriority(a, context) ||
          lexical(a.id, b.id),
      )
      .slice(0, cap);
  const tops = pool('top', 24);
  const bottoms = pool('bottom', 24);
  const onePieces = pool('one-piece', 24);
  const shoes = pool('shoes', 16);
  if (
    !shoes.length ||
    (!onePieces.length && (!tops.length || !bottoms.length))
  ) {
    const missing = !shoes.length
      ? 'calzado'
      : !tops.length && !bottoms.length
        ? 'una parte de arriba y una de abajo, o una prenda completa'
        : !tops.length
          ? 'una parte de arriba o una prenda completa'
          : 'una parte de abajo o una prenda completa';
    return {
      status: 'insufficient',
      outfits: [],
      message: `Falta ${missing} disponible que respete tus colores excluidos. Agrega prendas o revisa disponibilidad y preferencias.`,
    };
  }
  const bases = rankSets(
    [
      ...tops.flatMap((top) => bottoms.map((bottom) => [top, bottom])),
      ...onePieces.map((item) => [item]),
    ],
    context,
  ).slice(0, 120);
  const dressed = rankSets(
    bases.flatMap((base) => shoes.map((shoe) => [...base, shoe])),
    context,
  ).slice(0, 96);
  const layers: (WardrobeItem | undefined)[] = [undefined, ...pool('layer', 4)];
  const accessories: (WardrobeItem | undefined)[] = [
    undefined,
    ...pool('accessory', 2),
  ];
  const candidates = rankSets(
    dressed.flatMap((base) =>
      layers.flatMap((layer) =>
        accessories.map((accessory) => [
          ...base,
          ...(layer ? [layer] : []),
          ...(accessory ? [accessory] : []),
        ]),
      ),
    ),
    context,
  ).map((items) => ({ items, score: scoreItems(items, context) }));
  const selected: WardrobeItem[][] = [];
  const requestedLimit = options.limit ?? 3;
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(10, Math.floor(requestedLimit)))
    : 3;
  // Penalize overlap only while choosing additional proposals; preserve the true score.
  while (candidates.length && selected.length < limit) {
    let bestIndex = 0;
    let bestAdjusted = -Infinity;
    candidates.forEach((candidate, index) => {
      const core = candidate.items.filter(
        (item) => item.category !== 'accessory' && item.category !== 'layer',
      );
      const ids = new Set(core.map((item) => item.id));
      const overlap = selected.length
        ? Math.max(
            ...selected.map((previous) => {
              const previousCore = previous.filter(
                (item) =>
                  item.category !== 'accessory' && item.category !== 'layer',
              );
              return (
                previousCore.filter((item) => ids.has(item.id)).length /
                Math.max(previousCore.length, core.length)
              );
            }),
          )
        : 0;
      const adjusted = candidate.score - overlap * 20;
      if (adjusted > bestAdjusted) {
        bestAdjusted = adjusted;
        bestIndex = index;
      }
    });
    selected.push(candidates.splice(bestIndex, 1)[0].items);
  }
  return {
    status: 'ready',
    outfits: selected.map((items) => makeOutfit(items, context)),
    message:
      selected.length === 1
        ? 'Una combinación con las prendas que tienes.'
        : `${selected.length} combinaciones con las prendas que tienes.`,
  };
}

function currentItems(
  outfit: Outfit,
  wardrobe: WardrobeItem[],
): WardrobeItem[] | undefined {
  const current = new Map(wardrobe.map((item) => [item.id, item]));
  const items = outfit.items.map((item) => current.get(item.id));
  return items.every(
    (item): item is WardrobeItem => !!item && item.available === true,
  ) && isValidOutfit(items)
    ? items
    : undefined;
}

/** Replaces one existing slot; a one-piece never gets mixed with top/bottom. */
export function swapOutfitItem(
  outfit: Outfit,
  slot: OutfitSlot,
  itemId: string | undefined,
  wardrobe: WardrobeItem[],
  context: RecommendationContext,
): SwapResult {
  const current = currentItems(outfit, wardrobe);
  const unavailable = (message: string): SwapResult => ({
    status: 'unavailable',
    outfit,
    message,
  });
  if (!current || !current.every((item) => isItemEligible(item, context)))
    return unavailable(
      'La combinación cambió o contiene prendas no disponibles. Genera opciones nuevas.',
    );
  const old = current.find((item) => item.category === slot);
  if (!old)
    return unavailable(
      'Esta combinación no tiene ese tipo de prenda para cambiar.',
    );
  const candidates = wardrobe
    .filter(
      (item) =>
        item.category === slot &&
        item.id !== old.id &&
        isItemEligible(item, context) &&
        (!itemId || item.id === itemId),
    )
    .map((item) =>
      current.map((existing) => (existing.id === old.id ? item : existing)),
    )
    .filter((items) => isValidOutfit(items))
    .sort((a, b) => compareSets(a, b, context));
  if (!candidates.length)
    return unavailable(
      `No hay otra opción disponible de ${CATEGORY_LABELS[slot].toLowerCase()} que respete tus preferencias.`,
    );
  return {
    status: 'swapped',
    outfit: makeOutfit(candidates[0], context),
    message: 'Prenda cambiada con una opción de tu guardarropa.',
  };
}

/** Only current, available garments from a complete outfit may receive a wear mark. */
export function recordOutfitWorn(
  wardrobe: WardrobeItem[],
  outfit: Outfit,
  now: string,
): WearResult {
  if (!Number.isFinite(Date.parse(now)) || !currentItems(outfit, wardrobe))
    return {
      status: 'unavailable',
      wardrobe,
      message:
        'No se pudo registrar: revisa la fecha y que las prendas sigan disponibles.',
    };
  const ids = new Set(outfit.items.map((item) => item.id));
  return {
    status: 'recorded',
    wardrobe: wardrobe.map((item) =>
      ids.has(item.id)
        ? { ...item, lastWornAt: now, wearCount: (item.wearCount ?? 0) + 1 }
        : item,
    ),
    message:
      'Uso registrado. Lo tendremos en cuenta para la próxima combinación.',
  };
}
