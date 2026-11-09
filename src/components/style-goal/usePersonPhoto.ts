import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  AiClientError,
  analyzePersonPhoto,
  imageMimeTypeFromBase64,
  resolveAiApiUrl,
} from '../../ai/client';
import type { PersonStyleSuggestion } from '../../ai/personStyleContract';
import {
  cameraPermission,
  launchPicker,
  localPhotoDataUrl,
} from '../item-editor/localPhoto';

export type PersonPhoto = ReturnType<typeof usePersonPhoto>;

function failureMessage(failure: unknown): string {
  if (failure instanceof AiClientError) {
    if (failure.code === 'configuration')
      return 'El análisis no está disponible en esta versión. Usa las opciones a mano.';
    if (failure.code === 'network')
      return 'No pudimos conectar con el análisis. Reintenta o usa las opciones a mano.';
    if (failure.code === 'timeout')
      return 'El análisis tardó demasiado. Reintenta o usa las opciones a mano.';
    return failure.message;
  }
  return 'No pudimos analizar la foto. Usa las opciones a mano.';
}

/**
 * The photo lives only in this hook's state: it is never written to the local document.
 * Choosing a new one withdraws consent, so each photo needs its own permission.
 */
export function usePersonPhoto() {
  const [uri, setUri] = useState<string>();
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<PersonStyleSuggestion | null>(
    null,
  );
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const active = useRef(true);
  const job = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
    };
  }, []);
  const current = (id: number) => active.current && id === job.current;

  function reset() {
    job.current++;
    controller.current?.abort();
    controller.current = null;
    setAnalyzing(false);
    setSuggestion(null);
    setError('');
    setNotice('');
  }
  function clear() {
    reset();
    setUri(undefined);
    setConsent(false);
  }
  async function pick(camera: boolean) {
    clear();
    const id = job.current;
    try {
      if (camera) {
        const permission = await cameraPermission(() => current(id));
        if (!permission) return;
        if (!permission.granted) {
          setError(
            permission.canAskAgain
              ? 'Permite la cámara para tomar una foto.'
              : 'La cámara está bloqueada. Actívala en Ajustes o elige una foto.',
          );
          return;
        }
      }
      const result = await launchPicker(camera);
      if (!current(id) || result.canceled) return;
      const { base64, uri: assetUri } = result.assets[0];
      setUri(
        Platform.OS === 'web' && base64
          ? `data:${imageMimeTypeFromBase64(base64)};base64,${base64}`
          : assetUri,
      );
    } catch (failure) {
      if (current(id)) setError(failureMessage(failure));
    }
  }
  /** The only path that sends the photo; it refuses to run without consent. */
  async function analyze() {
    if (!uri || !consent) return;
    reset();
    const id = job.current;
    const abort = new AbortController();
    controller.current = abort;
    setAnalyzing(true);
    try {
      const apiUrl = resolveAiApiUrl(
        Platform.OS,
        process.env.EXPO_PUBLIC_AI_API_URL,
        Platform.OS === 'web' ? window.location.hostname : undefined,
      ).replace(/garment-analysis$/, 'person-style');
      const imageDataUrl = await localPhotoDataUrl(uri);
      if (!current(id)) return;
      const result = await analyzePersonPhoto(imageDataUrl, {
        apiUrl,
        signal: abort.signal,
      });
      if (current(id)) setSuggestion(result);
    } catch (failure) {
      const aborted =
        failure instanceof AiClientError && failure.code === 'aborted';
      if (current(id) && !aborted) setError(failureMessage(failure));
    } finally {
      if (current(id)) {
        setAnalyzing(false);
        controller.current = null;
      }
    }
  }
  return {
    uri,
    consent,
    setConsent,
    analyzing,
    suggestion,
    error,
    notice,
    pick,
    clear,
    analyze,
    cancel: reset,
    /** Drops the photo as soon as its result has been accepted. */
    applied() {
      clear();
      setNotice('Datos aplicados. Corrige lo que haga falta y guarda.');
    },
  };
}
