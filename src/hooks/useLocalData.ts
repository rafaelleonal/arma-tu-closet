import { useEffect, useState } from 'react';
import {
  createLocalData,
  readLocalData,
  type LocalData,
} from '../storage/local';

export type SetLocalData = React.Dispatch<
  React.SetStateAction<LocalData | null>
>;
export type UpdateData = (fn: (current: LocalData) => LocalData) => void;

/** Reads the local document once. A failed read keeps what is stored and offers a retry. */
export function useLocalData() {
  const [data, setData] = useState<LocalData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState('');
  function load() {
    return readLocalData()
      .then((stored) => {
        setData(stored || createLocalData());
        setHydrated(true);
      })
      .catch(() =>
        setLoadError(
          'No pudimos abrir tus datos locales. No los reemplazamos. Intenta de nuevo; si persiste, conserva los datos del navegador o la app para poder recuperarlos.',
        ),
      );
  }
  useEffect(() => {
    void load();
  }, []);
  function retry() {
    setLoadError('');
    void load();
  }
  return { data, setData, hydrated, loadError, retry };
}
