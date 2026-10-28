import { recordOutfitWorn, seedWardrobe, type Outfit } from '../domain';
import type { LocalData } from '../storage/local';
import type { Autosave } from '../hooks/useAutosave';
import type { UpdateData } from '../hooks/useLocalData';

/** Removes the example garments and the saved outfits that use them. */
export function withoutDemo(current: LocalData): LocalData {
  return {
    ...current,
    items: current.items.filter((item) => !item.isDemo),
    savedOutfits: current.savedOutfits.filter(
      (outfit) => !outfit.items.some((item) => item.isDemo),
    ),
  };
}

export function withDemo(current: LocalData): LocalData {
  return { ...current, items: seedWardrobe.map((item) => ({ ...item })) };
}

function localDay(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export type OutfitActions = ReturnType<typeof createOutfitActions>;

/** Saving and wearing an outfit are separate: only `worn` records use. */
export function createOutfitActions(
  data: LocalData,
  update: UpdateData,
  autosave: Autosave,
  closeOutfit: () => void,
) {
  const isSaved = (outfit: Outfit) =>
    data.savedOutfits.some((item) => item.id === outfit.id);
  return {
    isSaved,
    favorite(outfit: Outfit) {
      const saved = isSaved(outfit);
      update((current) => ({
        ...current,
        savedOutfits: saved
          ? current.savedOutfits.filter((item) => item.id !== outfit.id)
          : [outfit, ...current.savedOutfits],
      }));
      autosave.noticeAfterSave(
        saved ? 'Quitado de guardados.' : 'Conjunto guardado.',
      );
    },
    worn(outfit: Outfit) {
      const now = new Date().toISOString();
      const wear = recordOutfitWorn(data.items, outfit, now);
      closeOutfit();
      if (wear.status !== 'recorded') {
        autosave.setNotice(wear.message);
        return;
      }
      const today = localDay(now);
      if (
        data.wearHistory.some(
          (entry) => entry.id === outfit.id && localDay(entry.date) === today,
        )
      ) {
        autosave.setNotice('Este conjunto ya está registrado como usado hoy.');
        return;
      }
      update((current) => ({
        ...current,
        items: wear.wardrobe,
        wearHistory: [
          {
            id: outfit.id,
            itemIds: outfit.items.map((item) => item.id),
            date: now,
          },
          ...current.wearHistory,
        ].slice(0, 365),
      }));
      autosave.noticeAfterSave('Uso registrado.');
    },
  };
}
