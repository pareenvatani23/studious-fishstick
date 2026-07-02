import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { VideoLessonCard } from '../../components/VideoLessonCard';
import { SectionLabel } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { lessons, exploreSections } from '../../data/lessons';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Explore Library — a finite CBT reading library. Cards, never a feed. */
export function ExploreScreen() {
  const { theme } = useTheme();
  const nav = useRootNav();
  const c = theme.colors;
  const startHere = lessons.find((l) => l.startHere);

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Explore</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.xs }}>
        Short, practical CBT lessons. Read, listen, then try it.
      </AppText>

      {startHere && (
        <>
          <SectionLabel style={{ marginTop: spacing.xl }}>Start here</SectionLabel>
          <Pressable
            onPress={() => nav.navigate('VideoLesson', { lessonId: startHere.id })}
            accessibilityRole="button"
            accessibilityLabel={`${startHere.title}. ${startHere.durationLabel}, ${startHere.category}`}
            style={{ minHeight: 140, borderRadius: radius.xl, marginTop: spacing.md, overflow: 'hidden' }}
          >
            <LinearGradient colors={startHere.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.lg }}>
              <AppText size={18} weight="700" color={c.onAccent}>{startHere.title}</AppText>
              <AppText size={13} color={c.onAccent} style={{ opacity: 0.85, marginTop: 3 }}>{startHere.summary}</AppText>
              <AppText size={12} color={c.onAccent} style={{ opacity: 0.7, marginTop: 6 }}>{startHere.durationLabel} · {startHere.category}</AppText>
            </LinearGradient>
          </Pressable>
        </>
      )}

      {exploreSections.map((section) => {
        const items = lessons.filter((l) => l.category === section.category && !l.startHere);
        if (items.length === 0) return null;
        return (
          <View key={section.title}>
            <SectionLabel style={{ marginTop: spacing.xl }}>{section.title}</SectionLabel>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              {items.map((lesson) => (
                <VideoLessonCard key={lesson.id} lesson={lesson} onPress={() => nav.navigate('VideoLesson', { lessonId: lesson.id })} />
              ))}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
