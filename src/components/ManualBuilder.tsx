import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { type Category, type Outfit, type WardrobeItem, categoryLabels } from '../domain';
import { Garment } from './Garment';
import { Sheet } from './Sheet';
import { Button, Chip, FieldLabel, useUI } from './ui';

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
  const [shape, setShape] = useState<'separates' | 'one-piece'>('separates');
  const [selected, setSelected] = useState<Partial<Record<Category, string>>>({});
  const [error, setError] = useState('');
  const slots: Category[] =
    shape === 'separates'
      ? ['top', 'bottom', 'shoes', 'layer', 'accessory']
      : ['one-piece', 'shoes', 'layer', 'accessory'];
  return (
    <Sheet title="Armar conjunto" onClose={onClose}>
      <View style={[s.wrap, { marginTop: 20 }]}>
        <Chip
          label="Arriba + abajo"
          selected={shape === 'separates'}
          onPress={() => setShape('separates')}
        />
        <Chip
          label="Prenda completa"
          selected={shape === 'one-piece'}
          onPress={() => setShape('one-piece')}
        />
      </View>
      {slots.map((slot) => (
        <View key={slot}>
          <FieldLabel>
            {categoryLabels[slot]}
            {slot === 'layer' || slot === 'accessory' ? ' · opcional' : ''}
          </FieldLabel>
          <View style={s.wrap}>
            {items
              .filter((item) => item.available && item.category === slot)
              .map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  accessibilityState={{ selected: selected[slot] === item.id }}
                  aria-pressed={selected[slot] === item.id}
                  onPress={() =>
                    setSelected((current) => ({
                      ...current,
                      [slot]: current[slot] === item.id ? undefined : item.id,
                    }))
                  }
                  style={{
                    width: 105,
                    backgroundColor: selected[slot] === item.id ? palette.sand : palette.white,
                    borderRadius: 14,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: selected[slot] === item.id ? palette.rust : palette.line,
                  }}
                >
                  <Garment item={item} size={80} />
                  <Text style={{ fontSize: 12, color: palette.ink, marginTop: 7 }}>
                    {item.name}
                  </Text>
                </Pressable>
              ))}
          </View>
          {!items.some((item) => item.available && item.category === slot) ? (
            <Text style={s.subtitle}>Aún no hay prendas disponibles en esta categoría.</Text>
          ) : null}
        </View>
      ))}
      {error ? (
        <Text accessibilityRole="alert" style={{ color: palette.rust, marginTop: 18 }}>
          {error}
        </Text>
      ) : null}
      <Button
        label="Guardar conjunto"
        style={{ marginTop: 25 }}
        onPress={() => {
          const required: Category[] =
            shape === 'separates' ? ['top', 'bottom', 'shoes'] : ['one-piece', 'shoes'];
          if (required.some((slot) => !selected[slot])) {
            setError('Completa el conjunto y elige calzado para guardarlo.');
            return;
          }
          const chosen = slots.flatMap((slot) =>
            items.filter((item) => item.id === selected[slot] && item.available),
          );
          onSave({
            id: `manual-${Date.now()}`,
            items: chosen,
            score: 0,
            reasons: [],
            warnings: [],
          });
        }}
      />
    </Sheet>
  );
}
