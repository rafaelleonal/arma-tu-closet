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

const ROUND_TITLES = [
  'Primero, la temperatura',
  'Ahora, la intensidad',
  'Último ajuste',
];

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
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Elegir ${side}: ${drape.label}`}
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
        {drape.label}
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
          {ROUND_TITLES[step.round]}
        </Text>
        <Text style={{ color: palette.muted, fontSize: 12 }}>
          {step.index + 1} de {COLOR_TEST_STEPS}
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
        ¿Con cuál se ve tu piel más uniforme?
      </Text>
      <Text style={[s.subtitle, { fontSize: 12, marginTop: 6 }]}>
        Fíjate en ojeras, sombras y rojeces. Toca tu favorita.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <DrapePanel
          uri={uri}
          drape={step.pair[left]}
          side="izquierda"
          onPress={() => vote(left)}
        />
        <DrapePanel
          uri={uri}
          drape={step.pair[right]}
          side="derecha"
          onPress={() => vote(right)}
        />
      </View>
      <Button
        secondary
        label="No noto diferencia"
        style={{ marginTop: 14 }}
        onPress={() => vote('tie')}
      />
      {onBack ? (
        <Button
          secondary
          small
          label="Atrás"
          style={{ marginTop: 8 }}
          onPress={onBack}
        />
      ) : null}
    </MotionIn>
  );
}
