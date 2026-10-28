import { useEffect, useRef, useState } from 'react';
import { writeLocalData, type LocalData } from '../storage/local';
import { useFeedback } from '../components/Feedback';
import type { SetLocalData } from './useLocalData';

export type Autosave = ReturnType<typeof useAutosave>;

/**
 * Writes every change after the first load. Success notices wait for the write that carries
 * them, so a failed write is never shown as saved.
 */
export function useAutosave(
  data: LocalData | null,
  hydrated: boolean,
  setData: SetLocalData,
) {
  const { success } = useFeedback();
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const noticeOnSave = useRef('');
  const writeRevision = useRef(0);
  useEffect(() => {
    if (!hydrated || !data) return;
    const revision = ++writeRevision.current;
    const message = noticeOnSave.current;
    void writeLocalData(data)
      .then(() => {
        if (revision !== writeRevision.current) return;
        setSaveError('');
        if (message && noticeOnSave.current === message) {
          noticeOnSave.current = '';
          setNotice(message);
          success();
        }
      })
      .catch((error: unknown) => {
        if (revision === writeRevision.current)
          setSaveError(
            error instanceof Error
              ? `${error.message} Los últimos cambios siguen en esta pantalla. Reintenta antes de cerrarla.`
              : 'No se guardaron los últimos cambios. Revisa el espacio disponible y vuelve a intentar. Mantén esta pantalla abierta.',
          );
      });
  }, [data, hydrated, success]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
  return {
    saveError,
    notice,
    setNotice,
    /** Shows `message` once the change made in the same event is written. */
    noticeAfterSave(message: string) {
      noticeOnSave.current = message;
    },
    retrySave() {
      setData((current) => (current ? { ...current } : current));
    },
  };
}
