import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  COLOR_TEST_STEPS,
  COLOR_TONE_INFO,
  colorTestResult,
  colorTestStep,
  type ColorTone,
  type DrapeVote,
} from '../../domain';
import { Guide } from '../onboarding/Guide';
import { Button, useUI } from '../ui';
import { DrapeCompare } from './DrapeCompare';
import { useSelfie } from './useSelfie';
import { useCopy } from '../../i18n';

export function ToneSwatches({ colors }: { colors: string[] }) {
  const { palette } = useUI();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {colors.map((color) => (
        <View
          key={color}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: color,
            borderWidth: 1,
            borderColor: palette.swatchBorder,
          }}
        />
      ))}
    </View>
  );
}

function Intro({
  error,
  onPick,
}: {
  error: string;
  onPick: (camera: boolean) => void;
}) {
  const { s, palette } = useUI();
  const t = useCopy();
  const copy = t.colorTest;
  return (
    <>
      <Guide kind="scarf" say={copy.introSay} title={copy.introTitle} />
      <Text style={[s.subtitle, { fontSize: 14 }]}>
        {copy.steps(COLOR_TEST_STEPS)}
      </Text>
      <View style={[s.panel, { marginTop: 16 }]}>
        {copy.tips.map((tip) => (
          <Text key={tip} style={[s.subtitle, { fontSize: 13, marginTop: 4 }]}>
            · {tip}
          </Text>
        ))}
      </View>
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 14 }]}>
        {copy.privacy}
      </Text>
      <Button
        label={copy.takeSelfie}
        style={{ marginTop: 16 }}
        onPress={() => onPick(true)}
      />
      <Button
        secondary
        label={copy.choosePhoto}
        style={{ marginTop: 8 }}
        onPress={() => onPick(false)}
      />
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: palette.rust, fontSize: 12, marginTop: 12 }}
        >
          {error}
        </Text>
      ) : null}
    </>
  );
}

function Result({
  tone,
  confident,
  onUse,
  onRepeat,
}: {
  tone: ColorTone;
  confident: boolean;
  onUse: () => void;
  onRepeat: () => void;
}) {
  const { s } = useUI();
  const t = useCopy();
  const copy = t.colorTest;
  const info = COLOR_TONE_INFO[tone];
  return (
    <>
      <Guide kind="scarf" say={copy.resultSay} title={t.tones[tone].label} />
      <Text style={[s.subtitle, { fontSize: 14, marginBottom: 16 }]}>
        {t.tones[tone].description}
      </Text>
      <ToneSwatches colors={info.palette} />
      {confident ? null : (
        <Text style={[s.subtitle, { fontSize: 12, marginTop: 14 }]}>
          {copy.lowConfidence}
        </Text>
      )}
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 14 }]}>
        {copy.simulation}
      </Text>
      <Button
        label={copy.useColors}
        style={{ marginTop: 18 }}
        onPress={onUse}
      />
      <Button
        secondary
        label={t.styleGoal.repeatTest}
        style={{ marginTop: 8 }}
        onPress={onRepeat}
      />
    </>
  );
}

export function ColorTest({ onDone }: { onDone: (tone: ColorTone) => void }) {
  const selfie = useSelfie();
  const [votes, setVotes] = useState<DrapeVote[]>([]);
  if (!selfie.uri)
    return (
      <Intro
        error={selfie.error}
        onPick={(camera) => void selfie.pick(camera)}
      />
    );
  const result = colorTestResult(votes);
  if (result)
    return (
      <Result
        {...result}
        onUse={() => onDone(result.tone)}
        onRepeat={() => setVotes([])}
      />
    );
  const step = colorTestStep(votes)!;
  return (
    <DrapeCompare
      uri={selfie.uri}
      step={step}
      onVote={(vote) => setVotes((current) => [...current, vote])}
      onBack={
        votes.length
          ? () => setVotes((current) => current.slice(0, -1))
          : undefined
      }
    />
  );
}
