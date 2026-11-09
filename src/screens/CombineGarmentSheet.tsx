import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import {
  generateRecommendations,
  isItemEligible,
  type Context,
  type Outfit,
} from '../domain';
import type { LocalData } from '../storage/local';
import { OutfitCard } from '../components/OutfitCard';
import { SwapSheet, type SwapTarget } from '../components/OutfitSheets';
import { Sheet } from '../components/Sheet';
import { Button, useUI } from '../components/ui';
import type { OutfitActions } from './actions';

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
      {item ? (
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>{item.name}</Text>
      ) : null}
      {saveError ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, marginBottom: 12 }}
        >
          {saveError}
        </Text>
      ) : null}
      {proposals.size ? (
        <View style={{ gap: 14 }}>
          {[...proposals.values()].map(({ proposalId, outfit }) => (
            <OutfitCard
              key={proposalId}
              outfit={outfit}
              pinnedItemId={itemId}
              primary
              compact={data.appearance.outfitLayout === 'compact'}
              showReasons={data.appearance.showReasons}
              saved={actions.isSaved(outfit)}
              onFavorite={() => actions.favorite(outfit)}
              onWorn={() => actions.worn(outfit)}
              onItem={(piece) =>
                setSwap({
                  outfit,
                  category: piece.category,
                  proposalId,
                })
              }
            />
          ))}
        </View>
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
