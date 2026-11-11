import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import {
  COLOR_TEST_STEPS,
  type ColorTestStep,
  type Drape,
  type DrapeVote,
} from '../../domain';
import { MotionIn, useFeedback } from '../Feedback';
import { Button, useUI } from '../ui';
import { useCopy } from '../../i18n';

function DrapePanel({
  uri,
  drape,
  side,
  onPress,
}: {
  uri: string;
  drape: Drape;
  side: string;
  onPress: () => void;
}) {
  const { palette } = useUI();
  const t = useCopy();
  const name = t.drapes[drape.id as keyof typeof t.drapes] ?? drape.id;
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.colorTest.chooseSide(side, name)}
        onPress={onPress}
        style={{
          width: '100%',
          aspectRatio: 0.74,
          backgroundColor: drape.hex,
          borderRadius: 20,
          alignItems: 'center',
          paddingTop: 16,
          overflow: 'hidden',
        }}
      >
        <Image
          accessible={false}
          source={{ uri }}
          resizeMode="cover"
          style={{ width: '72%', aspectRatio: 0.8, borderRadius: 999 }}
        />
      </Pressable>
      <Text style={{ color: palette.muted, fontSize: 12, marginTop: 8 }}>
        {name}
      </Text>
    </View>
  );
}

/** Both drapes side by side, as in an in-person draping session. */
export function DrapeCompare({
  uri,
  step,
  onVote,
  onBack,
}: {
  uri: string;
  step: ColorTestStep;
  onVote: (vote: DrapeVote) => void;
  onBack?: () => void;
}) {
  const { s, palette } = useUI();
  const t = useCopy();
  const copy = t.colorTest;
  const feedback = useFeedback();
  const vote = (value: DrapeVote) => {
    feedback.selection();
    onVote(value);
  };
  const left = step.aOnLeft ? 'a' : 'b';
  const right = step.aOnLeft ? 'b' : 'a';
  return (
    <MotionIn trigger={step.index}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Text style={{ color: palette.muted, fontSize: 12 }}>
          {copy.rounds[step.round]}
        </Text>
        <Text style={{ color: palette.muted, fontSize: 12 }}>
          {t.outfit.pageCount(step.index + 1, COLOR_TEST_STEPS)}
        </Text>
      </View>
      <Text
        accessibilityRole="header"
        style={{
          color: palette.ink,
          fontSize: 22,
          lineHeight: 28,
          fontWeight: '600',
          letterSpacing: -0.5,
          marginTop: 10,
        }}
      >
        {copy.question}
      </Text>
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 6 }]}>
        {copy.questionHint}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <DrapePanel
          uri={uri}
          drape={step.pair[left]}
          side={copy.left}
          onPress={() => vote(left)}
        />
        <DrapePanel
          uri={uri}
          drape={step.pair[right]}
          side={copy.right}
          onPress={() => vote(right)}
        />
      </View>
      <Button
        secondary
        label={copy.tie}
        style={{ marginTop: 14 }}
        onPress={() => vote('tie')}
      />
      {onBack ? (
        <Button
          secondary
          small
          label={t.common.back}
          style={{ marginTop: 8 }}
          onPress={onBack}
        />
      ) : null}
    </MotionIn>
  );
}
