import React, { useState } from 'react';
import { View } from 'react-native';
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

/** Step 3 — gentle close (peak-end). Commits the Reset. Supportive, no pressure. */
export function DoneScreen() {
  const { theme, tint } = useTheme();
  const { update, commit } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const [outcome, setOutcome] = useState<Outcome | undefined>();

  const save = () => {
    update({ outcome });
    commit();
    nav.navigate('Main', { screen: 'HomeTab' } as any);
  };

  return (
    <Screen scroll glow="teal" bottom={<Button label="Save" large onPress={save} disabled={!outcome} />}>
      <View style={{ alignItems: 'center', marginTop: spacing.xxxl, marginBottom: spacing.xl }}>
        <View style={{ width: 96, height: 96, borderRadius: radius.full, backgroundColor: tint(c.success, 0.12), borderWidth: 1.5, borderColor: tint(c.success, 0.5), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" color={c.success} size={40} strokeWidth={2.2} />
        </View>
      </View>
      <AppText size={28} weight="700" align="center">How’d it go?</AppText>
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
