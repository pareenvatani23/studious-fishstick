import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SectionLabel } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situationById } from '../../data/situations';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Progress — reflective, not performance pressure. Mirrors what comes up most. */
export function ProgressScreen() {
  const { theme, tint } = useTheme();
  const { stats } = useApp();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const startReset = () => {
    start();
    nav.navigate('ResetSituation');
  };

  if (stats.totalResets === 0) {
    return (
      <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
        <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Your resets</AppText>
        <EmptyState
          icon="progress"
          title="Nothing here yet"
          body="Your resets gather here quietly — just for you. Take your first one whenever you’re ready."
        >
          <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
            <Button label="Start your first reset" onPress={startReset} />
          </View>
        </EmptyState>
      </Screen>
    );
  }

  const topSituation = stats.mostCommonSituationId ? situationById(stats.mostCommonSituationId)?.label : null;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} bottom={<Button label="Start a reset" onPress={startReset} />}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Your resets</AppText>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
        <Stat value={String(stats.totalResets)} label="Resets" color={c.teal} />
        <Stat value={String(stats.actionsDone)} label="Steps taken" color={c.success} />
        <Stat value={String(stats.currentStreak)} label="Days in a row" color={c.lavender} />
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <SectionLabel>This week</SectionLabel>
        <View style={{ gap: 11, marginTop: spacing.lg }}>
          {stats.weekly.map((d, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <AppText size={12} color={c.text2} style={{ width: 30 }}>{d.label}</AppText>
              <View style={{ flex: 1, height: 12, borderRadius: radius.sm, backgroundColor: c.elevated, overflow: 'hidden' }}>
                {d.value > 0 && (
                  <LinearGradient colors={[c.teal, c.lavender]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(8, d.value * 100)}%`, height: '100%', borderRadius: radius.sm }} />
                )}
              </View>
            </View>
          ))}
        </View>
      </Card>

      {topSituation && (
        <View style={{ marginTop: spacing.md, borderRadius: radius.xl, borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.28), backgroundColor: c.card, overflow: 'hidden' }}>
          <LinearGradient colors={[tint(c.lavender, 0.16), tint(c.teal, 0.08)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ padding: spacing.lg }}>
            <AppText size={12} weight="700" color={c.lavender} uppercase letterSpacing={0.6}>What comes up most</AppText>
            <AppText size={16} lineHeightMultiple={1.45} style={{ marginTop: spacing.sm }}>
              Lately, <AppText size={16} weight="700">{topSituation.toLowerCase()}</AppText> has come up most. Noticing the pattern is its own kind of progress.
            </AppText>
          </View>
        </View>
      )}
    </Screen>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  const { theme } = useTheme();
  return (
    <Card style={{ flex: 1 }}>
      <AppText size={26} weight="700" color={color}>{value}</AppText>
      <AppText size={12} color={theme.colors.muted} style={{ marginTop: 3 }}>{label}</AppText>
    </Card>
  );
}
