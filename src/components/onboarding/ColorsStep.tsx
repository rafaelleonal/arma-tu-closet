import React from 'react';
import { ColorPicker, type ColorMode } from '../ColorPicker';
import { Guide } from './Guide';
import type { StepProps } from './types';

export type { ColorMode };

export function ColorsStep({
  data,
  onChange,
  mode,
  onMode,
}: StepProps & { mode: ColorMode; onMode: (mode: ColorMode) => void }) {
  return (
    <>
      <Guide
        kind="jacket"
        say="Yo soy Chama, la chamarra. Vamos con los colores."
        title="¿Qué colores te gustan?"
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
