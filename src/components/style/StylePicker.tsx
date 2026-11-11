import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STYLE_OPTIONS, type StyleId } from '../../domain';
import { useFeedback } from '../Feedback';
import { Sheet } from '../Sheet';
import { Button, useUI } from '../ui';
import { WordChoice, wordTilt } from '../WordSticker';

const MAX_STYLES = 3;

/** Up to three styles, chosen as word stickers. A fourth is refused and says why. */
export function StylePicker({
  value,
  onChange,
  mark,
  prefix,
}: {
  value: StyleId[];
  onChange: (next: StyleId[]) => void;
  /** Goes before a chosen word, such as «✦» for a style the person wants to try. */
  mark?: string;
  /** Read before each word by assistive technology: «Estilo», «Quiero probar». */
  prefix: string;
}) {
  const { palette } = useUI();
  const feedback = useFeedback();
  const [full, setFull] = useState(false);
  return (
    <>
      <View style={styles.words}>
        {STYLE_OPTIONS.map((option, index) => {
          const selected = value.includes(option.id);
          return (
            <WordChoice
              key={option.id}
              word={option.label}
              mark={mark}
              tilt={wordTilt(index)}
              label={`${prefix} ${option.label}`}
              selected={selected}
              onPress={() => {
                if (!selected && value.length >= MAX_STYLES) {
                  setFull(true);
                  return;
                }
                feedback.selection();
                setFull(false);
                onChange(
                  selected
                    ? value.filter((id) => id !== option.id)
                    : [...value, option.id],
                );
              }}
            />
          );
        })}
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: full ? palette.rust : palette.muted,
          fontSize: 11,
          marginTop: 14,
        }}
      >
        {full ? 'Máximo 3. Quita uno para elegir otro.' : 'Hasta 3.'}
      </Text>
    </>
  );
}

/** How the person dresses now, on its own: opened from «Así me visto» in Mi estilo. */
export function StylesSheet({
  styleIds,
  onClose,
  onSave,
}: {
  styleIds: StyleId[];
  onClose: () => void;
  onSave: (styleIds: StyleId[]) => void;
}) {
  const [draft, setDraft] = useState(styleIds);
  return (
    <Sheet
      title="Así me visto"
      onClose={onClose}
      footer={<Button label="Guardar" onPress={() => onSave(draft)} />}
    >
      <View style={{ marginTop: 14 }}>
        <StylePicker value={draft} onChange={setDraft} prefix="Estilo" />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
