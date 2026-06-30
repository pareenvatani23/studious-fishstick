import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing } from '../../theme/tokens';

/**
 * Calm on-ramp for a Reset (also the "Reset" tab). Minimal + slow. Begin →
 * the situation step. Honours Reduce Motion.
 */
export function StartResetScreen() {
  const { theme, reduceMotion, tint } = useTheme();
  const { start } = useResetFlow();
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
    nav.navigate('ResetSituation');
  };

  return (
    <Screen glow="teal" center bottom={<Button label="Begin" large onPress={begin} />}>
      {nav.canGoBack() && (
        <View style={{ position: 'absolute', top: spacing.sm, left: 0 }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
      )}
      <View style={{ alignItems: 'center', gap: spacing.xxl }}>
        <Animated.View style={{ width: 140, height: 140, borderRadius: radius.full, borderWidth: 1.5, borderColor: tint(c.teal, 0.4), alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ width: 90, height: 90, borderRadius: radius.full, backgroundColor: c.teal, transform: [{ scale: reduceMotion ? 1 : pulse }], opacity: reduceMotion ? 1 : pulse }} />
        </Animated.View>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <AppText size={30} weight="700">Take a moment.</AppText>
          <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5}>
            One small step is enough. You don’t need to fix the whole day.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
