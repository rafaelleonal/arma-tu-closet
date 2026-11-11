import React from 'react';
import { ColorPicker, type ColorMode } from '../ColorPicker';
import { Guide } from './Guide';
import type { StepProps } from './types';
import { useCopy } from '../../i18n';

export type { ColorMode };

export function ColorsStep({
  data,
  onChange,
  mode,
  onMode,
}: StepProps & { mode: ColorMode; onMode: (mode: ColorMode) => void }) {
  const t = useCopy();
  return (
    <>
      <Guide
        kind="jacket"
        say={t.onboarding.colorsSay}
        title={t.onboarding.colorsTitle}
      />
      <ColorPicker
        value={data.preferences}
        mode={mode}
        onMode={onMode}
        onChange={(colors) =>
          onChange({ preferences: { ...data.preferences, ...colors } })
        }
      />
    </>
  );
}
