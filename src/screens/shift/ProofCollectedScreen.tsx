import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SelectableCard } from '../../components/SelectableCard';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp, Outcome } from '../../store/AppState';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing } from '../../theme/tokens';

const OPTIONS: { id: Outcome; title: string; sub: string; success?: boolean }[] = [
  { id: 'done', title: 'Done', sub: 'You chose a steadier response. That counts.', success: true },
  { id: 'partly', title: 'Partly done', sub: 'Partial action still builds proof.' },
  { id: 'avoided', title: 'Avoided it', sub: 'No shame. Avoidance is a pattern, not a failure. Make it smaller.' },
];

/** Proof Collected (design 17). Supportive, not judgemental. Commits the shift. */
export function ProofCollectedScreen() {
  const { theme, tint } = useTheme();
  const { mode } = useApp();
  const { update, commit } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const [outcome, setOutcome] = useState<Outcome | undefined>();

  const save = () => {
    update({ outcome });
    commit(mode);
    nav.navigate('Main', { screen: 'HomeTab' } as any);
  };

  return (
    <Screen scroll glow="teal" bottom={<Button label="Save shift" onPress={save} disabled={!outcome} />}>
      <View style={{ alignItems: 'center', marginTop: spacing.xxxl, marginBottom: spacing.xl }}>
        <View style={{ width: 96, height: 96, borderRadius: radius.full, backgroundColor: tint(c.success, 0.12), borderWidth: 1.5, borderColor: tint(c.success, 0.5), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" color={c.success} size={40} strokeWidth={2.2} />
        </View>
      </View>
      <AppText size={28} weight="700" align="center">Proof collected?</AppText>
      <AppText size={15} color={c.text2} align="center" style={{ marginTop: spacing.md }}>How did it go?</AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
        {OPTIONS.map((o) => (
          <SelectableCard
            key={o.id}
            title={o.title}
            description={o.sub}
            intent={o.success ? 'teal' : 'lavender'}
            selected={outcome === o.id}
            onPress={() => setOutcome(o.id)}
          />
        ))}
      </View>
    </Screen>
  );
}
