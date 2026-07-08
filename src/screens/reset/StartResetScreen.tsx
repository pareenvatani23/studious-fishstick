import React from 'react';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { useTheme } from '../../theme/ThemeContext';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing } from '../../theme/tokens';

/**
 * Calm on-ramp for a Reset (also the "Reset" tab). Minimal + slow. Begin →
 * the situation step. Shows the animated "settling tide" brand mark (falls back
 * to the static logo under Reduce Motion). Honours Reduce Motion.
 */
export function StartResetScreen() {
  const { theme, tint } = useTheme();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const begin = () => {
    start();
    nav.navigate('ResetSituation');
  };

  return (
    <Screen glow="teal" center tabBar video bottom={<Button label="Begin" large onPress={begin} />}>
      {nav.canGoBack() && (
        <View style={{ position: 'absolute', top: spacing.sm, left: 0 }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
      )}
      <View style={{ alignItems: 'center', gap: spacing.xxl }}>
        <View style={{ width: 148, height: 148, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.10), borderWidth: 1.5, borderColor: tint(c.teal, 0.35), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <AnimatedLogo size={132} />
        </View>
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
