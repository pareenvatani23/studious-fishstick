import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useToolFinish } from '../../tools/toolFinish';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolUrgeSurf'>;

const TOTAL = 90; // seconds — long enough for most urges to crest and ease
const PROMPTS = [
  'Notice the urge. You don’t have to act on it — just watch it.',
  'Where do you feel it in your body? Let it be there.',
  'Urges rise like a wave… they always crest, then fall.',
  'Keep breathing. You’re riding it, not fighting it.',
  'Feel it starting to ease. You’re still here, still okay.',
];

export function UrgeSurfScreen({ route }: Props) {
  const { theme, tint, reduceMotion } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [left, setLeft] = useState(TOTAL);
  const wave = useRef(new Animated.Value(0.5)).current;
  const startedAt = useRef(0);
  const ticker = useRef<any>(null);

  const promptIdx = Math.min(PROMPTS.length - 1, Math.floor(((TOTAL - left) / TOTAL) * PROMPTS.length));

  useEffect(() => {
    if (phase !== 'running') return;
    startedAt.current = Date.now();
    if (!reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wave, { toValue: 0.5, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
    ticker.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { clearInterval(ticker.current); setPhase('done'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ticker.current);
  }, [phase, reduceMotion, wave]);

  const complete = () => {
    const seconds = startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : 0;
    finish(mode as any, { tool: 'urgesurf', seconds, completed: true });
  };

  if (phase === 'intro') {
    return (
      <Screen glow="lavender" center bottom={<Button label="Start" large onPress={() => setPhase('running')} />}>
        <View style={{ position: 'absolute', top: spacing.sm, left: 0 }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
        <View style={{ alignItems: 'center', gap: spacing.lg }}>
          <View style={{ width: 104, height: 104, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.12), borderWidth: 1.5, borderColor: tint(c.lavender, 0.5), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lines" color={c.lavender} size={44} />
          </View>
          <AppText size={26} weight="700" align="center">Ride the wave</AppText>
          <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5}>
            When an urge or craving feels strong, you don’t have to fight it or obey it. Watch it rise and pass,
            like a wave. It always eases. This takes about a minute and a half.
          </AppText>
        </View>
      </Screen>
    );
  }

  if (phase === 'done') {
    return (
      <Screen glow="teal" center bottom={<Button label="Done" large onPress={complete} />}>
        <View style={{ alignItems: 'center', gap: spacing.lg }}>
          <View style={{ width: 104, height: 104, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.12), borderWidth: 1.5, borderColor: tint(c.teal, 0.5), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" color={c.teal} size={46} strokeWidth={2.2} />
          </View>
          <AppText size={24} weight="700" align="center">The wave passed.</AppText>
          <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5}>
            You stayed with it and it eased — proof you’re stronger than the urge. Each time you surf one, the next gets easier.
          </AppText>
        </View>
      </Screen>
    );
  }

  const size = 200;
  return (
    <Screen glow="lavender" center bottom={<Button label="I’m okay now" variant="text" onPress={() => { clearInterval(ticker.current); setPhase('done'); }} />}>
      <View style={{ alignItems: 'center', gap: spacing.xxl }}>
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              width: size, height: size, borderRadius: radius.full,
              backgroundColor: tint(c.lavender, 0.14), borderWidth: 1.5, borderColor: tint(c.lavender, 0.4),
              transform: [{ scale: reduceMotion ? 1 : wave }],
            }}
          />
          <AppText size={30} weight="700" color={c.lavender} style={{ position: 'absolute' }}>{left}s</AppText>
        </View>
        <AppText size={18} weight="600" align="center" lineHeightMultiple={1.4} style={{ minHeight: 56 }}>{PROMPTS[promptIdx]}</AppText>
      </View>
    </Screen>
  );
}
