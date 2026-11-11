import React, { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import type { Category, Outfit, WardrobeItem } from '../domain';
import { useCopy, type Copy } from '../i18n';
import { BuilderStage, type Chosen } from './builder/BuilderStage';
import { SlotShelf } from './builder/SlotShelf';
import { Sheet } from './Sheet';
import { Button, Chip, useUI } from './ui';

type Shape = 'separates' | 'one-piece';

const REQUIRED: Record<Shape, Category[]> = {
  separates: ['top', 'bottom', 'shoes'],
  'one-piece': ['one-piece', 'shoes'],
};
const OPTIONAL: Category[] = ['layer', 'accessory'];

/** "Parte de abajo y calzado": the categories still missing, as one phrase. */
function missingPhrase(t: Copy, categories: Category[]) {
  return t.list(
    categories.map((category) => t.categories[category].toLowerCase()),
  );
}

/** Any available garment can be chosen here: the person decides, so excluded colors still show. */
export function ManualBuilder({
  items,
  onSave,
  onClose,
}: {
  items: WardrobeItem[];
  onSave: (outfit: Outfit) => void;
  onClose: () => void;
}) {
  const { palette, s } = useUI();
  const t = useCopy();
  const window = useWindowDimensions();
  const [shape, setShape] = useState<Shape>('separates');
  const [selected, setSelected] = useState<Partial<Record<Category, string>>>(
    {},
  );
  const [error, setError] = useState('');
  const required = REQUIRED[shape];
  const slots = [...required, ...OPTIONAL];
  const available = items.filter((item) => item.available);
  const chosen: Chosen = {};
  for (const slot of slots) {
    const item = available.find((value) => value.id === selected[slot]);
    if (item && item.category === slot) chosen[slot] = item;
  }
  const missing = required.filter((slot) => !chosen[slot]);

  function choose(next: Shape) {
    setShape(next);
    setError('');
  }
  return (
    <Sheet
      title={t.closet.build}
      onClose={onClose}
      pinned={
        <BuilderStage
          required={required}
          chosen={chosen}
          height={Math.max(150, Math.min(210, window.height * 0.25))}
        />
      }
      footer={
        <>
          {error ? (
            <Text
              accessibilityRole="alert"
              style={{ color: palette.rust, fontSize: 13, marginBottom: 10 }}
            >
              {error}
            </Text>
          ) : null}
          <Button
            label={t.outfit.save}
            onPress={() => {
              if (missing.length) {
                setError(t.builder.missing(missingPhrase(t, missing)));
                return;
              }
              onSave({
                id: `manual-${Date.now()}`,
                items: slots.flatMap((slot) => chosen[slot] ?? []),
                score: 0,
                reasons: [],
                warnings: [],
              });
            }}
          />
        </>
      }
    >
      <View style={[s.wrap, { marginTop: 14 }]}>
        <Chip
          label={t.builder.separates}
          selected={shape === 'separates'}
          onPress={() => choose('separates')}
        />
        <Chip
          label={t.categories['one-piece']}
          selected={shape === 'one-piece'}
          onPress={() => choose('one-piece')}
        />
      </View>
      {slots.map((slot) => (
        <SlotShelf
          key={slot}
          category={slot}
          optional={OPTIONAL.includes(slot)}
          items={available.filter((item) => item.category === slot)}
          selectedId={chosen[slot]?.id}
          onToggle={(item) => {
            setError('');
            setSelected((current) => ({
              ...current,
              [slot]: current[slot] === item.id ? undefined : item.id,
            }));
          }}
        />
      ))}
    </Sheet>
  );
}
