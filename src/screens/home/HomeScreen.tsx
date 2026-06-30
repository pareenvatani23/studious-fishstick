import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { WaveMark } from '../../components/WaveMark';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav, greeting } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';

/**
 * Home — one clear thing to do. No modes, no dashboards. Greeting + a single
 * "Start a reset" hero + a gentle, pressure-free line about past resets.
 */
export function HomeScreen() {
  const { theme, tint } = useTheme();
  const { name, stats } = useApp();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const begin = () => {
    start();
    nav.navigate('ResetSituation');
  };

  return (
    <Screen scroll glow="teal" contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={17} weight="600" color={c.text2} style={{ marginTop: spacing.sm }}>{greeting()}, {name}</AppText>
      <AppText size={30} weight="700" style={{ marginTop: 2 }}>How are you?</AppText>

      <View style={{ borderRadius: radius.xxl, padding: spacing.xxl, marginTop: spacing.xxl, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.28), backgroundColor: c.card, alignItems: 'center', overflow: 'hidden' }}>
        <LinearGradient colors={[tint(c.teal, 0.2), tint(c.lavender, 0.12)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ width: 72, height: 72, borderRadius: radius.full, backgroundColor: c.background, borderWidth: c.borderWidth, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <WaveMark size={56} />
        </View>
        <AppText size={22} weight="700" align="center" lineHeightMultiple={1.3}>Something on{'\n'}your mind?</AppText>
        <Pressable
          onPress={begin}
          accessibilityRole="button"
          accessibilityLabel="Start a reset, about 3 minutes"
          style={{ height: 66, alignSelf: 'stretch', borderRadius: radius.xl, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl }}
        >
          <AppText size={20} weight="700" color={c.onAccent}>Start a reset · 3 min</AppText>
        </Pressable>
      </View>

      <AppText size={15} color={c.text2} align="center" style={{ marginTop: spacing.xxl }} lineHeightMultiple={1.5}>
        {stats.totalResets === 0
          ? 'Your first reset is here whenever you’re ready. No rush.'
          : `You’ve reset ${stats.totalResets} ${stats.totalResets === 1 ? 'time' : 'times'}. Steadier, one step at a time.`}
      </AppText>
    </Screen>
  );
}
