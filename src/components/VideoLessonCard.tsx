import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon } from './icons';
import { Lesson } from '../data/lessons';
import { radius, spacing } from '../theme/tokens';

/**
 * VideoLessonCard — board component + Explore screen. Gradient thumbnail,
 * title, "duration · category" meta, optional "Try: …" action preview.
 * No likes/comments/feed affordances — this is a library item.
 */
export function VideoLessonCard({ lesson, onPress }: { lesson: Lesson; onPress?: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}. ${lesson.durationLabel}, ${lesson.category}`}
      style={{
        backgroundColor: c.card,
        borderWidth: c.borderWidth,
        borderColor: c.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        gap: spacing.lg,
        alignItems: 'center',
      }}
    >
      <View style={{ width: 72, height: 54, borderRadius: radius.md, overflow: 'hidden' }}>
        <LinearGradient colors={lesson.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" color={c.onAccent} size={18} />
        </LinearGradient>
      </View>
      <View style={{ flex: 1 }}>
        <AppText size={15} weight="600">{lesson.title}</AppText>
        <AppText size={12} color={c.muted} style={{ marginTop: 3 }}>{lesson.durationLabel} · {lesson.category}</AppText>
        {lesson.actionPreview && <AppText size={12} color={c.teal} style={{ marginTop: 4 }}>{lesson.actionPreview}</AppText>}
      </View>
    </Pressable>
  );
}
