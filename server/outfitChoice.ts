import { createOpenAI } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import {
  outfitChoiceOutput,
  type OutfitChoiceInput,
} from '../src/ai/outfitChoiceContract';

export type OutfitChooser = (
  input: OutfitChoiceInput,
  signal: AbortSignal,
) => Promise<unknown>;

const criteria = `Elige el índice (desde cero) de una combinación existente.
1. Prioriza la ocasión y la comodidad térmica. Usa fitsOccasion, warmth (0–3), temperatura y lluvia; si llueve, prioriza calzado y capa marcados para lluvia.
2. Entre opciones igual de prácticas, favorece los estilos y colores explícitos de la persona y una paleta coherente. Evita mezclar varios colores de acento sin intención clara.
3. En empate, favorece prendas que quiere usar más y evita las usadas recientemente.
Usa únicamente los datos recibidos. No agregues prendas ni infieras género, materiales, gustos o características no indicadas. Si hay empate, elige el primer índice entre las opciones empatadas.`;

export const DEFAULT_OPENROUTER_OUTFIT_MODEL = 'anthropic/claude-sonnet-5.5';

const openRouterCompletion = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string(),
        message: z.object({ content: z.string() }),
      }),
    )
    .min(1),
});

export function createOpenRouterOutfitChooser(
  apiKey: string,
  model = DEFAULT_OPENROUTER_OUTFIT_MODEL,
  request = fetch,
): OutfitChooser {
  return async (input, signal) => {
    const response = await request(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: criteria },
            { role: 'user', content: JSON.stringify(input) },
          ],
          provider: { require_parameters: true, data_collection: 'deny' },
          reasoning: { effort: 'low', exclude: true },
          max_tokens: 512,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'outfit_choice',
              strict: true,
              schema: {
                type: 'object',
                properties: { index: { type: 'integer' } },
                required: ['index'],
                additionalProperties: false,
              },
            },
          },
        }),
      },
    );
    if (!response.ok) throw new Error('OpenRouter rechazó la solicitud.');
    const { choices } = openRouterCompletion.parse(await response.json());
    const choice = choices[0];
    if (choice.finish_reason !== 'stop') {
      throw new Error('OpenRouter no completó la elección.');
    }
    return JSON.parse(choice.message.content);
  };
}

export function createOpenAiOutfitChooser(
  apiKey: string,
  model: string,
): OutfitChooser {
  const openai = createOpenAI({ apiKey, baseURL: 'https://api.openai.com/v1' });
  return async (input, signal) => {
    const result = await generateText({
      model: openai.responses(model),
      instructions: criteria,
      prompt: JSON.stringify(input),
      output: Output.object({ schema: outfitChoiceOutput }),
      providerOptions: { openai: { store: false, reasoningEffort: 'none' } },
      maxOutputTokens: 100,
      maxRetries: 0,
      abortSignal: signal,
    });
    return result.output;
  };
}
