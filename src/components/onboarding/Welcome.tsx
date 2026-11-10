import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotionIn } from '../Feedback';
import { Dots } from '../rail';
import { Button, useUI } from '../ui';
import { Crew } from './Crew';
import { OnboardingLogo } from './OnboardingChrome';

export function Welcome({ onStart }: { onStart: () => void }) {
  const { s, palette } = useUI();
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: palette.paper }}
    >
      <Dots />
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 18,
        }}
      >
        <OnboardingLogo />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <MotionIn trigger="welcome">
            <Crew />
            <Text
              accessibilityRole="header"
              style={{
                fontSize: 44,
                lineHeight: 48,
                fontWeight: '600',
                letterSpacing: -2,
                color: palette.ink,
                marginTop: 40,
              }}
            >
              Arma tu outfit
            </Text>
            <Text
              style={[
                s.subtitle,
                { fontSize: 16, lineHeight: 24, marginTop: 14 },
              ]}
            >
              Tere, Cami y compañía te ayudan a elegir qué ponerte con la ropa
              que ya tienes.
            </Text>
          </MotionIn>
        </View>
        <Button
          label="Vamos a tu clóset"
          onPress={onStart}
          style={{ minHeight: 56, borderRadius: 28 }}
        />
        <Text
          style={[
            s.subtitle,
            { fontSize: 11, textAlign: 'center', marginTop: 14 },
          ]}
        >
          Sin cuenta. Tus datos se quedan en tu teléfono.
        </Text>
      </View>
    </SafeAreaView>
  );
}
