import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Palette } from '../theme/ThemeProvider';
import { useFeedback } from './Feedback';
import { Button, useUI } from './ui';
import { useCopy } from '../i18n';

export type Tab = 'today' | 'closet' | 'style';

const TABS = [
  { id: 'today', icon: '☼' },
  { id: 'closet', icon: '▥' },
  { id: 'style', icon: '◌' },
] as const;

export function TabBar({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const feedback = useFeedback();
  const t = useCopy();
  const labels: Record<Tab, string> = {
    today: t.today.title,
    closet: t.closet.title,
    style: t.style.title,
  };
  return (
    <SafeAreaView edges={['bottom']} style={styles.tabBar}>
      <View style={styles.tabInner}>
        {TABS.map((value) => {
          const selected = tab === value.id;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              aria-selected={selected}
              key={value.id}
              onPress={() => {
                if (selected) return;
                feedback.selection();
                onChange(value.id);
              }}
              style={styles.tab}
            >
              <Text
                style={{
                  fontSize: 23,
                  color: selected ? palette.rust : palette.muted,
                }}
              >
                {value.icon}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: selected ? palette.ink : palette.muted,
                  fontWeight: selected ? '700' : '400',
                }}
              >
                {labels[value.id]}
              </Text>
              {selected ? <View style={styles.tabDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

/** Inline, unlike the notice: it needs a retry action. */
export function SaveErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const t = useCopy();
  if (!message) return null;
  return (
    <View style={styles.error}>
      <Text
        accessibilityRole="alert"
        style={{ color: palette.rust, flex: 1, fontSize: 12 }}
      >
        {message}
      </Text>
      <Button secondary small label={t.common.retryShort} onPress={onRetry} />
    </View>
  );
}

/** Floats over the content so showing or hiding it never moves the buttons under a tap. */
export function FloatingNotice({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const t = useCopy();
  if (!message) return null;
  return (
    <Pressable
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityHint={t.common.tapToClose}
      onPress={onClose}
      style={styles.notice}
    >
      <Text style={{ color: palette.ink, fontSize: 13, lineHeight: 19 }}>
        {message}
      </Text>
    </Pressable>
  );
}

export function DemoBanner({ onStart }: { onStart: () => void }) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const t = useCopy();
  return (
    <View style={styles.demo}>
      <Text
        style={{ color: palette.green, flex: 1, fontSize: 11, lineHeight: 17 }}
      >
        {t.demo.banner}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        style={{ padding: 10 }}
      >
        <Text style={{ fontSize: 11, color: palette.rust, fontWeight: '600' }}>
          {t.demo.useMine}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    tabBar: {
      borderTopWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.paper,
    },
    tabInner: {
      flexDirection: 'row',
      maxWidth: 560,
      alignSelf: 'center',
      width: '100%',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
      paddingBottom: 12,
      gap: 4,
      minHeight: 68,
    },
    tabDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.rust,
      position: 'absolute',
      bottom: 4,
    },
    notice: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 12,
      backgroundColor: palette.wash,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.line,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    error: {
      backgroundColor: palette.errorBg,
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      padding: 14,
    },
    demo: {
      backgroundColor: palette.wash,
      paddingLeft: 14,
      paddingRight: 4,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      gap: 6,
    },
  });
