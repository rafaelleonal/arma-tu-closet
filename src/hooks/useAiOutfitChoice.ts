import { useState } from 'react';
import { Platform } from 'react-native';
import { fitsOutfitContext, type Context, type Outfit } from '../domain';
import { chooseOutfit } from '../ai/outfitChoice';
import { buildOutfitChoice } from '../ai/outfitChoiceContract';

type Choice = {
  key: string;
  status: 'pending' | 'failed' | 'ready';
  id?: string;
};

export function useAiOutfitChoice(outfits: Outfit[], context: Context) {
  const [choice, setChoice] = useState<Choice>();
  const candidates = outfits
    .filter((outfit) => fitsOutfitContext(outfit, context))
    .slice(0, 5);
  const input = buildOutfitChoice(candidates, context);
  const key = JSON.stringify([candidates.map((outfit) => outfit.id), input]);
  const current = choice?.key === key ? choice : undefined;
  const selected = outfits.find((outfit) => outfit.id === current?.id);
  const enabled =
    __DEV__ &&
    candidates.length >= 2 &&
    (Platform.OS === 'web' ||
      Boolean(process.env.EXPO_PUBLIC_AI_API_URL?.trim()));

  async function request() {
    if (!enabled || current?.status === 'pending') return;
    setChoice({ key, status: 'pending' });
    try {
      const hostname =
        Platform.OS === 'web' ? window.location.hostname : undefined;
      const index = await chooseOutfit(input, Platform.OS, hostname);
      setChoice((previous) =>
        previous?.key === key
          ? { key, status: 'ready', id: candidates[index].id }
          : previous,
      );
    } catch {
      setChoice((previous) =>
        previous?.key === key ? { key, status: 'failed' } : previous,
      );
    }
  }

  return {
    enabled,
    status: current?.status,
    request,
    outfits: selected
      ? [selected, ...outfits.filter((outfit) => outfit.id !== selected.id)]
      : outfits,
  };
}
