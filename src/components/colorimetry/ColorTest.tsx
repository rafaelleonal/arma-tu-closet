import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
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

const TIPS = [
  'Luz natural, de frente a una ventana.',
  'Sin filtros y con poco maquillaje.',
  'Acércate: que tu cara llene la foto, con el cabello hacia atrás.',
];

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
  return (
    <>
      <Guide
        kind="scarf"
        say="Soy Bufi, la bufanda. Comparemos colores junto a tu cara."
        title="Tu colorimetría"
      />
      <Text style={[s.subtitle, { fontSize: 14 }]}>
        Son 9 comparaciones rápidas, como en una prueba con telas.
      </Text>
      <View style={[s.panel, { marginTop: 16 }]}>
        {TIPS.map((tip) => (
          <Text key={tip} style={[s.subtitle, { fontSize: 13, marginTop: 4 }]}>
            · {tip}
          </Text>
        ))}
      </View>
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 14 }]}>
        Tu foto no sale del teléfono y no se guarda.
      </Text>
      <Button
        label="Tomar selfie"
        style={{ marginTop: 16 }}
        onPress={() => onPick(true)}
      />
      <Button
        secondary
        label="Elegir una foto"
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
  const info = COLOR_TONE_INFO[tone];
  return (
    <>
      <Guide
        kind="scarf"
        say="Según lo que elegiste, eres…"
        title={info.label}
      />
      <Text style={[s.subtitle, { fontSize: 14, marginBottom: 16 }]}>
        {info.description}
      </Text>
      <ToneSwatches colors={info.palette} />
      {confident ? null : (
        <Text style={[s.subtitle, { fontSize: 12, marginTop: 14 }]}>
          Salió muy parejo. Si puedes, repítela con mejor luz.
        </Text>
      )}
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 14 }]}>
        Es una simulación: depende de la luz, la foto y tu pantalla.
      </Text>
      <Button
        label="Usar mis colores"
        style={{ marginTop: 18 }}
        onPress={onUse}
      />
      <Button
        secondary
        label="Repetir la prueba"
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
