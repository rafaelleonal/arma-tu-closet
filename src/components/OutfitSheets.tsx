import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  categoryLabels,
  swapOutfitItem,
  type Category,
  type Context,
  type Outfit,
  type WardrobeItem,
} from '../domain';
import type { LocalData } from '../storage/local';
import { Garment } from './Garment';
import { OutfitCard } from './OutfitCard';
import { Sheet } from './Sheet';
import { useUI } from './ui';

export interface SwapTarget {
  outfit: Outfit;
  category: Category;
}

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
  return (
    <Sheet title="Conjunto" onClose={onClose}>
      {saved ? (
        <Text style={[s.subtitle, { fontSize: 12, marginBottom: 14 }]}>
          Guardado con los detalles originales. Revisa disponibilidad y clima
          antes de usarlo.
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
      <OutfitCard
        compact={data.appearance.outfitLayout === 'compact'}
        showReasons={data.appearance.showReasons}
        outfit={outfit}
        primary
        saved={saved}
        onFavorite={onFavorite}
        onWorn={onWorn}
        onItem={onItem}
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
  const { palette, s } = useUI();
  const options = data.items.filter(
    (item) =>
      item.category === swap.category &&
      !swap.outfit.items.some((current) => current.id === item.id) &&
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
      <Text style={s.subtitle}>
        Prendas disponibles de esta categoría, sin los colores excluidos.
      </Text>
      {!options.length ? (
        <Text style={[s.subtitle, { marginTop: 20 }]}>
          No hay otra prenda disponible. Agrega una en Mi clóset.
        </Text>
      ) : null}
      <View style={[s.wrap, { marginTop: 20 }]}>
        {options.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Cambiar por ${item.name}`}
            onPress={() =>
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
            style={[
              styles.option,
              { backgroundColor: palette.white, borderColor: palette.line },
            ]}
          >
            <Garment item={item} size={110} />
            <Text style={{ color: palette.ink, fontSize: 12, marginTop: 10 }}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  option: { padding: 14, borderRadius: 14, borderWidth: 1, width: 145 },
});
