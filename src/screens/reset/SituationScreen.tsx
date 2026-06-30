import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { FlowHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situations } from '../../data/situations';
import { radius, spacing, sizing } from '../../theme/tokens';

const READ = 'How heavy does it feel right now? Then, what happened? Tap the one that fits best.';

/**
 * Step 1 — concrete situation (replaces abstract "pulls"). Includes an optional
 * light "how heavy" check; if it's very heavy, we gently surface support
 * (severity-aware, per NICE stepped care). Tapping a situation advances
 * immediately — no extra Continue tap.
 */
export function SituationScreen() {
  const { theme, tint } = useTheme();
  const { draft, update } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const [heaviness, setHeaviness] = useState<number | undefined>(draft.heaviness);

  const pick = (id: string) => {
    update({ situationId: id });
    nav.navigate('ResetSupport');
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <FlowHeader progress={0.33} onBack={() => nav.goBack()} readAloudText={READ} />

      {/* optional heaviness check */}
      <AppText size={15} color={c.text2}>How heavy does it feel right now?</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = heaviness === n;
          return (
            <Pressable
              key={n}
              onPress={() => { setHeaviness(n); update({ heaviness: n }); }}
              accessibilityRole="button"
              accessibilityLabel={`Heaviness ${n} of 5`}
              accessibilityState={{ selected: on }}
              style={{ flex: 1, height: sizing.minTap, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? tint(c.teal, 0.16) : c.card, borderWidth: on ? 1.5 : c.borderWidth, borderColor: on ? c.teal : c.border }}
            >
              <AppText size={16} weight={on ? '700' : '500'} color={on ? c.teal : c.text2}>{n}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <AppText size={12} color={c.muted}>Light</AppText>
        <AppText size={12} color={c.muted}>Heavy</AppText>
      </View>

      {/* severity-aware gentle support */}
      {heaviness !== undefined && heaviness >= 4 && (
        <Pressable onPress={() => nav.navigate('CrisisResources')} accessibilityRole="button" accessibilityLabel="See urgent support options">
          <Card intent="accent" style={{ marginTop: spacing.lg, borderColor: tint(c.lavender, 0.4), flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <Icon name="heart" color={c.lavender} size={22} />
            <View style={{ flex: 1 }}>
              <AppText size={14} weight="600">That sounds like a lot to carry.</AppText>
              <AppText size={13} color={c.text2} lineHeightMultiple={1.4} style={{ marginTop: 2 }}>
                You can keep going here — and support is one tap away if you need it.
              </AppText>
            </View>
            <Icon name="chevronRight" color={c.muted} size={18} />
          </Card>
        </Pressable>
      )}

      <AppText size={26} weight="700" style={{ marginTop: spacing.xxl }}>What happened?</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }}>Tap the one that fits best.</AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {situations.map((s) => (
          <SelectableCard key={s.id} title={s.label} icon={s.icon} onPress={() => pick(s.id)} />
        ))}
      </View>
    </Screen>
  );
}
