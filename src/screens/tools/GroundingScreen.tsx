import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { SegmentedSteps } from '../../components/ProgressBar';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useToolFinish } from '../../tools/toolFinish';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolGrounding'>;

const STEPS: { n: number; sense: string; hint: string }[] = [
  { n: 5, sense: 'see', hint: 'Look around and name five things you can see.' },
  { n: 4, sense: 'feel', hint: 'Notice four things you can physically feel.' },
  { n: 3, sense: 'hear', hint: 'Listen for three sounds around you.' },
  { n: 2, sense: 'smell', hint: 'Find two things you can smell.' },
  { n: 1, sense: 'taste', hint: 'Notice one thing you can taste.' },
];

export function GroundingScreen({ route }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const [i, setI] = useState(0);
  const startedAt = useRef(Date.now());
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const next = () => {
    if (!last) { setI(i + 1); return; }
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    finish(mode as any, { tool: 'grounding', seconds, completed: true });
  };

  return (
    <Screen glow="lavender" bottom={<Button label={last ? 'Done' : 'Next'} large onPress={next} />}>
      <View style={{ marginTop: spacing.sm }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}>
        <SegmentedSteps total={STEPS.length} current={i} />
      </View>
      <AppText size={13} weight="700" color={c.lavender} uppercase letterSpacing={1}>5-4-3-2-1 grounding</AppText>
      <View style={{ alignItems: 'center', marginTop: spacing.xxxl }}>
        <View style={{ width: 128, height: 128, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.12), borderWidth: 1.5, borderColor: tint(c.lavender, 0.5), alignItems: 'center', justifyContent: 'center' }}>
          <AppText size={54} weight="700" color={c.lavender}>{step.n}</AppText>
        </View>
        <AppText size={24} weight="700" style={{ marginTop: spacing.xxl }}>things you can {step.sense}</AppText>
        <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>{step.hint}</AppText>
        <AppText size={14} color={c.muted} align="center" style={{ marginTop: spacing.lg }}>Take your time. Notice each one slowly.</AppText>
      </View>
    </Screen>
  );
}
