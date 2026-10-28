import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LocalData } from '../storage/schema';
import { MotionIn, useFeedback } from './Feedback';
import { useUI } from './ui';
import { AppearanceStep } from './onboarding/AppearanceStep';
import { ColorsStep, type ColorMode } from './onboarding/ColorsStep';
import {
  LAST_STEP,
  StepFooter,
  StepHeader,
} from './onboarding/OnboardingChrome';
import { RoutineStep } from './onboarding/RoutineStep';
import { StyleStep } from './onboarding/StyleStep';
import type { OnboardingEntry, PersonalizationPatch } from './onboarding/types';
import { Welcome } from './onboarding/Welcome';

export type { OnboardingEntry, PersonalizationPatch };

export interface OnboardingProps {
  data: LocalData;
  mode: 'initial' | 'edit';
  onChange: (patch: PersonalizationPatch) => void;
  onFinish: (entry: OnboardingEntry) => void;
  onClose?: () => void;
}

/** Four optional steps. The current step is saved so a first run can resume where it stopped. */
export function Onboarding({
  data,
  mode,
  onChange,
  onFinish,
  onClose,
}: OnboardingProps) {
  const { palette } = useUI();
  const feedback = useFeedback();
  const edit = mode === 'edit';
  const savedStep = data.onboarding?.step ?? 0;
  const [step, setStep] = useState(edit ? 0 : savedStep);
  const [colorMode, setColorMode] = useState<ColorMode>('favorite');
  // Shown once per launch before the first step; not persisted, so it needs no schema change.
  const [welcome, setWelcome] = useState(!edit && savedStep === 0);
  const scroll = useRef<ScrollViewInstance>(null);
  function go(next: number) {
    const safe = Math.max(0, Math.min(LAST_STEP, next)) as 0 | 1 | 2 | 3;
    if (safe !== step) feedback.selection();
    setStep(safe);
    onChange({ onboarding: { step: safe } });
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  if (welcome)
    return (
      <Welcome
        onStart={() => {
          feedback.selection();
          setWelcome(false);
        }}
      />
    );
  const stepProps = { data, onChange };
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: palette.paper }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <StepHeader step={step} onClose={onClose} />
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            width: '100%',
            maxWidth: 660,
            alignSelf: 'center',
            paddingHorizontal: 24,
            paddingTop: 14,
            paddingBottom: 32,
          }}
        >
          <MotionIn trigger={step}>
            {step === 0 ? <StyleStep {...stepProps} /> : null}
            {step === 1 ? (
              <ColorsStep
                {...stepProps}
                mode={colorMode}
                onMode={setColorMode}
              />
            ) : null}
            {step === 2 ? <RoutineStep {...stepProps} /> : null}
            {step === 3 ? (
              <AppearanceStep {...stepProps} edit={edit} onFinish={onFinish} />
            ) : null}
          </MotionIn>
        </ScrollView>
        <StepFooter step={step} onGo={go} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
