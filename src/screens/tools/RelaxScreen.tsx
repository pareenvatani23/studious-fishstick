import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { SegmentedSteps } from '../../components/ProgressBar';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useToolFinish } from '../../tools/toolFinish';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolRelax'>;

// Progressive muscle relaxation — tense gently for a breath, then release.
const GROUPS: { area: string; hint: string }[] = [
  { area: 'hands and arms', hint: 'Make fists and tense your arms for a slow breath in… then let them fall loose as you breathe out.' },
  { area: 'shoulders and neck', hint: 'Lift your shoulders toward your ears, hold for a breath… then drop them and feel the space.' },
  { area: 'face and jaw', hint: 'Scrunch your face gently, hold… then release, letting your jaw soften.' },
  { area: 'chest and belly', hint: 'Take a full breath and tense your middle… then exhale slowly and let it all go.' },
  { area: 'legs and feet', hint: 'Point your toes and tense your legs for a breath… then release and feel them grow heavy.' },
];

export function RelaxScreen({ route }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const [i, setI] = useState(0);
  const startedAt = useRef(Date.now());
  const step = GROUPS[i];
  const last = i === GROUPS.length - 1;

  const next = () => {
    if (!last) { setI(i + 1); return; }
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    finish(mode as any, { tool: 'relax', seconds, completed: true });
  };

  return (
    <Screen glow="teal" bottom={<Button label={last ? 'Done' : 'Next'} large onPress={next} />}>
      <View style={{ marginTop: spacing.sm }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}>
        <SegmentedSteps total={GROUPS.length} current={i} />
      </View>
      <AppText size={13} weight="700" color={c.teal} uppercase letterSpacing={1}>Release the tension</AppText>
      <View style={{ alignItems: 'center', marginTop: spacing.xxxl }}>
        <View style={{ width: 112, height: 112, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.12), borderWidth: 1.5, borderColor: tint(c.teal, 0.5), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" color={c.teal} size={44} />
        </View>
        <AppText size={24} weight="700" align="center" style={{ marginTop: spacing.xxl }}>Your {step.area}</AppText>
        <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>{step.hint}</AppText>
        <AppText size={14} color={c.muted} align="center" style={{ marginTop: spacing.lg }}>Notice the difference between tense and relaxed.</AppText>
      </View>
    </Screen>
  );
}
