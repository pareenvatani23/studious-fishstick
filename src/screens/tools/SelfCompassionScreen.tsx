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

type Props = NativeStackScreenProps<RootStackParamList, 'ToolSelfCompassion'>;

// Kristin Neff's three-step self-compassion break, kept short and spoken plainly.
const STEPS: { label: string; line: string; hint: string }[] = [
  { label: 'Notice', line: 'This is a hard moment.', hint: 'Let yourself name the difficulty, without pushing it away. Say it softly to yourself.' },
  { label: 'You’re not alone', line: 'Hard moments are part of being human.', hint: 'So many people have stood where you are right now. This does not make you weak or broken.' },
  { label: 'Be kind', line: 'May I be gentle with myself.', hint: 'Place a hand on your chest if it helps. Offer yourself the words you’d give a good friend.' },
];

export function SelfCompassionScreen({ route }: Props) {
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
    finish(mode as any, { tool: 'selfcompassion', seconds, completed: true });
  };

  return (
    <Screen glow="lavender" bottom={<Button label={last ? 'Done' : 'Next'} large onPress={next} />}>
      <View style={{ marginTop: spacing.sm }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}>
        <SegmentedSteps total={STEPS.length} current={i} />
      </View>
      <AppText size={13} weight="700" color={c.lavender} uppercase letterSpacing={1}>A moment of self-kindness</AppText>
      <View style={{ alignItems: 'center', marginTop: spacing.xxxl }}>
        <View style={{ width: 112, height: 112, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.12), borderWidth: 1.5, borderColor: tint(c.lavender, 0.5), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="heart" color={c.lavender} size={46} />
        </View>
        <AppText size={13} weight="700" color={c.muted} uppercase letterSpacing={1} style={{ marginTop: spacing.xxl }}>{step.label}</AppText>
        <AppText size={24} weight="700" align="center" lineHeightMultiple={1.3} style={{ marginTop: spacing.sm }}>{step.line}</AppText>
        <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>{step.hint}</AppText>
      </View>
    </Screen>
  );
}
