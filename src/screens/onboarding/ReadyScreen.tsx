import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Ready'>;

export function ReadyScreen(_: Props) {
  const { theme, tint } = useTheme();
  const { completeOnboarding } = useApp();
  const c = theme.colors;

  // completing onboarding flips onboarding_complete in the DB → the navigator
  // swaps to the main app group.
  return (
    <Screen glow="teal" center bottom={<Button label="Let's begin" onPress={completeOnboarding} />}>
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <View style={{ width: 120, height: 120, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.12), borderWidth: 1.5, borderColor: tint(c.teal, 0.5), alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <Icon name="check" color={c.teal} size={50} strokeWidth={2.2} />
        </View>
        <AppText size={30} weight="700">You're all set.</AppText>
        <AppText size={18} color={c.text1} align="center" lineHeightMultiple={1.5}>
          Open the app whenever something feels heavy. You name what’s on your
          mind; we help you see it more kindly and take one small step.
        </AppText>
        <AppText size={14} color={c.text2} align="center" lineHeightMultiple={1.5} style={{ marginTop: spacing.sm }}>
          Private by default, and only the gentlest of reminders. This is
          self-help — not therapy or a crisis service.
        </AppText>
      </View>
    </Screen>
  );
}
