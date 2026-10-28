import { requireOptionalNativeModule } from 'expo';

interface SubjectCutoutNative {
  isAvailable(): boolean;
  removeBackground(
    uri: string,
    maxSide: number,
  ): Promise<{ uri: string; width: number; height: number }>;
}

// Absent in Expo Go, web and Android: callers hide the action instead of failing.
const native =
  requireOptionalNativeModule<SubjectCutoutNative>('SubjectCutout');

export function isSubjectCutoutAvailable(): boolean {
  try {
    return !!native?.isAvailable();
  } catch {
    return false;
  }
}

/** On-device background removal; resolves to a transparent PNG in the app's documents. */
export async function removeBackground(
  uri: string,
  maxSide = 1200,
): Promise<{ uri: string; width: number; height: number }> {
  if (!native)
    throw new Error(
      'Quitar fondo no está disponible en esta versión de la app.',
    );
  try {
    return await native.removeBackground(uri, maxSide);
  } catch (error) {
    // Expo prefixes native errors with "Calling the 'removeBackground' function has failed → Caused by:"; keep only the reason.
    const reason =
      error instanceof Error
        ? error.message.split('Caused by:').pop()?.trim()
        : undefined;
    throw new Error(reason || 'No pudimos quitar el fondo de esta foto.');
  }
}
