import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STYLE_IDS, type StyleId } from '../../domain';
import { useCopy } from '../../i18n';
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
  const t = useCopy();
  const feedback = useFeedback();
  const [full, setFull] = useState(false);
  return (
    <>
      <View style={styles.words}>
        {STYLE_IDS.map((id, index) => {
          const selected = value.includes(id);
          const word = t.styles[id].label;
          return (
            <WordChoice
              key={id}
              word={word}
              mark={mark}
              tilt={wordTilt(index)}
              label={`${prefix} ${word}`}
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
                    ? value.filter((style) => style !== id)
                    : [...value, id],
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
        {full ? t.styleBoard.full : t.itemEditor.upToThree}
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
  const t = useCopy();
  return (
    <Sheet
      title={t.styleBoard.current}
      onClose={onClose}
      footer={<Button label={t.common.save} onPress={() => onSave(draft)} />}
    >
      <View style={{ marginTop: 14 }}>
        <StylePicker
          value={draft}
          onChange={setDraft}
          prefix={t.styleBoard.stylePrefix}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
