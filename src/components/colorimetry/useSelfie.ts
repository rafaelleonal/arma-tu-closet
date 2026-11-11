import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { imageMimeTypeFromBase64 } from '../../ai/client';
import { cameraPermission, launchPicker } from '../item-editor/localPhoto';
import { useCopy } from '../../i18n';

/** The photo lives only in this hook's state: never stored, never sent anywhere. */
export function useSelfie() {
  const t = useCopy();
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
              ? t.colorTest.cameraDenied
              : t.photo.cameraBlocked,
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
      if (active.current) setError(t.colorTest.photoFailed);
    }
  }
  return { uri, error, pick };
}
