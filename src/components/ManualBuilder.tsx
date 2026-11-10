import React, { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import {
  categoryLabels,
  type Category,
  type Outfit,
  type WardrobeItem,
} from '../domain';
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
function missingPhrase(categories: Category[]) {
  const names = categories.map((category) =>
    categoryLabels[category].toLowerCase(),
  );
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
    : names[0];
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
      title="Armar outfit"
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
            label="Guardar outfit"
            onPress={() => {
              if (missing.length) {
                setError(`Falta elegir ${missingPhrase(missing)}.`);
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
          label="Arriba + abajo"
          selected={shape === 'separates'}
          onPress={() => choose('separates')}
        />
        <Chip
          label="Prenda completa"
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
