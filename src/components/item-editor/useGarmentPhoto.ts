import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { WardrobeItem } from '../../domain';
import { persistPhoto } from '../../storage/local';
import {
  analyzeGarmentPhoto,
  AiClientError,
  resolveAiApiUrl,
} from '../../ai/client';
import type { GarmentSuggestion } from '../../ai/contracts';
import {
  isSubjectCutoutAvailable,
  removeBackground,
} from '../../../modules/subject-cutout';
import {
  cameraPermission,
  launchPicker,
  localPhotoDataUrl,
} from './localPhoto';

export type GarmentPhoto = ReturnType<typeof useGarmentPhoto>;

/**
 * Photo, cutout and analysis state for the item editor. Each async job carries a number;
 * a result is ignored once a newer job started or the editor closed.
 */
export function useGarmentPhoto(item?: WardrobeItem) {
  const [photoUri, setPhotoUri] = useState(item?.photoUri);
  const [cutoutUri, setCutoutUri] = useState(item?.cutoutUri);
  const [cutoutSupported] = useState(isSubjectCutoutAvailable);
  const [cutting, setCutting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<GarmentSuggestion | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisNotice, setAnalysisNotice] = useState('');
  const active = useRef(true);
  const analysisJob = useRef(0);
  const photoJob = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      // Pending jobs check `active` before touching state.
      active.current = false;
      controller.current?.abort();
    };
  }, []);
  const isPhotoJob = (job: number) =>
    active.current && job === photoJob.current;
  const isAnalysisJob = (job: number) =>
    active.current && job === analysisJob.current;

  function cancelAnalysis() {
    analysisJob.current++;
    controller.current?.abort();
    controller.current = null;
    setAnalyzing(false);
    setSuggestion(null);
    setAnalysisError('');
    setAnalysisNotice('');
  }
  /** Stops photo and analysis work, for example when the editor is discarded. */
  function cancelAll() {
    photoJob.current++;
    cancelAnalysis();
  }
  async function pick(camera: boolean) {
    cancelAnalysis();
    const job = ++photoJob.current;
    setError('');
    setPermissionBlocked(false);
    setBusy(true);
    try {
      if (camera) {
        const permission = await cameraPermission(() => isPhotoJob(job));
        if (!permission) return;
        if (!permission.granted) {
          setPermissionBlocked(!permission.canAskAgain);
          setError(
            permission.canAskAgain
              ? 'Permite la cámara para tomar una foto.'
              : 'La cámara está bloqueada. Actívala en Ajustes o elige una foto.',
          );
          return;
        }
      }
      const result = await launchPicker(camera);
      if (!isPhotoJob(job) || result.canceled) return;
      const asset = result.assets[0];
      const persisted = await persistPhoto(
        asset.uri,
        asset.base64,
        asset.mimeType,
      );
      if (isPhotoJob(job)) {
        setPhotoUri(persisted);
        setCutoutUri(undefined);
      }
    } catch {
      if (isPhotoJob(job))
        setError(
          'No pudimos guardar la foto. Revisa el permiso o usa una imagen más pequeña; también puedes continuar sin foto.',
        );
    } finally {
      if (isPhotoJob(job)) setBusy(false);
    }
  }
  function remove() {
    cancelAll();
    setPhotoUri(undefined);
    setCutoutUri(undefined);
    setBusy(false);
  }
  async function cutBackground() {
    if (!photoUri) return;
    const job = photoJob.current;
    setCutting(true);
    setError('');
    try {
      const result = await removeBackground(photoUri);
      if (isPhotoJob(job)) setCutoutUri(result.uri);
    } catch (failure) {
      if (isPhotoJob(job))
        setError(
          failure instanceof Error
            ? failure.message
            : 'No pudimos quitar el fondo. Puedes usar la foto original.',
        );
    } finally {
      if (active.current) setCutting(false);
    }
  }
  /** Only this explicit action sends the photo to the local server and OpenAI. */
  async function analyze() {
    if (!photoUri) return;
    cancelAnalysis();
    const job = analysisJob.current;
    const abort = new AbortController();
    controller.current = abort;
    setAnalyzing(true);
    try {
      const apiUrl = resolveAiApiUrl(
        Platform.OS,
        process.env.EXPO_PUBLIC_AI_API_URL,
        Platform.OS === 'web' ? window.location.hostname : undefined,
      );
      const imageDataUrl = await localPhotoDataUrl(photoUri);
      if (!isAnalysisJob(job)) return;
      const result = await analyzeGarmentPhoto(imageDataUrl, {
        apiUrl,
        signal: abort.signal,
      });
      if (isAnalysisJob(job)) setSuggestion(result);
    } catch (failure) {
      const aborted =
        failure instanceof AiClientError && failure.code === 'aborted';
      if (isAnalysisJob(job) && !aborted)
        setAnalysisError(
          failure instanceof Error
            ? failure.message
            : 'No pudimos analizar la foto. Puedes completar los datos manualmente.',
        );
    } finally {
      if (isAnalysisJob(job)) {
        setAnalyzing(false);
        controller.current = null;
      }
    }
  }
  return {
    photoUri,
    cutoutUri,
    cutoutSupported,
    cutting,
    busy,
    error,
    setError,
    permissionBlocked,
    analyzing,
    suggestion,
    analysisError,
    analysisNotice,
    pick,
    remove,
    cutBackground,
    keepOriginal: () => setCutoutUri(undefined),
    analyze,
    cancelAnalysis,
    cancelAll,
    suggestionApplied() {
      setSuggestion(null);
      setAnalysisNotice(
        'Datos aplicados. Revisa los demás campos y guarda la prenda.',
      );
    },
  };
}
