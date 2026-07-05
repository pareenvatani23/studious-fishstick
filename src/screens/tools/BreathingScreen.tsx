import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useToolFinish } from '../../tools/toolFinish';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolBreathing'>;

type Phase = [label: string, seconds: number, target: 'in' | 'out' | 'hold'];
const PATTERNS: Record<string, { name: string; phases: Phase[]; cycles: number }> = {
  box: { name: 'Box breathing', phases: [['Breathe in', 4, 'in'], ['Hold', 4, 'hold'], ['Breathe out', 4, 'out'], ['Hold', 4, 'hold']], cycles: 5 },
  '478': { name: '4-7-8 breathing', phases: [['Breathe in', 4, 'in'], ['Hold', 7, 'hold'], ['Breathe out', 8, 'out']], cycles: 4 },
  paced: { name: 'Paced breathing', phases: [['Breathe in', 4, 'in'], ['Breathe out', 6, 'out']], cycles: 6 },
};

export function BreathingScreen({ route }: Props) {
  const { theme, tint, reduceMotion } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const variant = (route.params?.variant && PATTERNS[route.params.variant]) ? route.params.variant : 'box';
  const pattern = PATTERNS[variant];

  const steps = useMemo(() => {
    const arr: Phase[] = [];
    for (let i = 0; i < pattern.cycles; i++) pattern.phases.forEach((p) => arr.push(p));
    return arr;
  }, [pattern]);

  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0][1]);
  const [done, setDone] = useState(false);
  const scale = useRef(new Animated.Value(0.6)).current;
  const startedAt = useRef<number>(0);
  const timer = useRef<any>(null);
  const ticker = useRef<any>(null);

  const cycle = Math.floor(idx / pattern.phases.length) + 1;

  useEffect(() => {
    if (!running || done) return;
    if (idx >= steps.length) { complete(true); return; }
    const [, dur, target] = steps[idx];
    setSecondsLeft(dur);
    if (!reduceMotion && target !== 'hold') {
      Animated.timing(scale, { toValue: target === 'in' ? 1 : 0.6, duration: dur * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
    }
    let left = dur;
    ticker.current = setInterval(() => { left -= 1; setSecondsLeft(Math.max(0, left)); }, 1000);
    timer.current = setTimeout(() => setIdx((i) => i + 1), dur * 1000);
    return () => { clearTimeout(timer.current); clearInterval(ticker.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, idx, done]);

  const start = () => { startedAt.current = Date.now(); setRunning(true); };

  const complete = (completed: boolean) => {
    if (done) return;
    setDone(true);
    clearTimeout(timer.current); clearInterval(ticker.current);
    const seconds = Math.round((Date.now() - (startedAt.current || Date.now())) / 1000);
    finish(mode as any, { tool: 'breathing', variant, seconds, completed });
  };

  const label = done ? 'Done' : running ? steps[Math.min(idx, steps.length - 1)][0] : 'Ready when you are';

  return (
    <Screen center glow="teal">
      <View style={{ position: 'absolute', top: spacing.lg, left: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <View style={{ alignItems: 'center', gap: spacing.xxl }}>
        <AppText size={22} weight="700">{pattern.name}</AppText>
        <Animated.View style={{ width: 220, height: 220, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.1), borderWidth: 2, borderColor: tint(c.teal, 0.5), alignItems: 'center', justifyContent: 'center', transform: [{ scale: reduceMotion ? 1 : scale }] }}>
          <AppText size={22} weight="600" color={c.teal}>{label}</AppText>
          {running && !done && <AppText size={40} weight="700" color={c.text1} style={{ marginTop: spacing.sm }}>{secondsLeft}</AppText>}
        </Animated.View>
        {running && !done && <AppText size={14} color={c.muted}>Cycle {Math.min(cycle, pattern.cycles)} of {pattern.cycles}</AppText>}
      </View>
      <View style={{ position: 'absolute', bottom: spacing.xxl, left: spacing.lg, right: spacing.lg, gap: spacing.md }}>
        {!running ? (
          <Button label="Start" large onPress={start} />
        ) : (
          <Button label="Finish" variant="secondary" onPress={() => complete(true)} />
        )}
      </View>
    </Screen>
  );
}
