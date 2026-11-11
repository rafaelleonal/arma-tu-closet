import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WardrobeItem } from '../domain';
import type { UpdateData } from '../hooks/useLocalData';
import { DemoBanner } from '../components/AppChrome';
import { Bubble } from '../components/Bubble';
import { ClosetGrid } from '../components/ClosetGrid';
import { Dots } from '../components/Dots';
import { DrawingSticker } from '../components/Sticker';
import { Button, useUI } from '../components/ui';
import { useCopy } from '../i18n';
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
  const t = useCopy();
  const available = items.filter((item) => item.available).length;
  return (
    <>
      <Text style={{ color: palette.muted, fontSize: 12 }}>
        {t.closet.count(items.length, available)}
      </Text>
      <View style={[s.pageHeading, { columnGap: 12, rowGap: 8 }]}>
        <Text accessibilityRole="header" style={s.title}>
          {t.closet.title}
        </Text>
        <Button
          label={t.closet.addShort}
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
              current.items.length ? current : withDemo(current, t.demoNames),
            );
            onDemoReady();
          }}
        />
      ) : (
        // The example closet and a person's own garments look the same: a sticker album.
        <ClosetGrid items={items} onEdit={onEdit} />
      )}
      <Button
        secondary
        label={t.closet.build}
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
  const t = useCopy();
  return (
    <>
      <View style={styles.board}>
        <Dots />
        <Bubble>{t.closet.emptyHint}</Bubble>
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
      <Button label={t.closet.add} onPress={onAdd} />
      <Button
        secondary
        label={t.closet.showDemo}
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
