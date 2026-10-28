import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { categoryLabels, colorLabels, type WardrobeItem } from '../domain';
import { useFeedback } from './Feedback';
import { GarmentImage, HANGING, LENGTH, RailWall, Rod, ROD_TOP, garmentWidth, railStyles } from './rail';
import { Button, useUI } from './ui';

const SIDE_WIDTH = 40;

interface Props { items: WardrobeItem[]; onEdit: (item: WardrobeItem) => void; onToggle: (item: WardrobeItem) => void }

/** Closet as a rail: garments hang edge-on and the selected one turns to face the viewer. */
export function ClosetRail({ items, onEdit, onToggle }: Props) {
  const { palette, s } = useUI();
  const { selection } = useFeedback();
  const hanging = items.filter(item => HANGING.has(item.category));
  const shelf = items.filter(item => !HANGING.has(item.category));
  const [selectedId, setSelectedId] = useState<string | undefined>(hanging[0]?.id ?? shelf[0]?.id);
  const selected = items.find(item => item.id === selectedId) ?? hanging[0] ?? shelf[0];
  const selectedIndex = hanging.findIndex(item => item.id === selected?.id);
  function select(item: WardrobeItem) {
    if (item.id === selected?.id) return;
    selection(); setSelectedId(item.id);
  }
  const railHeight = ROD_TOP + Math.max(0, ...hanging.map(item => LENGTH[item.category])) + 12;

  return <View>
    {hanging.length ? <RailWall height={railHeight}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, minWidth: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: railHeight }}>
          <Rod/>
          <View style={[railStyles.cap, { left: -10 }]}/><View style={[railStyles.cap, { right: -10 }]}/>
          {hanging.map((item, index) => <HangingGarment key={item.id} item={item} position={index < selectedIndex ? -1 : index > selectedIndex ? 1 : 0} onPress={() => select(item)}/>)}
        </View>
      </ScrollView>
    </RailWall> : null}

    {shelf.length ? <View style={{ marginTop: 18 }}>
      <Text style={[s.subtitle, { fontSize: 11, letterSpacing: 2, fontWeight: '700', color: palette.green, marginBottom: 6 }]}>CALZADO Y ACCESORIOS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 4, alignItems: 'flex-end' }}>
        {shelf.map(item => <ShelfItem key={item.id} item={item} selected={item.id === selected?.id} onPress={() => select(item)}/>)}
      </ScrollView>
      <View style={[styles.shelf, { backgroundColor: palette.sand, borderColor: palette.line }]}/>
    </View> : null}

    {selected ? <View style={[s.panel, { marginTop: 18, gap: 12 }]}>
      <View>
        <Text accessibilityRole="header" style={{ color: palette.ink, fontSize: 20, letterSpacing: -.4 }}>{selected.name}</Text>
        <Text style={[s.subtitle, { fontSize: 12, marginTop: 2 }]}>{[categoryLabels[selected.category], selected.colors.map(color => colorLabels[color] ?? color).join(', '), selected.isDemo ? 'Ejemplo' : ''].filter(Boolean).join(' · ')}</Text>
      </View>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Text style={{ color: selected.available ? palette.ink : palette.rust, fontSize: 14 }}>{selected.available ? 'Disponible' : 'En lavandería'}</Text>
        <Switch accessibilityLabel={`${selected.name}: disponible`} value={selected.available} onValueChange={() => onToggle(selected)} trackColor={{ true: palette.green }}/>
      </View>
      <Button secondary small label="Editar prenda" onPress={() => onEdit(selected)}/>
    </View> : null}
  </View>;
}

export function HangingGarment({ item, position, onPress }: { item: WardrobeItem; position: -1 | 0 | 1; onPress: () => void }) {
  const { reduceMotion } = useFeedback();
  const progress = useRef(new Animated.Value(position)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduceMotion) { progress.setValue(position); return; }
    const animation = Animated.timing(progress, { toValue: position, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [position, reduceMotion, progress]);
  const height = LENGTH[item.category];
  const width = garmentWidth(item, height);
  const slot = progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [SIDE_WIDTH, width + 24, SIDE_WIDTH] });
  const rotateY = progress.interpolate({ inputRange: [-1, 0, 1], outputRange: ['76deg', '0deg', '-76deg'] });
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}${item.available ? '' : ', en lavandería'}`} accessibilityState={{ selected: position === 0 }} onPress={onPress} style={{ zIndex: position === 0 ? 2 : 1 }}>
    <Animated.View style={{ width: slot, height: ROD_TOP + height, alignItems: 'center' }}>
      <Animated.View style={{ width, height, marginTop: ROD_TOP - 10, opacity: item.available ? 1 : .4, transform: [{ perspective: 900 }, { rotateY }] }}>
        <GarmentImage item={item} width={width} height={height}/>
      </Animated.View>
    </Animated.View>
  </Pressable>;
}

function ShelfItem({ item, selected, onPress }: { item: WardrobeItem; selected: boolean; onPress: () => void }) {
  const { palette } = useUI();
  const height = LENGTH[item.category];
  const width = garmentWidth(item, height);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}${item.available ? '' : ', en lavandería'}`} accessibilityState={{ selected }} onPress={onPress} style={{ alignItems: 'center', minHeight: 44, opacity: item.available ? 1 : .4 }}>
    <View style={{ width: 6, height: 6, borderRadius: 3, marginBottom: 8, backgroundColor: selected ? palette.rust : 'transparent' }}/>
    <GarmentImage item={item} width={width} height={height}/>
  </Pressable>;
}

const styles = StyleSheet.create({
  shelf: { height: 10, borderRadius: 3, borderWidth: 1, marginTop: -4 },
});

/** Presentation-only rail for the welcome screen: example garments turning to the front one after another. */
export function WelcomeRail({ items }: { items: WardrobeItem[] }) {
  const { reduceMotion } = useFeedback();
  const hanging = items.filter(item => HANGING.has(item.category)).slice(0, 5);
  const [front, setFront] = useState(Math.floor(hanging.length / 2));
  useEffect(() => {
    if (reduceMotion || hanging.length < 2) return;
    const timer = setInterval(() => setFront(current => (current + 1) % hanging.length), 2600);
    return () => clearInterval(timer);
  }, [reduceMotion, hanging.length]);
  const height = ROD_TOP + Math.max(0, ...hanging.map(item => LENGTH[item.category])) + 12;
  return <RailWall height={height}>
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', justifyContent: 'center', height }}>
      <Rod/>
      {hanging.map((item, index) => <HangingGarment key={item.id} item={item} position={index < front ? -1 : index > front ? 1 : 0} onPress={() => setFront(index)}/>)}
    </View>
  </RailWall>;
}
