import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { VideoLessonCard } from '../../components/VideoLessonCard';
import { SectionLabel } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useLessons } from '../../store/Lessons';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Explore Library — a finite CBT reading library, AI-sorted for the user. */
export function ExploreScreen() {
  const { theme } = useTheme();
  const nav = useRootNav();
  const c = theme.colors;
  const { ranked, newCount } = useLessons();

  const startHere = ranked.find((l) => l.startHere);
  const forYou = ranked.filter((l) => !l.startHere);

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Explore</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.xs }}>
        Short, practical CBT lessons — ordered for you. Read, listen, then try it.
      </AppText>

      {newCount > 0 && (
        <View style={{ marginTop: spacing.md, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
          <AppText size={13} color={c.teal}>{newCount} new lesson{newCount > 1 ? 's' : ''} added</AppText>
        </View>
      )}

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

      <SectionLabel style={{ marginTop: spacing.xl }}>For you</SectionLabel>
      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        {forYou.map((lesson) => (
          <VideoLessonCard key={lesson.id} lesson={lesson} onPress={() => nav.navigate('VideoLesson', { lessonId: lesson.id })} />
        ))}
      </View>
    </Screen>
  );
}
