import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  AiClientError,
  imageMimeTypeFromBase64,
  validateImageDataUrl,
} from '../../ai/client';
import { MAX_IMAGE_BYTES } from '../../ai/contracts';

/**
 * Asks for the camera only after the person taps Tomar foto. Returns null when the editor
 * moved on while waiting, so a closed editor never opens a system prompt.
 */
export async function cameraPermission(isCurrent: () => boolean) {
  let permission = await ImagePicker.getCameraPermissionsAsync();
  if (!isCurrent()) return null;
  if (!permission.granted && permission.canAskAgain)
    permission = await ImagePicker.requestCameraPermissionsAsync();
  return isCurrent() ? permission : null;
}

export function launchPicker(camera: boolean) {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.65,
    base64: Platform.OS === 'web',
    allowsEditing: false,
  };
  return camera
    ? ImagePicker.launchCameraAsync(options)
    : ImagePicker.launchImageLibraryAsync(options);
}

/** Reads a saved photo as a data URL for the analysis request, within the size limit. */
export async function localPhotoDataUrl(uri: string): Promise<string> {
  if (uri.startsWith('data:')) {
    validateImageDataUrl(uri);
    return uri;
  }
  if (Platform.OS === 'web' || !uri.startsWith('file://'))
    throw new AiClientError(
      'image',
      'Elige una foto local JPEG, PNG o WebP para analizar.',
    );
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || info.isDirectory)
    throw new AiClientError(
      'image',
      'No encontramos la foto en este dispositivo. Vuelve a elegirla.',
    );
  if (info.size > MAX_IMAGE_BYTES)
    throw new AiClientError(
      'image',
      'La foto supera 4 MiB. Elige una más pequeña para analizar.',
    );
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imageDataUrl = `data:${imageMimeTypeFromBase64(base64)};base64,${base64}`;
  validateImageDataUrl(imageDataUrl);
  return imageDataUrl;
}
