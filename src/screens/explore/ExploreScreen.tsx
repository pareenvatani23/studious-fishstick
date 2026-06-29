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

/** Explore Library (design 18). Cards, never a feed. No likes/comments/autoplay. */
export function ExploreScreen() {
  const { theme } = useTheme();
  const nav = useRootNav();
  const c = theme.colors;
  const startHere = lessons.find((l) => l.startHere);

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Explore</AppText>

      {startHere && (
        <>
          <SectionLabel style={{ marginTop: spacing.xl }}>Start here</SectionLabel>
          <Pressable
            onPress={() => nav.navigate('VideoLesson', { lessonId: startHere.id })}
            accessibilityRole="button"
            accessibilityLabel={`${startHere.title}. ${startHere.durationLabel}, ${startHere.category}`}
            style={{ height: 140, borderRadius: radius.xl, marginTop: spacing.md, overflow: 'hidden' }}
          >
            <LinearGradient colors={startHere.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.lg }}>
              <AppText size={18} weight="700" color={c.onAccent}>{startHere.title}</AppText>
              <AppText size={13} color={c.onAccent} style={{ opacity: 0.75, marginTop: 3 }}>{startHere.durationLabel} · {startHere.category}</AppText>
            </LinearGradient>
          </Pressable>
        </>
      )}

      {exploreSections.map((section) => (
        <View key={section.title}>
          <SectionLabel style={{ marginTop: spacing.xl }}>{section.title}</SectionLabel>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {section.lessonIds.map((id) => {
              const lesson = lessons.find((l) => l.id === id);
              if (!lesson) return null;
              return <VideoLessonCard key={id} lesson={lesson} onPress={() => nav.navigate('VideoLesson', { lessonId: id })} />;
            })}
          </View>
        </View>
      ))}
    </Screen>
  );
}
