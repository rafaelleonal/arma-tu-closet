import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { categoryLabels, colorLabels, type WardrobeItem } from '../domain';
import { useFeedback } from './Feedback';
import { FRONT_GAP, HangingGarment, SIDE_WIDTH } from './HangingGarment';
import {
  GarmentImage,
  HANGING,
  LENGTH,
  RailWall,
  Rod,
  ROD_TOP,
  garmentWidth,
  railStyles,
} from './rail';
import { Button, useUI } from './ui';

/** Each garment's width and place on the rod, so choosing one moves the rest without a new layout. */
function placeOnRod(hanging: WardrobeItem[], selectedIndex: number) {
  const places: {
    width: number;
    x: number;
    room: { left: number; width: number };
  }[] = [];
  let rodWidth = 0;
  hanging.forEach((item, index) => {
    const width = garmentWidth(item, LENGTH[item.category]);
    const room = index === selectedIndex ? width + FRONT_GAP : SIDE_WIDTH;
    places.push({
      width,
      x: rodWidth + (room - width) / 2,
      room: { left: rodWidth, width: room },
    });
    rodWidth += room;
  });
  return { places, rodWidth };
}

interface Props {
  items: WardrobeItem[];
  onEdit: (item: WardrobeItem) => void;
  onToggle: (item: WardrobeItem) => void;
}

/** Closet as a rail: garments hang edge-on and the selected one turns to face the viewer. */
export function ClosetRail({ items, onEdit, onToggle }: Props) {
  const { palette, s } = useUI();
  const { selection } = useFeedback();
  const hanging = items.filter((item) => HANGING.has(item.category));
  const shelf = items.filter((item) => !HANGING.has(item.category));
  const [selectedId, setSelectedId] = useState<string | undefined>(
    hanging[0]?.id ?? shelf[0]?.id,
  );
  const selected =
    items.find((item) => item.id === selectedId) ?? hanging[0] ?? shelf[0];
  const selectedIndex = hanging.findIndex((item) => item.id === selected?.id);
  function select(item: WardrobeItem) {
    if (item.id === selected?.id) return;
    selection();
    setSelectedId(item.id);
  }
  const railHeight =
    ROD_TOP + Math.max(0, ...hanging.map((item) => LENGTH[item.category])) + 12;
  const { places, rodWidth } = placeOnRod(hanging, selectedIndex);

  return (
    <View>
      {hanging.length ? (
        <RailWall height={railHeight}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, minWidth: '100%' }}
          >
            <View style={{ width: rodWidth, height: railHeight }}>
              <Rod />
              <View style={[railStyles.cap, { left: -10 }]} />
              <View style={[railStyles.cap, { right: -10 }]} />
              {hanging.map((item, index) => (
                <HangingGarment
                  key={item.id}
                  item={item}
                  chosen={index === selectedIndex}
                  x={places[index].x}
                  width={places[index].width}
                  room={places[index].room}
                  height={LENGTH[item.category]}
                  onPress={() => select(item)}
                />
              ))}
            </View>
          </ScrollView>
        </RailWall>
      ) : null}

      {shelf.length ? (
        <View style={{ marginTop: 18 }}>
          <Text
            style={[
              s.subtitle,
              {
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: '700',
                color: palette.green,
                marginBottom: 6,
              },
            ]}
          >
            CALZADO Y ACCESORIOS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 14,
              paddingHorizontal: 4,
              alignItems: 'flex-end',
            }}
          >
            {shelf.map((item) => (
              <ShelfItem
                key={item.id}
                item={item}
                selected={item.id === selected?.id}
                onPress={() => select(item)}
              />
            ))}
          </ScrollView>
          <View
            style={[
              styles.shelf,
              { backgroundColor: palette.sand, borderColor: palette.line },
            ]}
          />
        </View>
      ) : null}

      {selected ? (
        <View style={[s.panel, { marginTop: 18, gap: 12 }]}>
          <View>
            <Text
              accessibilityRole="header"
              style={{ color: palette.ink, fontSize: 20, letterSpacing: -0.4 }}
            >
              {selected.name}
            </Text>
            <Text style={[s.subtitle, { fontSize: 12, marginTop: 2 }]}>
              {[
                categoryLabels[selected.category],
                selected.colors
                  .map((color) => colorLabels[color] ?? color)
                  .join(', '),
                selected.isDemo ? 'Ejemplo' : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text
              style={{
                color: selected.available ? palette.ink : palette.rust,
                fontSize: 14,
              }}
            >
              {selected.available ? 'Disponible' : 'En lavandería'}
            </Text>
            <Switch
              accessibilityLabel={`${selected.name}: disponible`}
              value={selected.available}
              onValueChange={() => onToggle(selected)}
              trackColor={{ true: palette.green }}
            />
          </View>
          <Button
            secondary
            small
            label="Editar prenda"
            onPress={() => onEdit(selected)}
          />
        </View>
      ) : null}
    </View>
  );
}

function ShelfItem({
  item,
  selected,
  onPress,
}: {
  item: WardrobeItem;
  selected: boolean;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const height = LENGTH[item.category];
  const width = garmentWidth(item, height);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}${item.available ? '' : ', en lavandería'}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        alignItems: 'center',
        minHeight: 44,
        opacity: item.available ? 1 : 0.4,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginBottom: 8,
          backgroundColor: selected ? palette.rust : 'transparent',
        }}
      />
      <GarmentImage item={item} width={width} height={height} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shelf: { height: 10, borderRadius: 3, borderWidth: 1, marginTop: -4 },
});
