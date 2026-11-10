import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WardrobeItem } from '../domain';
import type { UpdateData } from '../hooks/useLocalData';
import { DemoBanner } from '../components/AppChrome';
import { Bubble } from '../components/Bubble';
import { ClosetGrid } from '../components/ClosetGrid';
import { ClosetRail } from '../components/ClosetRail';
import { Dots } from '../components/rail';
import { DrawingSticker } from '../components/Sticker';
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
  const { palette, s } = useUI();
  const available = items.filter((item) => item.available).length;
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
      <Text style={{ color: palette.muted, fontSize: 12 }}>
        {items.length} {items.length === 1 ? 'prenda' : 'prendas'} · {available}{' '}
        {available === 1 ? 'disponible' : 'disponibles'}
      </Text>
      <View style={[s.pageHeading, { columnGap: 12, rowGap: 8 }]}>
        <Text accessibilityRole="header" style={s.title}>
          Mi clóset
        </Text>
        <Button
          label="+ Agregar prenda"
          onPress={onAdd}
          small
          style={{ borderRadius: 22 }}
        />
      </View>
      {items.some((item) => item.isDemo) ? (
        <View style={{ marginBottom: 16 }}>
          <DemoBanner onStart={() => update(withoutDemo)} />
        </View>
      ) : null}
      {!items.length ? (
        <EmptyCloset
          onAdd={onAdd}
          onDemo={() => {
            // An existing closet is never replaced by the example.
            update((current) =>
              current.items.length ? current : withDemo(current),
            );
            onDemoReady();
          }}
        />
      ) : // The rail needs cut-out photos, so it only presents the example closet; a person's own garments use the sticker album.
      items.every((item) => item.isDemo) ? (
        <ClosetRail items={items} onEdit={onEdit} onToggle={toggle} />
      ) : (
        <ClosetGrid items={items} onEdit={onEdit} />
      )}
      <Button
        secondary
        label="Armar outfit"
        onPress={onManual}
        style={{ marginTop: 24 }}
      />
    </>
  );
}

/** An empty closet says what an outfit needs and shows the three places still to fill. */
function EmptyCloset({
  onAdd,
  onDemo,
}: {
  onAdd: () => void;
  onDemo: () => void;
}) {
  return (
    <>
      <View style={styles.board}>
        <Dots />
        <Bubble>
          Para un outfit necesitas una parte de arriba, una de abajo y calzado;
          o una prenda completa y calzado.
        </Bubble>
        <View style={styles.blanks}>
          <DrawingSticker
            kind="tee"
            maxWidth={104}
            maxHeight={104}
            style={{ transform: [{ rotate: '-4deg' }] }}
          />
          <DrawingSticker
            kind="trousers"
            maxWidth={104}
            maxHeight={120}
            style={{ transform: [{ rotate: '3deg' }] }}
          />
          <DrawingSticker
            kind="sneakers"
            maxWidth={104}
            maxHeight={104}
            style={{ transform: [{ rotate: '-5deg' }] }}
          />
        </View>
      </View>
      <Button label="Agregar prenda" onPress={onAdd} />
      <Button
        secondary
        label="Ver el clóset de ejemplo"
        onPress={onDemo}
        style={{ marginTop: 10 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  board: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 22,
    marginBottom: 18,
    gap: 22,
  },
  blanks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
