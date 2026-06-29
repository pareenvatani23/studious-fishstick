import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';

/**
 * Start Shift (design 11). Doubles as the "Shift" tab and as a pushed flow
 * screen from Home Full. Minimal + calming. Begin → first real step
 * (Easy: feeling, Full: emotional pull).
 */
export function StartShiftScreen() {
  const { theme, reduceMotion, tint } = useTheme();
  const { mode } = useApp();
  const { start } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const pulse = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.85, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const begin = () => {
    start();
    nav.navigate(mode === 'easy' ? 'EasyFeeling' : 'EmotionalPull');
  };

  return (
    <Screen glow="teal" center bottom={<Button label="Begin" onPress={begin} />}>
      {nav.canGoBack() && (
        <View style={{ position: 'absolute', top: spacing.sm, left: 0 }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
      )}
      <View style={{ alignItems: 'center', gap: spacing.xxl }}>
        <Animated.View
          style={{
            width: 140,
            height: 140,
            borderRadius: radius.full,
            borderWidth: 1.5,
            borderColor: tint(c.teal, 0.4),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={{ width: 90, height: 90, borderRadius: radius.full, backgroundColor: c.teal, transform: [{ scale: reduceMotion ? 1 : pulse }], opacity: reduceMotion ? 1 : pulse }} />
        </Animated.View>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <AppText size={30} weight="700">Start your shift.</AppText>
          <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5}>
            Take one honest moment. You do not need to fix your whole day.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
