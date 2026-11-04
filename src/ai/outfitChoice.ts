import { resolveAiApiUrl } from './client';
import {
  outfitChoiceInput,
  outfitChoiceOutput,
  type OutfitChoiceInput,
} from './outfitChoiceContract';

export async function chooseOutfit(
  input: OutfitChoiceInput,
  platform: string,
  hostname?: string,
  fetchImpl = fetch,
): Promise<number> {
  const url = resolveAiApiUrl(
    platform,
    process.env.EXPO_PUBLIC_AI_API_URL,
    hostname,
  ).replace(/garment-analysis$/, 'outfit-choice');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('La elección tardó demasiado.'));
    }, 10_000);
  });
  try {
    const request = async () => {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outfitChoiceInput.parse(input)),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('No se pudo consultar la IA.');
      const { index } = outfitChoiceOutput.parse(await response.json());
      if (index >= input.candidates.length)
        throw new Error('Opción fuera de la lista.');
      return index;
    };
    return await Promise.race([request(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
