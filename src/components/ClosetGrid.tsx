import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { CATEGORIES, categoryLabels, type Category, type WardrobeItem } from '../domain';
import { Garment } from './Garment';
import { Chip, useUI } from './ui';

const GAP = 10;

/** A person's own garments as a photo album: square tiles that tolerate any photo background. */
export function ClosetGrid({ items, onEdit }: { items: WardrobeItem[]; onEdit: (item: WardrobeItem) => void }) {
  const { palette, s } = useUI();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [width, setWidth] = useState(0);
  const present = CATEGORIES.filter(value => items.some(item => item.category === value));
  const visible = items.filter(item => category === 'all' || item.category === category);
  const tile = width ? Math.floor((width - GAP * 2) / 3) : 0;
  return <View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
      <Chip label={`Todo · ${items.length}`} selected={category === 'all'} onPress={() => setCategory('all')}/>
      {present.map(value => <Chip key={value} label={`${categoryLabels[value]} · ${items.filter(item => item.category === value).length}`} selected={category === value} onPress={() => setCategory(value)}/>)}
    </ScrollView>
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
      {tile ? visible.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Editar ${item.name}${item.available ? '' : ', en lavandería'}`} onPress={() => onEdit(item)} style={({ pressed }) => ({ width: tile, opacity: pressed ? .75 : 1 })}>
        <View style={{ width: tile, height: tile, borderRadius: 14, overflow: 'hidden', backgroundColor: palette.wash, alignItems: 'center', justifyContent: 'center' }}>
          {item.photoUri
            ? <Image accessible={false} source={{ uri: item.photoUri }} style={{ width: tile, height: tile, opacity: item.available ? 1 : .45 }} resizeMode="cover"/>
            : <View style={{ opacity: item.available ? 1 : .45 }}><Garment item={item} size={Math.round(tile * .62)}/></View>}
          {!item.available ? <Text style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 10, color: palette.ink, backgroundColor: palette.floating, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' }}>Lavandería</Text> : null}
        </View>
        <Text numberOfLines={1} style={{ fontSize: 12, color: palette.ink, marginTop: 6 }}>{item.name}</Text>
      </Pressable>) : null}
    </View>
    {!visible.length ? <Text style={s.subtitle}>No tienes prendas en esta categoría.</Text> : null}
  </View>;
}
