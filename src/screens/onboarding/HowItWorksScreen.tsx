import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SegmentedSteps } from '../../components/ProgressBar';
import { Icon, IconName, Accent } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HowItWorks'>;

const STEPS: { icon: IconName; title: string; sub: string; accent: Accent }[] = [
  { icon: 'eye', title: 'Notice', sub: 'what you feel.', accent: 'teal' },
  { icon: 'badgeCheck', title: 'Choose', sub: 'a calmer way.', accent: 'lavender' },
  { icon: 'arrowRight', title: 'Do', sub: 'one small thing.', accent: 'teal' },
];

export function HowItWorksScreen({ navigation }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;

  return (
    <Screen bottom={<Button label="Got it" onPress={() => navigation.navigate('TextSize')} />}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.xxl }}>
        <SegmentedSteps total={3} current={0} />
      </View>
      <AppText size={28} weight="700" lineHeightMultiple={1.2}>It's just 3 small steps.</AppText>
      <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
        {STEPS.map((s) => {
          const accent = s.accent === 'lavender' ? c.lavender : c.teal;
          return (
            <View key={s.title} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.xl, padding: spacing.lg }}>
              <View style={{ width: 60, height: 60, borderRadius: radius.lg, backgroundColor: tint(accent, 0.14), alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} color={accent} size={30} />
              </View>
              <View>
                <AppText size={20} weight="700">{s.title}</AppText>
                <AppText size={15} color={c.text2}>{s.sub}</AppText>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
