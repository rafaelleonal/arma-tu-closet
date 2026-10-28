import type { LocalData } from '../../storage/schema';

export type PersonalizationPatch = Partial<
  Pick<
    LocalData,
    | 'profile'
    | 'preferences'
    | 'appearance'
    | 'context'
    | 'onboarding'
    | 'weather'
  >
>;

export type OnboardingEntry = 'own' | 'demo' | 'keep';

/** Each step edits the saved document directly; there is no draft to confirm. */
export interface StepProps {
  data: LocalData;
  onChange: (patch: PersonalizationPatch) => void;
}
