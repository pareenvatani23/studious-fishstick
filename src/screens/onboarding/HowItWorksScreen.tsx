import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SegmentedSteps } from '../../components/ProgressBar';
import { HowItWorksBody } from '../../components/HowItWorks';
import { spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HowItWorks'>;

export function HowItWorksScreen({ navigation }: Props) {
  return (
    <Screen scroll bottom={<Button label="Got it" onPress={() => navigation.navigate('TextSize')} />}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        <SegmentedSteps total={3} current={0} />
      </View>
      <AppText size={28} weight="700" style={{ marginBottom: spacing.lg }}>Here’s how it works.</AppText>
      <HowItWorksBody />
    </Screen>
  );
}
