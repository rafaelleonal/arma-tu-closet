import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';
import {
  generateRecommendations,
  isItemEligible,
  type Context,
  type Outfit,
} from '../domain';
import type { LocalData } from '../storage/local';
import { SwapSheet, type SwapTarget } from '../components/OutfitSheets';
import { Sheet, useSheetStageHeight } from '../components/Sheet';
import { OutfitDeck } from '../components/today/OutfitDeck';
import { Button, useUI } from '../components/ui';
import type { OutfitActions } from './actions';

/** Header, the line about the chosen garment, a bubble, the page dots, the actions and padding. */
const AROUND_STAGE = 390;

export function CombineGarmentSheet({
  data,
  context,
  itemId,
  actions,
  saveError,
  onClose,
  onAdd,
  onNotice,
}: {
  data: LocalData;
  context: Context;
  itemId: string;
  actions: OutfitActions;
  saveError: string;
  onClose: () => void;
  onAdd: () => void;
  onNotice: (message: string) => void;
}) {
  const { palette, s } = useUI();
  const [swap, setSwap] = useState<
    (SwapTarget & { proposalId: string }) | null
  >(null);
  const [adjusted, setAdjusted] = useState<Record<string, Outfit>>({});
  // The idea in view when a swap opened, to come back to it.
  const [page, setPage] = useState(0);
  const compact = data.appearance.outfitLayout === 'compact';
  const stageHeight = useSheetStageHeight(AROUND_STAGE, compact);
  const result = useMemo(
    () =>
      generateRecommendations(data.items, context, {
        pinnedItemId: itemId,
        limit: 2,
      }),
    [data.items, context, itemId],
  );
  const item = data.items.find((value) => value.id === itemId);
  const proposals = new Map<string, { proposalId: string; outfit: Outfit }>();
  for (const proposal of result.outfits) {
    const outfit = adjusted[proposal.id] ?? proposal;
    if (!proposals.has(outfit.id)) {
      proposals.set(outfit.id, { proposalId: proposal.id, outfit });
    }
  }
  const outfits = [...proposals.values()].map(({ outfit }) => outfit);

  if (swap) {
    return (
      <SwapSheet
        data={data}
        context={context}
        swap={swap}
        onClose={() => setSwap(null)}
        onResult={(change) => {
          if (change.status === 'swapped') {
            setAdjusted((current) => ({
              ...current,
              [swap.proposalId]: change.outfit,
            }));
            setSwap(null);
          } else {
            onNotice(change.message);
          }
        }}
      />
    );
  }

  return (
    <Sheet title="Combínala" onClose={onClose}>
      {saveError ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, marginBottom: 12 }}
        >
          {saveError}
        </Text>
      ) : null}
      {outfits.length ? (
        <>
          {item ? (
            <Text style={[s.subtitle, { marginBottom: 14 }]}>
              {item.name} se queda. Toca otra prenda para cambiarla.
            </Text>
          ) : null}
          <OutfitDeck
            key={outfits.map((outfit) => outfit.id).join('|')}
            outfits={outfits}
            compact={compact}
            showReasons={data.appearance.showReasons}
            stageHeight={stageHeight}
            pinnedItemId={itemId}
            initialIndex={Math.min(page, outfits.length - 1)}
            isSaved={actions.isSaved}
            onFavorite={actions.favorite}
            onWorn={actions.worn}
            onItem={(outfit, piece) => {
              const proposal = proposals.get(outfit.id);
              if (!proposal) return;
              setPage(outfits.indexOf(outfit));
              setSwap({
                outfit,
                category: piece.category,
                proposalId: proposal.proposalId,
              });
            }}
          />
        </>
      ) : (
        <>
          <Text style={s.subtitle}>{result.message}</Text>
          {item && isItemEligible(item, context) ? (
            <Button
              label="Agregar prenda"
              onPress={onAdd}
              style={{ marginTop: 16 }}
            />
          ) : null}
        </>
      )}
    </Sheet>
  );
}
