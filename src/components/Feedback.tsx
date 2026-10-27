import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Platform, Pressable, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

const FeedbackContext = createContext({ reduceMotion: true, selection: () => {}, success: () => {} });

export function FeedbackProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  // Avoid moving content before the accessibility preference has loaded.
  const [reduceMotion, setReduceMotion] = useState(true);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { changed = true; setReduceMotion(value); });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active && !changed) setReduceMotion(value); }).catch(() => {});
    return () => { active = false; subscription.remove(); };
  }, []);
  const selection = useCallback(() => {
    if (Platform.OS !== 'web' && enabledRef.current && AppState.currentState === 'active') void Haptics.selectionAsync().catch(() => {});
  }, []);
  const success = useCallback(() => {
    if (Platform.OS !== 'web' && enabledRef.current && AppState.currentState === 'active') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);
  const value = useMemo(() => ({ reduceMotion, selection, success }), [reduceMotion, selection, success]);
  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export const useFeedback = () => useContext(FeedbackContext);
export function MotionPressable({ children, onPressIn, onPressOut, ...props }: PressableProps) {
  const { reduceMotion } = useFeedback();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => { scale.stopAnimation(); scale.setValue(1); return () => scale.stopAnimation(); }, [reduceMotion, scale]);
  function animate(toValue: number) {
    scale.stopAnimation();
    if (reduceMotion) { scale.setValue(1); return; }
    Animated.timing(scale, { toValue, duration: toValue === 1 ? 140 : 90, useNativeDriver: Platform.OS !== 'web' }).start();
  }
  // Keep layout and the full touch area on Pressable; only its content moves.
  return <Pressable {...props} onPressIn={event => { animate(.98); onPressIn?.(event); }} onPressOut={event => { animate(1); onPressOut?.(event); }}>{state => <Animated.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, transform: [{ scale }] }}>{typeof children === 'function' ? children(state) : children}</Animated.View>}</Pressable>;
}

export function MotionIn({ trigger, children }: { trigger: string | number; children: React.ReactNode }) {
  const { reduceMotion } = useFeedback();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduceMotion) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' });
    animation.start();
    return () => animation.stop();
  }, [trigger, reduceMotion, progress]);
  return <Animated.View style={{ opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [.4, 1] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>{children}</Animated.View>;
}
