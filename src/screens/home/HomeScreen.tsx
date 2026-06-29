import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Icon } from '../../components/icons';
import { WaveMark } from '../../components/WaveMark';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav, greeting } from '../../navigation/hooks';
import { pullById } from '../../data/pulls';
import { lessons } from '../../data/lessons';
import { radius, spacing, sizing } from '../../theme/tokens';

/**
 * Home — branches on mode. Easy Home (08): one big Start button, plain copy.
 * Home Full (10): daily reset card + Quick reset + streak/top-pull + a
 * recommended 1-min lesson. The user knows what to do within 3 seconds.
 */
export function HomeScreen() {
  const { mode } = useApp();
  return mode === 'easy' ? <EasyHome /> : <FullHome />;
}

function EasyHome() {
  const { theme, tint } = useTheme();
  const { name, stats } = useApp();
  const { start } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const begin = () => {
    start();
    nav.navigate('EasyFeeling');
  };

  return (
    <Screen scroll glow="teal" contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={17} weight="600" color={c.text2} style={{ marginTop: spacing.sm }}>{greeting()}, {name}</AppText>
      <AppText size={30} weight="700" style={{ marginTop: 2 }}>How are you?</AppText>

      <View style={{ borderRadius: radius.xxl, padding: spacing.xxl, marginTop: spacing.xxl, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.28), backgroundColor: c.card, alignItems: 'center', overflow: 'hidden' }}>
        <LinearGradient colors={[tint(c.teal, 0.2), tint(c.lavender, 0.12)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ width: 72, height: 72, borderRadius: radius.full, backgroundColor: c.background, borderWidth: c.borderWidth, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <WaveMark size={56} />
        </View>
        <AppText size={22} weight="700" align="center" lineHeightMultiple={1.3}>Feeling pulled{'\n'}by something?</AppText>
        <Pressable
          onPress={begin}
          accessibilityRole="button"
          accessibilityLabel="Start a shift, about 3 minutes"
          style={{ height: 66, alignSelf: 'stretch', borderRadius: radius.xl, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl }}
        >
          <AppText size={20} weight="700" color={c.onAccent}>Start · 3 min</AppText>
        </Pressable>
      </View>

      <Pressable
        onPress={begin}
        accessibilityRole="button"
        accessibilityLabel="Just breathe, 1 minute"
        style={{ height: 60, borderRadius: radius.xl, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginTop: spacing.lg }}
      >
        <Icon name="breathe" color={c.lavender} size={22} />
        <AppText size={17} weight="600">Just breathe · 1 min</AppText>
      </Pressable>

      <AppText size={15} color={c.text2} align="center" style={{ marginTop: spacing.xxl }}>
        {stats.totalShifts > 0 ? 'Yesterday you took 1 small step. Nice.' : 'Your first step is waiting. No rush.'}
      </AppText>
    </Screen>
  );
}

function FullHome() {
  const { theme, tint } = useTheme();
  const { name, stats } = useApp();
  const { start } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const topPull = stats.mostCommonPullId ? pullById(stats.mostCommonPullId)?.label ?? '—' : '—';
  const recommended = lessons[1]; // "Silence is missing data" style micro-lesson
  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase();

  const begin = () => {
    start();
    nav.navigate('StartShift');
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} glow="teal">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <View>
          <AppText size={13} weight="600" color={c.muted} letterSpacing={0.5}>TODAY · {dateLabel}</AppText>
          <AppText size={26} weight="700">{greeting()}, {name}</AppText>
        </View>
        <Pressable onPress={() => nav.navigate('Main', { screen: 'YouTab' } as any)} accessibilityRole="button" accessibilityLabel="Open your profile" style={{ width: 42, height: 42, borderRadius: radius.full, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" color={c.text2} size={20} />
        </Pressable>
      </View>

      <View style={{ borderRadius: radius.xxl, padding: spacing.xxl, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.25), backgroundColor: c.card, overflow: 'hidden' }}>
        <LinearGradient colors={[tint(c.teal, 0.2), tint(c.lavender, 0.08)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <AppText size={12} weight="700" color={c.teal} uppercase letterSpacing={1}>Your daily reset</AppText>
        <AppText size={24} weight="700" lineHeightMultiple={1.25} style={{ marginTop: spacing.md }}>What pulled you today?</AppText>
        <Pressable onPress={begin} accessibilityRole="button" accessibilityLabel="Start a Shift" style={{ height: 54, borderRadius: radius.md + 2, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg }}>
          <AppText size={16} weight="600" color={c.onAccent}>Start a Shift</AppText>
        </Pressable>
        <Pressable onPress={begin} accessibilityRole="button" accessibilityLabel="Quick reset, 60 seconds" style={{ height: 46, borderRadius: radius.md + 2, backgroundColor: tint(c.text1, 0.06), borderWidth: c.borderWidth, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }}>
          <AppText size={15} color={c.text1}>Quick reset · 60 sec</AppText>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
        <Card style={{ flex: 1 }}>
          <AppText size={13} color={c.muted}>Current streak</AppText>
          <AppText size={26} weight="700" color={c.teal} style={{ marginTop: spacing.xs }}>{stats.currentStreak} <AppText size={14} color={c.text2}>{stats.currentStreak === 1 ? 'day' : 'days'}</AppText></AppText>
        </Card>
        <Card style={{ flex: 1 }}>
          <AppText size={13} color={c.muted}>Top pull this week</AppText>
          <AppText size={18} weight="700" color={c.lavender} style={{ marginTop: spacing.sm }}>{topPull}</AppText>
        </Card>
      </View>

      <Pressable onPress={() => nav.navigate('VideoLesson', { lessonId: recommended.id })} accessibilityRole="button" accessibilityLabel={`Recommended lesson: ${recommended.title}`} style={{ marginTop: spacing.md }}>
        <Card style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'center' }}>
          <View style={{ width: 52, height: 52, borderRadius: radius.md + 2, overflow: 'hidden' }}>
            <LinearGradient colors={recommended.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" color={c.onAccent} size={18} />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <AppText size={12} color={c.muted}>Recommended · {recommended.durationLabel}</AppText>
            <AppText size={15} weight="600" style={{ marginTop: 2 }}>{recommended.title}</AppText>
          </View>
          <Icon name="chevronRight" color={c.muted} size={18} />
        </Card>
      </Pressable>
    </Screen>
  );
}
