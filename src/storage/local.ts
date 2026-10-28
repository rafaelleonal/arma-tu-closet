import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { parseLocalData, serializeLocalData, type LocalData } from './schema';
export type {
  LocalData,
  Preferences,
  Profile,
  Appearance,
  ThemeId,
  OnboardingProgress,
} from './schema';
export { createDefaultProfile, createDefaultAppearance, createLocalData } from './schema';
const KEY = '@arma-tu-outfit/v1';
let writes: Promise<void> = Promise.resolve();
export async function readLocalData(): Promise<LocalData | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  return parseLocalData(raw);
}
export async function writeLocalData(data: LocalData): Promise<void> {
  const payload = serializeLocalData(data, Platform.OS === 'web');
  const next = writes.catch(() => undefined).then(() => AsyncStorage.setItem(KEY, payload));
  writes = next;
  return next;
}
export async function persistPhoto(
  uri: string,
  base64?: string | null,
  mimeType?: string | null,
): Promise<string> {
  if (Platform.OS === 'web') {
    if (!base64)
      throw new Error(
        'No pudimos guardar esta imagen. Elige otra foto o agrega la prenda sin foto.',
      );
    if (base64.length > 2_000_000)
      throw new Error(
        'La foto es demasiado grande para este prototipo web. Elige una imagen más pequeña o agrega la prenda sin foto.',
      );
    return `data:${mimeType || 'image/jpeg'};base64,${base64}`;
  }
  if (!FileSystem.documentDirectory)
    throw new Error('No se encontró el almacenamiento local para la foto.');
  const directory = `${FileSystem.documentDirectory}wardrobe/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const path = `${directory}${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: path });
  return path;
}
