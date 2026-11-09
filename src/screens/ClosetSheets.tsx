import React from 'react';
import type { Context, WardrobeItem } from '../domain';
import type { LocalData } from '../storage/local';
import type { Autosave } from '../hooks/useAutosave';
import type { UpdateData } from '../hooks/useLocalData';
import { ItemEditor } from '../components/ItemEditor';
import { CombineGarmentSheet } from './CombineGarmentSheet';
import type { OutfitActions } from './actions';

type Editor = WardrobeItem | 'new' | null;

export function ClosetSheets({
  data,
  update,
  autosave,
  context,
  actions,
  editor,
  setEditor,
  combineItemId,
  setCombineItemId,
}: {
  data: LocalData;
  update: UpdateData;
  autosave: Autosave;
  context: Context;
  actions: OutfitActions;
  editor: Editor;
  setEditor: (editor: Editor) => void;
  combineItemId: string | null;
  setCombineItemId: (id: string | null) => void;
}) {
  if (editor) {
    return (
      <ItemEditor
        item={editor === 'new' ? undefined : editor}
        onClose={() => setEditor(null)}
        onCombine={(item) => setCombineItemId(item.id)}
        onSave={(item) => {
          update((current) => ({
            ...current,
            items: current.items.some((value) => value.id === item.id)
              ? current.items.map((value) =>
                  value.id === item.id ? item : value,
                )
              : [item, ...current.items],
          }));
          setEditor(null);
          autosave.noticeAfterSave('Listo, quedó guardada.');
        }}
      />
    );
  }
  if (!combineItemId) return null;
  return (
    <CombineGarmentSheet
      data={data}
      context={context}
      itemId={combineItemId}
      actions={actions}
      saveError={autosave.saveError}
      onClose={() => setCombineItemId(null)}
      onAdd={() => setEditor('new')}
      onNotice={autosave.setNotice}
    />
  );
}
