import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import {
  CATEGORIES,
  categoryLabels,
  type Category,
  type WardrobeItem,
} from '../domain';
import { Garment, useGarmentImages } from './Garment';
import { Chip, useUI } from './ui';

const GAP = 10;

/** A person's own garments as a photo album: square tiles that tolerate any photo background. */
export function ClosetGrid({
  items,
  onEdit,
}: {
  items: WardrobeItem[];
  onEdit: (item: WardrobeItem) => void;
}) {
  const { s } = useUI();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [width, setWidth] = useState(0);
  const present = CATEGORIES.filter((value) =>
    items.some((item) => item.category === value),
  );
  const visible = items.filter(
    (item) => category === 'all' || item.category === category,
  );
  const tile = width ? Math.floor((width - GAP * 2) / 3) : 0;
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        <Chip
          label={`Todo · ${items.length}`}
          selected={category === 'all'}
          onPress={() => setCategory('all')}
        />
        {present.map((value) => (
          <Chip
            key={value}
            label={`${categoryLabels[value]} · ${items.filter((item) => item.category === value).length}`}
            selected={category === value}
            onPress={() => setCategory(value)}
          />
        ))}
      </ScrollView>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}
      >
        {tile
          ? visible.map((item) => (
              <GridTile
                key={item.id}
                item={item}
                size={tile}
                onPress={() => onEdit(item)}
              />
            ))
          : null}
      </View>
      {!visible.length ? (
        <Text style={s.subtitle}>No tienes prendas en esta categoría.</Text>
      ) : null}
    </View>
  );
}

function GridTile({
  item,
  size,
  onPress,
}: {
  item: WardrobeItem;
  size: number;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const { cutoutUri, photoUri, fail } = useGarmentImages(item);
  const opacity = item.available ? 1 : 0.45;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${item.name}${item.available ? '' : ', en lavandería'}`}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: palette.wash,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {cutoutUri ? (
          <Image
            accessible={false}
            source={{ uri: cutoutUri }}
            onError={fail(cutoutUri)}
            style={{ width: size * 0.84, height: size * 0.84, opacity }}
            resizeMode="contain"
          />
        ) : photoUri ? (
          <Image
            accessible={false}
            source={{ uri: photoUri }}
            onError={fail(photoUri)}
            style={{ width: size, height: size, opacity }}
            resizeMode="cover"
          />
        ) : (
          // Also the fallback when a photo file no longer loads, so the drawing skips that file.
          <View style={{ opacity }}>
            <Garment
              item={{ ...item, photoUri: undefined, cutoutUri: undefined }}
              size={Math.round(size * 0.62)}
            />
          </View>
        )}
        {!item.available ? (
          <Text
            style={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              fontSize: 10,
              color: palette.ink,
              backgroundColor: palette.floating,
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
              overflow: 'hidden',
            }}
          >
            Lavandería
          </Text>
        ) : null}
      </View>
      {/* Two lines: similar names often differ only at the end. */}
      <Text
        numberOfLines={2}
        style={{ fontSize: 12, color: palette.ink, marginTop: 6 }}
      >
        {item.name}
      </Text>
    </Pressable>
  );
}
