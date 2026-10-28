import React, { useRef, useState } from 'react';
import { View, type ScrollViewInstance } from 'react-native';
import type { Category, WardrobeItem } from '../domain';
import { useFeedback } from './Feedback';
import { Sheet } from './Sheet';
import { Button, useUI } from './ui';
import {
  defaultWarmth,
  itemFormErrors,
  itemFormFingerprint,
  suggestedItemName,
} from './itemForm';
import { DetailsSection, type Details } from './item-editor/DetailsSection';
import {
  AvailabilityField,
  CategoryField,
  ColorsField,
  DiscardPrompt,
  NameField,
} from './item-editor/FormFields';
import { PhotoSection } from './item-editor/PhotoSection';
import { useGarmentPhoto } from './item-editor/useGarmentPhoto';

/** A new item starts without a color so a default is never saved by accident. */
function initialForm(item?: WardrobeItem) {
  if (!item)
    return {
      id: `item-${Date.now()}`,
      name: '',
      category: 'top' as Category,
      colors: [] as string[],
      details: {
        occasions: ['casual'],
        warmth: defaultWarmth('top'),
        rainReady: false,
        styleIds: [],
      } as Details,
      available: true,
      isDemo: false,
    };
  const { occasions, warmth, rainReady, styleIds = [] } = item;
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    colors: item.colors,
    details: { occasions, warmth, rainReady, styleIds } as Details,
    available: item.available,
    isDemo: !!item.isDemo,
  };
}

export function ItemEditor({
  item,
  onSave,
  onClose,
}: {
  item?: WardrobeItem;
  onSave: (item: WardrobeItem) => void;
  onClose: () => void;
}) {
  const { palette } = useUI();
  const { reduceMotion } = useFeedback();
  const scroll = useRef<ScrollViewInstance>(null);
  const fieldY = useRef({ colors: 0, details: 0 });
  const [initial] = useState(() => initialForm(item));
  const [submitted, setSubmitted] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [colors, setColors] = useState<string[]>(initial.colors);
  const [details, setDetails] = useState(initial.details);
  const warmthChosen = useRef(!!item);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [available, setAvailable] = useState(initial.available);
  const photo = useGarmentPhoto(item);
  const draft: WardrobeItem = {
    ...item,
    ...details,
    id: initial.id,
    name: name.trim() || suggestedItemName(category, colors),
    category,
    colors,
    available,
    photoUri: photo.photoUri,
    cutoutUri: photo.photoUri ? photo.cutoutUri : undefined,
    isDemo: initial.isDemo,
  };
  const [initialFingerprint] = useState(() => itemFormFingerprint(draft));
  const errors = itemFormErrors(draft);
  const scrollTo = (y: number) =>
    scroll.current?.scrollTo({ y, animated: !reduceMotion });

  function discardAndClose() {
    photo.cancelAll();
    onClose();
  }
  function closeEditor() {
    if (itemFormFingerprint(draft) === initialFingerprint) {
      discardAndClose();
      return;
    }
    setConfirmClose(true);
    scrollTo(0);
  }
  function chooseCategory(value: Category) {
    setCategory(value);
    if (!warmthChosen.current)
      setDetails((current) => ({ ...current, warmth: defaultWarmth(value) }));
  }
  function save() {
    setSubmitted(true);
    if (errors.colors) return scrollTo(fieldY.current.colors);
    if (errors.occasions) {
      setDetailsOpen(true);
      return scrollTo(fieldY.current.details);
    }
    photo.cancelAnalysis();
    onSave(draft);
  }
  return (
    <Sheet
      title={item ? 'Editar prenda' : 'Agregar prenda'}
      onClose={closeEditor}
      scrollRef={scroll}
    >
      {confirmClose ? (
        <DiscardPrompt
          onKeep={() => setConfirmClose(false)}
          onDiscard={discardAndClose}
        />
      ) : null}
      <PhotoSection
        draft={draft}
        photo={photo}
        onApply={(confirmed) => {
          setName(confirmed.name);
          chooseCategory(confirmed.category);
          setColors([...confirmed.colors]);
        }}
      />
      <CategoryField value={category} onChange={chooseCategory} />
      <View
        onLayout={(event) => {
          fieldY.current.colors = event.nativeEvent.layout.y;
        }}
      >
        <ColorsField
          value={colors}
          onChange={setColors}
          error={submitted ? errors.colors : undefined}
        />
      </View>
      <NameField
        value={name}
        onChange={setName}
        category={category}
        colors={colors}
      />
      {item ? (
        <AvailabilityField value={available} onChange={setAvailable} />
      ) : null}
      <View
        onLayout={(event) => {
          fieldY.current.details = event.nativeEvent.layout.y;
        }}
        style={{ marginTop: 24, borderTopWidth: 1, borderColor: palette.line }}
      >
        <DetailsSection
          value={details}
          onChange={(patch) =>
            setDetails((current) => ({ ...current, ...patch }))
          }
          onWarmthChosen={() => {
            warmthChosen.current = true;
          }}
          open={detailsOpen}
          onToggle={() => setDetailsOpen((open) => !open)}
          occasionError={submitted ? errors.occasions : undefined}
        />
      </View>
      <Button
        label={item ? 'Guardar cambios' : 'Agregar prenda'}
        disabled={photo.busy}
        style={{ marginTop: 26 }}
        onPress={save}
      />
    </Sheet>
  );
}
