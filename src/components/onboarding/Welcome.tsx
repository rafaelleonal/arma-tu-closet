import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { seedWardrobe } from '../../domain';
import { MotionIn } from '../Feedback';
import { Button, useUI } from '../ui';
import { OnboardingLogo } from './OnboardingChrome';
import { WelcomeRail } from './WelcomeRail';

const RAIL_IDS = [
  'demo2-tee-gray',
  'demo2-shirt-denim',
  'demo2-tee-white',
  'demo2-jacket-denim',
  'demo2-sweater-navy',
];

export function Welcome({ onStart }: { onStart: () => void }) {
  const { s, palette } = useUI();
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: palette.paper }}
    >
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
            <WelcomeRail
              items={seedWardrobe.filter((item) => RAIL_IDS.includes(item.id))}
            />
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
              Conjuntos con la ropa de tu clóset, según el clima y la ocasión
              del día.
            </Text>
          </MotionIn>
        </View>
        <Button label="Empezar" onPress={onStart} />
        <Text
          style={[
            s.subtitle,
            { fontSize: 11, textAlign: 'center', marginTop: 14 },
          ]}
        >
          Sin cuenta. Tus datos se quedan en este dispositivo.
        </Text>
      </View>
    </SafeAreaView>
  );
}
