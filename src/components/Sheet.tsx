import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUI } from './ui';
import type { Palette } from '../theme/ThemeProvider';
import { useFeedback } from './Feedback';

export function Sheet({
  title,
  onClose,
  children,
  scrollRef,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
}) {
  const { palette } = useUI();
  const { reduceMotion } = useFeedback();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <Modal animationType={reduceMotion ? 'none' : 'slide'} transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
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
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const createStyles = (palette: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'flex-end' },
    sheet: {
      maxHeight: '94%',
      width: '100%',
      maxWidth: 620,
      alignSelf: 'center',
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      backgroundColor: palette.paper,
      flexShrink: 1,
    },
    header: {
      padding: 22,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { fontSize: 23, letterSpacing: -0.6, color: palette.ink },
    close: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: palette.wash,
    },
    content: { padding: 22, paddingTop: 4, paddingBottom: 36 },
  });
