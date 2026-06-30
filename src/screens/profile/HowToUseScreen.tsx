import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { HowItWorksBody } from '../../components/HowItWorks';
import { spacing, sizing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HowToUse'>;

/** Re-openable explainer (from You → How TrueShift works). Same body as onboarding. */
export function HowToUseScreen({ navigation }: Props) {
  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} bottom={<Button label="Done" onPress={() => navigation.goBack()} />}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => navigation.goBack()} label="Go back" />
      </View>
      <AppText size={26} weight="700" style={{ marginBottom: spacing.lg }}>How TrueShift works</AppText>
      <HowItWorksBody />
    </Screen>
  );
}
