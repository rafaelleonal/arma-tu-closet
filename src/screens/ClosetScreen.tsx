import React from 'react';
import { Text, View } from 'react-native';
import type { WardrobeItem } from '../domain';
import type { UpdateData } from '../hooks/useLocalData';
import { DemoBanner } from '../components/AppChrome';
import { ClosetGrid } from '../components/ClosetGrid';
import { ClosetRail } from '../components/ClosetRail';
import { Button, useUI } from '../components/ui';
import { withDemo, withoutDemo } from './actions';

export function ClosetScreen({
  items,
  update,
  onAdd,
  onEdit,
  onManual,
  onDemoReady,
}: {
  items: WardrobeItem[];
  update: UpdateData;
  onAdd: () => void;
  onEdit: (item: WardrobeItem) => void;
  onManual: () => void;
  onDemoReady: () => void;
}) {
  const { s } = useUI();
  const toggle = (item: WardrobeItem) =>
    update((current) => ({
      ...current,
      items: current.items.map((value) =>
        value.id === item.id
          ? { ...value, available: !value.available }
          : value,
      ),
    }));
  return (
    <>
      <View style={s.pageHeading}>
        <View>
          <Text accessibilityRole="header" style={s.title}>
            Mi clóset
          </Text>
          <Text style={[s.subtitle, { marginTop: 8 }]}>
            {items.length} prendas ·{' '}
            {items.filter((item) => item.available).length} disponibles
          </Text>
        </View>
        <Button label="+ Agregar prenda" onPress={onAdd} small />
      </View>
      {items.some((item) => item.isDemo) ? (
        <View style={{ marginBottom: 16 }}>
          <DemoBanner onStart={() => update(withoutDemo)} />
        </View>
      ) : null}
      {!items.length ? (
        <View style={[s.panel, { paddingVertical: 35 }]}>
          <Text style={s.sectionTitle}>Agrega tus prendas</Text>
          <Text style={[s.subtitle, { marginBottom: 24 }]}>
            Para un conjunto necesitas una parte de arriba, una de abajo y
            calzado; o una prenda completa y calzado.
          </Text>
          <Button label="Agregar prenda" onPress={onAdd} />
          <Button
            secondary
            label="Usar clóset de ejemplo"
            onPress={() => {
              // An existing closet is never replaced by the example.
              update((current) =>
                current.items.length ? current : withDemo(current),
              );
              onDemoReady();
            }}
            style={{ marginTop: 10 }}
          />
        </View>
      ) : // The rail needs cut-out photos, so it only presents the example closet; a person's own garments use the album grid.
      items.every((item) => item.isDemo) ? (
        <ClosetRail items={items} onEdit={onEdit} onToggle={toggle} />
      ) : (
        <ClosetGrid items={items} onEdit={onEdit} />
      )}
      <Button
        secondary
        label="Armar conjunto"
        onPress={onManual}
        style={{ marginTop: 24 }}
      />
    </>
  );
}
