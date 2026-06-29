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
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { pullById } from '../../data/pulls';
import { responseById } from '../../data/responses';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Progress (design 20). Reflective, not performance pressure. */
export function ProgressScreen() {
  const { theme, tint } = useTheme();
  const { stats, mode } = useApp();
  const { start } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const startShift = () => {
    start();
    nav.navigate(mode === 'easy' ? 'EasyFeeling' : 'StartShift');
  };

  if (stats.totalShifts === 0) {
    return (
      <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
        <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Your shifts</AppText>
        <EmptyState
          icon="progress"
          title="No shifts yet"
          body="Your reflections will gather here — gently, just for you. Take your first small step whenever you're ready."
        >
          <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
            <Button label="Take your first shift" onPress={startShift} />
          </View>
        </EmptyState>
      </Screen>
    );
  }

  const topPull = stats.mostCommonPullId ? pullById(stats.mostCommonPullId)?.label : null;
  const topResponse = stats.mostChosenResponseId ? responseById(stats.mostChosenResponseId)?.label : null;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} bottom={<Button label="Plan next shift" onPress={startShift} />}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Your shifts</AppText>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
        <Stat value={String(stats.currentStreak)} label="Day streak" color={c.teal} />
        <Stat value={String(stats.totalShifts)} label="Total shifts" color={c.text1} />
        <Stat value={String(stats.actionsCompleted)} label="Actions done" color={c.success} />
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

      {(topPull || topResponse) && (
        <View style={{ marginTop: spacing.md, borderRadius: radius.xl, borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.28), backgroundColor: c.card, overflow: 'hidden' }}>
          <LinearGradient colors={[tint(c.lavender, 0.16), tint(c.teal, 0.08)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ padding: spacing.lg }}>
            <AppText size={12} weight="700" color={c.lavender} uppercase letterSpacing={0.6}>Insight</AppText>
            <AppText size={16} lineHeightMultiple={1.45} style={{ marginTop: spacing.sm }}>
              {topPull ? <>This week, <AppText size={16} weight="700">{topPull.toLowerCase()}</AppText> pulled you most often. </> : null}
              {topResponse ? <>Your strongest response was <AppText size={16} weight="700">{topResponse.toLowerCase()}</AppText>.</> : null}
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
