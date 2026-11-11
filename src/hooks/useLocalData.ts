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
  /** The interface words it: the language may come from the document that failed to load. */
  const [loadError, setLoadError] = useState(false);
  function load() {
    return readLocalData()
      .then((stored) => {
        setData(stored || createLocalData());
        setHydrated(true);
      })
      .catch(() => setLoadError(true));
  }
  useEffect(() => {
    void load();
  }, []);
  function retry() {
    setLoadError(false);
    void load();
  }
  return { data, setData, hydrated, loadError, retry };
}
