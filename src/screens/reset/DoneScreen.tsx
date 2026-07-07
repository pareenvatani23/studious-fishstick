import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SelectableCard } from '../../components/SelectableCard';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing } from '../../theme/tokens';

type Outcome = 'done' | 'notyet';

const OPTIONS: { id: Outcome; title: string; sub: string }[] = [
  { id: 'done', title: 'I did it', sub: 'That counts. Small steps are how steadier days are built.' },
  { id: 'notyet', title: 'Not yet', sub: 'No shame — naming it is already a step. You can come back to it.' },
];

// rotating celebratory messages (varies each time)
const DONE_MSGS = [
  'You did it 🎉', 'That counts.', 'Nice one — proud of you.', 'Small step, real progress.',
  'You showed up. That matters.', 'One brave minute, done.', 'That’s the good stuff.', 'Look at you go 💛',
];

/** Step 3 — gentle close (peak-end). Commits the Reset. Supportive, no pressure. */
export function DoneScreen() {
  const { theme, tint, reduceMotion } = useTheme();
  const { commit, draft } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const toolDone = (draft.toolsUsed ?? []).some((t) => t.completed);
  const [outcome, setOutcome] = useState<Outcome | undefined>(toolDone ? 'done' : undefined);
  const msg = useRef(DONE_MSGS[Math.floor(Math.random() * DONE_MSGS.length)]).current;
  const pop = useRef(new Animated.Value(toolDone ? 0.6 : 1)).current;

  useEffect(() => {
    if (outcome === 'done' && !reduceMotion) {
      pop.setValue(0.5);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start();
    }
  }, [outcome, reduceMotion, pop]);

  const save = () => {
    commit({ outcome });
    nav.navigate('Main', { screen: 'HomeTab' } as any);
  };

  const celebrate = outcome === 'done';

  return (
    <Screen scroll glow="teal" bottom={<Button label="Save" large onPress={save} disabled={!outcome} />}>
      <View style={{ alignItems: 'center', marginTop: spacing.xxxl, marginBottom: spacing.xl }}>
        <Animated.View
          style={{
            width: 96, height: 96, borderRadius: radius.full,
            backgroundColor: tint(celebrate ? c.success : c.teal, 0.14),
            borderWidth: 1.5, borderColor: tint(celebrate ? c.success : c.teal, 0.55),
            alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: reduceMotion ? 1 : pop }],
          }}
        >
          <Icon name="check" color={celebrate ? c.success : c.teal} size={44} strokeWidth={2.3} />
        </Animated.View>
        {celebrate && (
          <AppText size={20} weight="700" color={c.success} align="center" style={{ marginTop: spacing.lg }}>{msg}</AppText>
        )}
      </View>
      <AppText size={celebrate ? 22 : 28} weight="700" align="center">{celebrate ? 'Reset complete.' : 'How’d it go?'}</AppText>
      <AppText size={15} color={c.text2} align="center" style={{ marginTop: spacing.md }}>
        Either answer is okay. This is for you, not a score.
      </AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
        {OPTIONS.map((o) => (
          <SelectableCard key={o.id} title={o.title} description={o.sub} selected={outcome === o.id} onPress={() => setOutcome(o.id)} />
        ))}
      </View>
    </Screen>
  );
}
