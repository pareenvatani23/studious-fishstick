import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SegmentedSteps } from '../../components/ProgressBar';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReadAloud'>;

export function ReadAloudScreen({ navigation }: Props) {
  const { theme, setReadAloud } = useTheme();
  const c = theme.colors;

  const choose = (on: boolean) => {
    setReadAloud(on);
    navigation.navigate('Privacy');
  };

  return (
    <Screen
      bottom={
        <View style={{ gap: spacing.md }}>
          <Button label="Yes, read to me" onPress={() => choose(true)} />
          <Button label="No thanks" variant="secondary" onPress={() => choose(false)} />
        </View>
      }
    >
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.xxl }}>
        <SegmentedSteps total={3} current={2} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 110, height: 110, borderRadius: radius.full, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xl }}>
          <Icon name="speaker" color={c.lavender} size={48} strokeWidth={1.7} />
        </View>
        <AppText size={27} weight="700" align="center" lineHeightMultiple={1.25}>Want me to read things out loud?</AppText>
        <AppText size={16} color={c.text2} align="center" style={{ marginTop: spacing.lg }}>You can change this anytime.</AppText>
      </View>
    </Screen>
  );
}
