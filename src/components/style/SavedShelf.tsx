import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Outfit } from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { OutfitCollage } from '../OutfitCollage';
import { useUI } from '../ui';
import { useCopy } from '../../i18n';

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
  const t = useCopy();
  return (
    <>
      <View style={styles.heading}>
        <Text style={[s.sectionTitle, { marginBottom: 0 }]}>
          {t.saved.title}
        </Text>
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
              accessibilityLabel={t.saved.open(
                outfit.items.map((item) => item.name).join(', '),
              )}
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
                {outfit.id.startsWith('manual-')
                  ? t.saved.byYou
                  : t.saved.saved}
              </Text>
              <Text style={[s.subtitle, { fontSize: 11, lineHeight: 16 }]}>
                {t.saved.items(outfit.items.length)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <Text style={s.subtitle}>{t.saved.empty}</Text>
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
