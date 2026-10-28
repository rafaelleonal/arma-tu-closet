import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, useUI } from '../ui';

export const STEP_NAMES = ['Tu estilo', 'Colores', 'Tu rutina', 'Apariencia'];
export const LAST_STEP = STEP_NAMES.length - 1;

export function OnboardingLogo() {
  const { palette } = useUI();
  return (
    <Text
      style={{
        fontSize: 37,
        lineHeight: 44,
        fontWeight: '700',
        letterSpacing: -4,
        color: palette.ink,
        paddingRight: 6,
      }}
    >
      a.
    </Text>
  );
}

/** Logo, step counter, optional close and the progress bar. */
export function StepHeader({
  step,
  onClose,
}: {
  step: number;
  onClose?: () => void;
}) {
  const { palette } = useUI();
  const total = STEP_NAMES.length;
  return (
    <View
      style={{
        width: '100%',
        maxWidth: 660,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 18,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <OnboardingLogo />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Text style={{ color: palette.muted, fontSize: 11 }}>
            {step + 1} de {total}
          </Text>
          {onClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar personalización"
              onPress={onClose}
              style={{
                minHeight: 44,
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: palette.ink, fontSize: 12 }}>Cerrar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View
        accessibilityLabel={`Paso ${step + 1} de ${total}`}
        style={{ flexDirection: 'row', gap: 6, marginTop: 17 }}
      >
        {STEP_NAMES.map((label, index) => (
          <View
            key={label}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: index <= step ? palette.ink : palette.line,
            }}
          />
        ))}
      </View>
    </View>
  );
}

/** Every step is optional: Ahora no and Continuar both move on. */
export function StepFooter({
  step,
  onGo,
}: {
  step: number;
  onGo: (step: number) => void;
}) {
  const { palette } = useUI();
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.paper,
        paddingHorizontal: 24,
        paddingVertical: 15,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 612,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {step > 0 ? (
          <Button secondary label="Atrás" onPress={() => onGo(step - 1)} />
        ) : null}
        {step < LAST_STEP ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => onGo(step + 1)}
              style={{
                flex: 1,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, color: palette.muted }}>
                Ahora no
              </Text>
            </Pressable>
            <Button
              label="Continuar"
              onPress={() => onGo(step + 1)}
              style={{ flex: 1 }}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}
