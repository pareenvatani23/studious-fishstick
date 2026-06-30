import React, { useMemo } from 'react';
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

/**
 * Insights — reflective, not performance pressure. Stats + an AI thought map
 * (keyword frequency) + recurring thinking patterns, built from tracked resets.
 */
export function ProgressScreen() {
  const { theme, tint } = useTheme();
  const { stats, resets } = useApp();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const startReset = () => {
    start();
    nav.navigate('ResetSituation');
  };

  // aggregate AI keywords + distortions
  const { keywordCloud, patterns } = useMemo(() => {
    const kw: Record<string, number> = {};
    const ds: Record<string, number> = {};
    resets.forEach((r) => {
      (r.keywords ?? []).forEach((k) => {
        const key = k.trim().toLowerCase();
        if (key) kw[key] = (kw[key] || 0) + 1;
      });
      const d = (r.distortion ?? '').trim();
      if (d) ds[d] = (ds[d] || 0) + 1;
    });
    const keywordCloud = Object.entries(kw).sort((a, b) => b[1] - a[1]).slice(0, 18);
    const patterns = Object.entries(ds).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { keywordCloud, patterns };
  }, [resets]);

  if (stats.totalResets === 0) {
    return (
      <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
        <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Insights</AppText>
        <EmptyState icon="progress" title="Nothing here yet" body="As you do resets, you’ll see your patterns here — the thoughts that come up and what helps. Just for you.">
          <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
            <Button label="Start your first reset" onPress={startReset} />
          </View>
        </EmptyState>
      </Screen>
    );
  }

  const topSituation = stats.mostCommonSituationId ? situationById(stats.mostCommonSituationId)?.label : null;
  const maxKw = keywordCloud.length ? keywordCloud[0][1] : 1;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} bottom={<Button label="Start a reset" onPress={startReset} />}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Insights</AppText>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
        <Stat value={String(stats.totalResets)} label="Resets" color={c.teal} />
        <Stat value={String(stats.actionsDone)} label="Steps taken" color={c.success} />
        <Stat value={String(stats.currentStreak)} label="Days in a row" color={c.lavender} />
      </View>

      {/* Thought map */}
      <Card style={{ marginTop: spacing.md }}>
        <SectionLabel>Your thought map</SectionLabel>
        {keywordCloud.length === 0 ? (
          <AppText size={14} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>
            The words behind your resets will gather here as you do a few more.
          </AppText>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'center' }}>
            {keywordCloud.map(([word, count]) => {
              const t = count / maxKw; // 0..1
              return (
                <View key={word} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.1 + t * 0.16), borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.3 + t * 0.3) }}>
                  <AppText size={13 + Math.round(t * 7)} weight={t > 0.5 ? '700' : '600'} color={c.lavender}>{word}</AppText>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Thinking patterns */}
      {patterns.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <SectionLabel>Patterns that recur</SectionLabel>
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {patterns.map(([name, count]) => (
              <View key={name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText size={15} style={{ flex: 1, textTransform: 'capitalize' }}>{name}</AppText>
                <View style={{ backgroundColor: tint(c.teal, 0.14), paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full }}>
                  <AppText size={12} weight="600" color={c.teal}>{count}×</AppText>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Weekly */}
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
