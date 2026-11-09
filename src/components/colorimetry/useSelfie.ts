import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { imageMimeTypeFromBase64 } from '../../ai/client';
import { cameraPermission, launchPicker } from '../item-editor/localPhoto';

/** The photo lives only in this hook's state: never stored, never sent anywhere. */
export function useSelfie() {
  const [uri, setUri] = useState<string>();
  const [error, setError] = useState('');
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function pick(camera: boolean) {
    setError('');
    try {
      if (camera) {
        const permission = await cameraPermission(() => active.current);
        if (!permission) return;
        if (!permission.granted) {
          setError(
            permission.canAskAgain
              ? 'Permite la cámara para tomar tu selfie.'
              : 'La cámara está bloqueada. Actívala en Ajustes o elige una foto.',
          );
          return;
        }
      }
      const result = await launchPicker(camera, true);
      if (!active.current || result.canceled) return;
      const { base64, uri: assetUri } = result.assets[0];
      setUri(
        Platform.OS === 'web' && base64
          ? `data:${imageMimeTypeFromBase64(base64)};base64,${base64}`
          : assetUri,
      );
    } catch {
      if (active.current)
        setError('No pudimos abrir esa foto. Prueba con otra.');
    }
  }
  return { uri, error, pick };
}
