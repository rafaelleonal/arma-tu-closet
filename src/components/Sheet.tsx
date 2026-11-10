import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUI } from './ui';
import type { Palette } from '../theme/ThemeProvider';
import { useFeedback } from './Feedback';

/** Horizontal padding of a sheet, the same as a screen's, so full-width pieces bleed alike. */
export const SHEET_BLEED = 24;
/** Share of the window a sheet may cover. */
const MAX_HEIGHT = 0.94;

/**
 * Height for a table of stickers inside a sheet, so the actions under it stay in view.
 * `taken` is what the rest of the sheet needs: header, notes, actions and padding.
 */
export function useSheetStageHeight(taken: number, compact = false) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const room = window.height * MAX_HEIGHT - insets.top - insets.bottom - taken;
  return Math.max(200, Math.min(compact ? 280 : 380, room));
}

/** True while the on-screen keyboard is up; it then covers the home indicator's area. */
function useKeyboardUp() {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const shown = Keyboard.addListener(
      ios ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setUp(true),
    );
    const hidden = Keyboard.addListener(
      ios ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setUp(false),
    );
    return () => {
      shown.remove();
      hidden.remove();
    };
  }, []);
  return up;
}

export function Sheet({
  title,
  onClose,
  children,
  scrollRef,
  pinned,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
  /** Stays under the title while the content scrolls. */
  pinned?: React.ReactNode;
  /** The sheet's main action, always in view under the content. */
  footer?: React.ReactNode;
}) {
  const { palette } = useUI();
  const { reduceMotion } = useFeedback();
  const styles = useMemo(() => createStyles(palette), [palette]);
  // Read here, outside the modal: inside it there is no provider, so a SafeAreaView reports none.
  const insets = useSafeAreaInsets();
  const keyboardUp = useKeyboardUp();
  return (
    <Modal
      animationType={reduceMotion ? 'none' : 'slide'}
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View
          style={[
            styles.sheet,
            {
              // Never under the status bar, even when the keyboard leaves little room.
              marginTop: insets.top,
              paddingBottom: keyboardUp ? 0 : insets.bottom,
            },
          ]}
        >
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={onClose}
              style={styles.close}
            >
              <Text style={{ fontSize: 25, color: palette.ink }}>×</Text>
            </Pressable>
          </View>
          {pinned}
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {
                // The home indicator's area already adds room under the last line.
                paddingBottom: footer ? 20 : Math.max(16, 36 - insets.bottom),
              },
            ]}
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const createStyles = (palette: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: palette.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: `${MAX_HEIGHT * 100}%`,
      width: '100%',
      maxWidth: 620,
      alignSelf: 'center',
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      backgroundColor: palette.paper,
      flexShrink: 1,
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: SHEET_BLEED,
      paddingTop: 20,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      flexShrink: 1,
      fontSize: 23,
      letterSpacing: -0.6,
      color: palette.ink,
    },
    close: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: palette.wash,
    },
    scroll: { flexShrink: 1 },
    content: {
      paddingHorizontal: SHEET_BLEED,
      paddingTop: 4,
      paddingBottom: 36,
    },
    footer: {
      paddingHorizontal: SHEET_BLEED,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: 1,
      borderTopColor: palette.line,
      backgroundColor: palette.paper,
    },
  });
