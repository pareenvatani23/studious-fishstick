import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Pressable, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { SectionLabel } from '../../components/Settings';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situationById } from '../../data/situations';
import { listReports, generateReport, reportDownloadUrl, type WeeklyReport } from '../../supabase/reports';
import { countStandaloneToolSessions } from '../../supabase/tools';
import { fetchRecentResonant } from '../../supabase/community';
import { radius, spacing, sizing } from '../../theme/tokens';

/** distinct days with a reset in the last `days` days. */
function activeDaysIn(resets: { date: string }[], days: number): number {
  const cutoff = Date.now() - days * 86400000;
  const set = new Set<string>();
  resets.forEach((r) => {
    const t = new Date(r.date).getTime();
    if (t >= cutoff) { const d = new Date(r.date); set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`); }
  });
  return set.size;
}

/**
 * Insights — reflective, not performance pressure. A gentle reminder, a
 * consistency read, stats, an AI thought map, patterns, history, and the
 * downloadable weekly report.
 */
export function ProgressScreen() {
  const { theme, tint } = useTheme();
  const { stats, resets, lessonsWatched, plan } = useApp();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [genBusy, setGenBusy] = useState(false);
  const [standaloneTools, setStandaloneTools] = useState(0);
  const [resonant, setResonant] = useState<string[]>([]);

  const loadReports = useCallback(() => { listReports().then(setReports).catch(() => {}); }, []);
  useEffect(() => {
    loadReports();
    countStandaloneToolSessions().then(setStandaloneTools).catch(() => {});
    fetchRecentResonant(4).then(setResonant).catch(() => {});
  }, [loadReports]);

  // tool practices: completed tool sessions inside resets + standalone sessions
  const toolPractices = resets.reduce((n, r) => n + (r.toolsUsed ?? []).filter((t) => t.completed).length, 0) + standaloneTools;

  const onGenerate = async () => {
    setGenBusy(true);
    const ok = await generateReport();
    setGenBusy(false);
    if (ok) loadReports();
  };

  const openReport = async (r: WeeklyReport) => {
    const url = await reportDownloadUrl(r.path);
    if (url) Linking.openURL(url).catch(() => {});
  };

  const startReset = () => {
    start();
    nav.navigate('ResetSituation');
  };

  // consistency read
  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; })();
  const resetToday = resets.some((r) => { const d = new Date(r.date); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayKey; });
  const active14 = activeDaysIn(resets, 14);
  const consistency = active14 >= 8 ? 'Strong' : active14 >= 3 ? 'Building' : 'Getting started';
  const consistencyNote = plan?.note
    || (active14 >= 8
      ? 'You’ve shown up often lately — that regularity is where the change compounds. Keep the rhythm.'
      : active14 >= 3
      ? 'You’re building a rhythm. A reset most days and the odd lesson is how it sticks.'
      : 'Little and often works best — aim for a short reset on most days and a lesson when you can.');

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
    <Screen scroll tabBar contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} bottom={<Button label="Start a reset" onPress={startReset} />}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Insights</AppText>

      {/* gentle in-app reminder */}
      {!resetToday && (
        <Pressable onPress={startReset} accessibilityRole="button" accessibilityLabel="Do today's reset">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, backgroundColor: tint(c.teal, 0.1), borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.4), borderRadius: radius.lg, padding: spacing.lg }}>
            <Icon name="bell" color={c.teal} size={20} />
            <AppText size={14} style={{ flex: 1 }}>You haven’t reset today — a two-minute check-in can steady things.</AppText>
            <Icon name="chevronRight" color={c.muted} size={18} />
          </View>
        </Pressable>
      )}

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
        <Stat value={String(stats.totalResets)} label="Resets" color={c.teal} />
        <Stat value={String(stats.actionsDone)} label="Steps taken" color={c.success} />
        <Stat value={String(stats.currentStreak)} label="Days in a row" color={c.lavender} />
      </View>

      {/* consistency / staying with the program */}
      <Card style={{ marginTop: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionLabel>Your consistency</SectionLabel>
          <View style={{ backgroundColor: tint(c.lavender, 0.14), paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full }}>
            <AppText size={12} weight="700" color={c.lavender}>{consistency}</AppText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md, alignItems: 'flex-start' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', height: 28 }}>
              <AppText size={22} weight="700" color={c.teal}>{active14}</AppText>
              <AppText size={13} color={c.muted}>/14</AppText>
            </View>
            <AppText size={12} color={c.muted}>Active days</AppText>
          </View>
          <View>
            <View style={{ height: 28, justifyContent: 'flex-end' }}>
              <AppText size={22} weight="700" color={c.lavender}>{lessonsWatched.length}</AppText>
            </View>
            <AppText size={12} color={c.muted}>Lessons learned</AppText>
          </View>
          <View>
            <View style={{ height: 28, justifyContent: 'flex-end' }}>
              <AppText size={22} weight="700" color={c.success}>{toolPractices}</AppText>
            </View>
            <AppText size={12} color={c.muted}>Tools used</AppText>
          </View>
        </View>
        <AppText size={14} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>{consistencyNote}</AppText>
      </Card>

      {/* what resonated from the community */}
      {resonant.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <SectionLabel>What resonated with you</SectionLabel>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {resonant.map((t, i) => (
              <View key={i} style={{ borderLeftWidth: 2, borderLeftColor: tint(c.lavender, 0.6), paddingLeft: spacing.md }}>
                <AppText size={14} color={c.text1} lineHeightMultiple={1.45}>“{t}”</AppText>
              </View>
            ))}
          </View>
          <AppText size={12} color={c.muted} style={{ marginTop: spacing.md }}>Messages you saved or found helpful — we weave these into your resets when it fits.</AppText>
        </Card>
      )}

      {/* weekly report — downloadable PDF */}
      <Card style={{ marginTop: spacing.md }}>
        <SectionLabel>Weekly report</SectionLabel>
        <AppText size={14} color={c.text2} lineHeightMultiple={1.45} style={{ marginTop: spacing.sm }}>
          A graphical summary of your week — thoughts, feelings, patterns and steps — as a PDF you can keep.
        </AppText>
        <View style={{ marginTop: spacing.md }}>
          <Button label={genBusy ? 'Building…' : 'Generate this week’s report'} variant="secondary" disabled={genBusy} onPress={onGenerate} />
          {genBusy && <ActivityIndicator color={c.teal} style={{ marginTop: spacing.sm }} />}
        </View>
        {reports.length > 0 && (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {reports.slice(0, 8).map((r) => (
              <Pressable key={r.id} onPress={() => openReport(r)} accessibilityRole="button" accessibilityLabel="Download report"
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
                <Icon name="lines" color={c.teal} size={18} />
                <AppText size={14} style={{ flex: 1 }}>
                  Week of {r.period_end ? new Date(r.period_end).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—'}
                </AppText>
                <AppText size={13} color={c.teal}>Download</AppText>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

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

      {/* Your resets — history */}
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        <SectionLabel>Your resets</SectionLabel>
      </View>
      <View style={{ gap: spacing.sm }}>
        {resets.slice(0, 12).map((r) => {
          const label = r.customSituation?.trim() || (r.situationId ? situationById(r.situationId)?.label : '') || 'A moment';
          const when = new Date(r.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
          const done = r.outcome === 'done';
          return (
            <Pressable
              key={r.id}
              onPress={() => nav.navigate('ResetDetail', { id: r.id })}
              accessibilityRole="button"
              accessibilityLabel={`${label}, ${when}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg }}
            >
              <View style={{ flex: 1 }}>
                <AppText size={15} weight="600" numberOfLines={1}>{label}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 }}>
                  <AppText size={12} color={c.muted}>{when}</AppText>
                  {r.emotion ? <AppText size={12} color={c.lavender}>· {r.emotion}</AppText> : null}
                  {done ? <AppText size={12} color={c.success}>· step done</AppText> : null}
                </View>
              </View>
              <Icon name="chevronRight" color={c.muted} size={18} />
            </Pressable>
          );
        })}
        {resets.length > 12 && (
          <AppText size={12} color={c.muted} style={{ marginTop: spacing.xs }}>Showing your 12 most recent.</AppText>
        )}
      </View>

      {/* Weekly */}
      <Card style={{ marginTop: spacing.lg }}>
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
