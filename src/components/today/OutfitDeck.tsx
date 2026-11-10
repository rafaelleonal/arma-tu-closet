import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reasonInVoice, type Outfit, type WardrobeItem } from '../../domain';
import type { Palette } from '../../theme/ThemeProvider';
import { Bubble } from '../Bubble';
import { useFeedback } from '../Feedback';
import { useUI } from '../ui';
import { OutfitStage } from './OutfitStage';
import { TodayActions } from './TodayActions';

/** Same as the horizontal padding of the screen, so the table reaches both edges. */
const BLEED = 24;
/** Maximum width of the screen's content column. */
const MAX_CONTENT = 880;

interface OutfitDeckProps {
  outfits: Outfit[];
  compact: boolean;
  showReasons: boolean;
  isSaved: (outfit: Outfit) => boolean;
  onFavorite: (outfit: Outfit) => void;
  onWorn: (outfit: Outfit) => void;
  /** Without it the deck offers no «Prefiero otro». */
  onDismiss?: (outfit: Outfit) => void;
  onItem: (outfit: Outfit, item: WardrobeItem) => void;
  /** The garment every outfit is built around; it cannot be swapped. */
  pinnedItemId?: string;
  /** Height of the table when the deck is not a whole screen, as in a sheet. */
  stageHeight?: number;
  /** Page to open on, to come back to the idea that was in view. */
  initialIndex?: number;
  /** Height already taken above the deck by something optional, such as a banner. */
  reserved?: number;
  /** Sits to the right of the page indicator. */
  trailing?: React.ReactNode;
}

/** Today's ideas, one per page. The actions below always act on the page in view. */
export function OutfitDeck(props: OutfitDeckProps) {
  const { outfits, compact, showReasons, trailing } = props;
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { reduceMotion } = useFeedback();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollViewInstance>(null);
  // The pager spans the screen up to the content's maximum width; onLayout corrects the guess.
  const [width, setWidth] = useState(Math.min(window.width, MAX_CONTENT));
  const [index, setIndex] = useState(props.initialIndex ?? 0);
  const placed = useRef(!props.initialIndex);
  const current = outfits[Math.min(index, outfits.length - 1)];
  // What is left of a phone screen after the heading, the reasons, the actions and the tab bar.
  const room =
    window.height - insets.top - insets.bottom - 405 - (props.reserved ?? 0);
  const stageHeight =
    props.stageHeight ??
    (compact
      ? Math.max(220, Math.min(320, room - 60))
      : Math.max(260, Math.min(460, room)));
  const { onDismiss } = props;
  return (
    <>
      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        style={styles.pager}
        onLayout={(event) => {
          const measured = event.nativeEvent.layout.width;
          setWidth(measured);
          if (placed.current) return;
          placed.current = true;
          scroll.current?.scrollTo({ x: index * measured, animated: false });
        }}
        onScroll={(event) => {
          if (!width || !placed.current) return;
          const page = Math.round(event.nativeEvent.contentOffset.x / width);
          if (page !== index && page >= 0 && page < outfits.length)
            setIndex(page);
        }}
      >
        {width
          ? outfits.map((outfit) => (
              <View key={outfit.id} style={{ width }}>
                <OutfitNotes outfit={outfit} showReasons={showReasons} />
                <OutfitStage
                  outfit={outfit}
                  width={width}
                  height={stageHeight}
                  pinnedItemId={props.pinnedItemId}
                  onItem={(item) => props.onItem(outfit, item)}
                />
              </View>
            ))
          : null}
      </ScrollView>
      <View style={outfits.length > 1 || trailing ? styles.pages : styles.gap}>
        <View style={styles.dots}>
          {outfits.length > 1
            ? outfits.map((outfit, page) => (
                <Pressable
                  key={outfit.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Idea ${page + 1} de ${outfits.length}`}
                  accessibilityState={{ selected: page === index }}
                  onPress={() =>
                    scroll.current?.scrollTo({
                      x: page * width,
                      animated: !reduceMotion,
                    })
                  }
                  style={styles.dotArea}
                >
                  <View style={[styles.dot, page === index && styles.dotOn]} />
                </Pressable>
              ))
            : null}
          {outfits.length > 1 ? (
            <Text style={styles.count}>
              {index + 1} de {outfits.length}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
      <TodayActions
        saved={props.isSaved(current)}
        onFavorite={() => props.onFavorite(current)}
        onWorn={() => props.onWorn(current)}
        onDismiss={onDismiss ? () => onDismiss(current) : undefined}
      />
    </>
  );
}

/** Reasons can be hidden; warnings always stay visible. */
function OutfitNotes({
  outfit,
  showReasons,
}: {
  outfit: Outfit;
  showReasons: boolean;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const reasons = showReasons ? outfit.reasons.slice(0, 2) : [];
  return (
    <View style={styles.notes}>
      {reasons.length ? (
        <Bubble>{reasons.map(reasonInVoice).join(' ')}</Bubble>
      ) : null}
      {outfit.warnings.map((warning) => (
        <Text key={warning} style={styles.warning}>
          {warning}
        </Text>
      ))}
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    pager: { marginHorizontal: -BLEED },
    notes: { paddingHorizontal: BLEED, paddingBottom: 14, gap: 6 },
    warning: { color: palette.rust, fontSize: 12, lineHeight: 18 },
    pages: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      marginVertical: 4,
    },
    gap: { height: 14 },
    dots: { flexDirection: 'row', alignItems: 'center' },
    dotArea: {
      width: 32,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: palette.line,
    },
    dotOn: { width: 16, backgroundColor: palette.ink },
    count: { fontSize: 12, color: palette.muted, marginLeft: 6 },
  });
