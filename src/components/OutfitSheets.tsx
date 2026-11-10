import React from 'react';
import { Text } from 'react-native';
import {
  categoryLabels,
  swapOutfitItem,
  type Category,
  type Context,
  type Outfit,
  type WardrobeItem,
} from '../domain';
import type { LocalData } from '../storage/local';
import { Sheet, useSheetStageHeight } from './Sheet';
import { StickerAlbum } from './StickerAlbum';
import { OutfitDeck } from './today/OutfitDeck';
import { useUI } from './ui';

export interface SwapTarget {
  outfit: Outfit;
  category: Category;
}

/** Header, a bubble of three lines, the gap under the table, the actions and the padding. */
const AROUND_STAGE = 310;
/** The one-line note that a saved outfit ignores today's weather. */
const SAVED_NOTE = 36;

export function OutfitSheet({
  data,
  outfit,
  saved,
  saveError,
  onClose,
  onFavorite,
  onWorn,
  onItem,
}: {
  data: LocalData;
  outfit: Outfit;
  saved: boolean;
  saveError: string;
  onClose: () => void;
  onFavorite: () => void;
  onWorn: () => void;
  onItem: (item: WardrobeItem) => void;
}) {
  const { palette, s } = useUI();
  const compact = data.appearance.outfitLayout === 'compact';
  const stageHeight = useSheetStageHeight(
    AROUND_STAGE + (saved ? SAVED_NOTE : 0),
    compact,
  );
  return (
    <Sheet title="Tu outfit" onClose={onClose}>
      {saved ? (
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 14 }]}>
          Guardado tal como estaba; no considera el clima de hoy.
        </Text>
      ) : null}
      {saveError ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, marginBottom: 14 }}
        >
          {saveError}
        </Text>
      ) : null}
      <OutfitDeck
        outfits={[outfit]}
        compact={compact}
        showReasons={data.appearance.showReasons}
        stageHeight={stageHeight}
        isSaved={() => saved}
        onFavorite={onFavorite}
        onWorn={onWorn}
        onItem={(_, item) => onItem(item)}
      />
    </Sheet>
  );
}

/** Swaps only offer current, available garments without excluded colors. */
export function SwapSheet({
  data,
  swap,
  context,
  onClose,
  onResult,
}: {
  data: LocalData;
  swap: SwapTarget;
  context: Context;
  onClose: () => void;
  onResult: (change: ReturnType<typeof swapOutfitItem>) => void;
}) {
  const { s } = useUI();
  const current = swap.outfit.items.find(
    (item) => item.category === swap.category,
  );
  const options = data.items.filter(
    (item) =>
      item.category === swap.category &&
      !swap.outfit.items.some((worn) => worn.id === item.id) &&
      item.available &&
      !item.colors.some((color) =>
        data.preferences.excludedColors.includes(color),
      ),
  );
  return (
    <Sheet
      title={`Cambiar · ${categoryLabels[swap.category]}`}
      onClose={onClose}
    >
      {current && options.length ? (
        <Text style={s.subtitle}>En lugar de {current.name}.</Text>
      ) : null}
      {options.length ? (
        <StickerAlbum
          items={options}
          labelFor={(item) => `Cambiar por ${item.name}`}
          onPress={(item) =>
            onResult(
              swapOutfitItem(
                swap.outfit,
                swap.category,
                item.id,
                data.items,
                context,
              ),
            )
          }
        />
      ) : (
        // The rule about colors is said only when it may be why nothing is left to choose.
        <Text style={s.subtitle}>
          No hay otra disponible
          {data.preferences.excludedColors.length
            ? ' sin los colores que evitas'
            : ''}
          . Agrega una en Mi clóset.
        </Text>
      )}
    </Sheet>
  );
}
