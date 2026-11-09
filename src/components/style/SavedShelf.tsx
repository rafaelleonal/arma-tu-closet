import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Outfit } from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { OutfitCollage } from '../OutfitCollage';
import { useUI } from '../ui';

/** Same as the horizontal padding of the screen, so the shelf scrolls from edge to edge. */
const BLEED = 24;
const CARD = { width: 148, height: 172 };

/** Saved outfits as a row of small collages. Opening one shows the whole outfit. */
export function SavedShelf({
  outfits,
  onOpen,
}: {
  outfits: Outfit[];
  onOpen: (outfit: Outfit) => void;
}) {
  const { palette, s } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <>
      <View style={styles.heading}>
        <Text style={[s.sectionTitle, { marginBottom: 0 }]}>Guardados</Text>
        <Text style={s.subtitle}>{outfits.length}</Text>
      </View>
      {outfits.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -BLEED }}
          contentContainerStyle={styles.shelf}
        >
          {outfits.map((outfit) => (
            <Pressable
              key={outfit.id}
              accessibilityRole="button"
              accessibilityLabel={`Ver outfit guardado: ${outfit.items.map((item) => item.name).join(', ')}`}
              onPress={() => onOpen(outfit)}
              style={({ pressed }) => [pressed && { opacity: 0.72 }]}
            >
              <View style={styles.card}>
                <OutfitCollage
                  outfit={outfit}
                  width={CARD.width - 24}
                  height={CARD.height - 24}
                />
              </View>
              <Text style={styles.caption}>
                {outfit.id.startsWith('manual-') ? 'Creado por ti' : 'Guardado'}
              </Text>
              <Text style={[s.subtitle, { fontSize: 11, lineHeight: 16 }]}>
                {outfit.items.length} prendas
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <Text style={s.subtitle}>
          Todavía no guardas ningún outfit. Toca ♡ en Hoy para guardar uno.
        </Text>
      )}
    </>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    heading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 14,
    },
    shelf: { paddingHorizontal: BLEED, gap: 12 },
    card: {
      width: CARD.width,
      height: CARD.height,
      padding: 12,
      borderRadius: 18,
      backgroundColor: palette.art,
    },
    caption: { fontSize: 13, color: palette.ink, marginTop: 9 },
  });
