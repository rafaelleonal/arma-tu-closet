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
  onDismiss: (outfit: Outfit) => void;
  onItem: (outfit: Outfit, item: WardrobeItem) => void;
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
  const [index, setIndex] = useState(0);
  const current = outfits[Math.min(index, outfits.length - 1)];
  // What is left of a phone screen after the heading, the reasons, the actions and the tab bar.
  const room =
    window.height - insets.top - insets.bottom - 405 - (props.reserved ?? 0);
  const stageHeight = compact
    ? Math.max(220, Math.min(320, room - 60))
    : Math.max(260, Math.min(460, room));
  return (
    <>
      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        style={styles.pager}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onScroll={(event) => {
          if (!width) return;
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
                  onItem={(item) => props.onItem(outfit, item)}
                />
              </View>
            ))
          : null}
      </ScrollView>
      <View style={styles.pages}>
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
        onDismiss={() => props.onDismiss(current)}
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
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            {reasons.map(reasonInVoice).join(' ')}
          </Text>
          <View style={styles.tail} />
        </View>
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
    bubble: {
      backgroundColor: palette.white,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 14,
      marginBottom: 4,
    },
    bubbleText: { fontSize: 16, lineHeight: 23, color: palette.ink },
    tail: {
      position: 'absolute',
      left: 80,
      bottom: -6,
      width: 14,
      height: 14,
      borderRadius: 3,
      backgroundColor: palette.white,
      transform: [{ rotate: '45deg' }],
    },
    warning: { color: palette.rust, fontSize: 12, lineHeight: 18 },
    pages: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      marginVertical: 4,
    },
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
