import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colorLabels, type WardrobeItem } from '../../domain';
import { NameTag } from '../NameTag';
import { Dots } from '../Dots';
import { SHEET_BLEED } from '../Sheet';
import { Sticker } from '../Sticker';
import { stickerArt } from '../StickerAlbum';
import { useUI } from '../ui';

const HEIGHT = 212;

/**
 * The garment being edited as the sticker the rest of the app will show: its photo, its cut-out
 * or, without a photo, the generic drawing of its category.
 */
export function GarmentPreview({ draft }: { draft: WardrobeItem }) {
  const { palette } = useUI();
  const colors = draft.colors
    .map((color) => colorLabels[color] || color)
    .join(', ');
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${stickerArt(draft)}${draft.name ? ` de ${draft.name}` : ''}${colors ? `. Colores: ${colors}` : ''}`}
      style={[styles.stage, { backgroundColor: palette.art }]}
    >
      <Dots />
      <Sticker item={draft} maxWidth={190} maxHeight={150} rotate={-3} />
      {draft.name ? (
        <NameTag item={draft} style={{ maxWidth: 260, marginTop: -4 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: HEIGHT,
    marginHorizontal: -SHEET_BLEED,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
