import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppLogo } from '../AppLogo';
import { Button, useUI } from '../ui';
import { useCopy } from '../../i18n';

const STEPS = 4;
export const LAST_STEP = STEPS - 1;

export function OnboardingLogo() {
  return <AppLogo />;
}

/** Logo, step counter, optional close and the progress bar. */
export function StepHeader({
  step,
  onClose,
}: {
  step: number;
  onClose?: () => void;
}) {
  const { palette } = useUI();
  const t = useCopy();
  const total = STEPS;
  return (
    <View
      style={{
        width: '100%',
        maxWidth: 660,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 18,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <OnboardingLogo />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Text style={{ color: palette.muted, fontSize: 11 }}>
            {t.outfit.pageCount(step + 1, total)}
          </Text>
          {onClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.onboarding.closeLabel}
              onPress={onClose}
              style={{
                minHeight: 44,
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: palette.ink, fontSize: 12 }}>
                {t.common.close}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View
        accessibilityLabel={t.onboarding.stepLabel(step + 1, total)}
        style={{ flexDirection: 'row', gap: 6, marginTop: 17 }}
      >
        {Array.from({ length: STEPS }, (_, index) => index).map((index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: index <= step ? palette.ink : palette.line,
            }}
          />
        ))}
      </View>
    </View>
  );
}

/** Every step is optional: the skip link and the next button both move on. */
export function StepFooter({
  step,
  onGo,
}: {
  step: number;
  onGo: (step: number) => void;
}) {
  const { palette } = useUI();
  const t = useCopy();
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.paper,
        paddingHorizontal: 24,
        paddingVertical: 15,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 612,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {step > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
            onPress={() => onGo(step - 1)}
            style={({ pressed }) => [
              {
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: palette.line,
                backgroundColor: palette.white,
                alignItems: 'center',
                justifyContent: 'center',
              },
              pressed && { opacity: 0.72 },
            ]}
          >
            <Text style={{ fontSize: 20, color: palette.ink }}>←</Text>
          </Pressable>
        ) : null}
        {step < LAST_STEP ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => onGo(step + 1)}
              style={{
                flex: 1,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: palette.muted,
                  textAlign: 'center',
                }}
              >
                {t.onboarding.later}
              </Text>
            </Pressable>
            <Button
              label={t.onboarding.next[step]}
              onPress={() => onGo(step + 1)}
              style={{
                minHeight: 52,
                minWidth: 148,
                borderRadius: 26,
                paddingHorizontal: 16,
              }}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}
