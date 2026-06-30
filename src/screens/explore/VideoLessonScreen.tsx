import React, { useEffect } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { RoundIconButton } from '../../components/Header';
import { ReadAloudIconButton } from '../../components/ReadAloud';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { lessonById } from '../../data/lessons';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoLesson'>;

/**
 * Video Lesson Detail (design 19). Video supports action, not passive
 * scrolling. No bundled media in MVP — the player shows a placeholder. "Take
 * action now" drops the user into the daily loop.
 */
export function VideoLessonScreen({ route }: Props) {
  const { theme, tint } = useTheme();
  const { markLessonWatched } = useApp();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const lesson = lessonById(route.params.lessonId);

  useEffect(() => {
    if (lesson) markLessonWatched(lesson.id);
  }, [lesson, markLessonWatched]);

  if (!lesson) {
    return (
      <Screen center>
        <AppText size={16} color={c.text2} align="center">Lesson not found.</AppText>
      </Screen>
    );
  }

  const takeAction = () => {
    start();
    nav.navigate('ResetSituation');
  };

  return (
    <Screen scroll bottom={<Button label="Take action now" onPress={takeAction} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        <ReadAloudIconButton text={`${lesson.title}. ${lesson.summary}. Action prompt: ${lesson.actionPrompt}`} />
      </View>

      <View style={{ height: 200, borderRadius: radius.xl, marginTop: spacing.lg, overflow: 'hidden' }}>
        <LinearGradient colors={lesson.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: radius.full, backgroundColor: 'rgba(14,22,25,0.35)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" color="#FFFFFF" size={24} />
          </View>
          <View style={{ position: 'absolute', bottom: 12, right: 14, backgroundColor: 'rgba(14,22,25,0.6)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.sm }}>
            <AppText size={12} weight="600" color="#FFFFFF">{lesson.durationClock}</AppText>
          </View>
        </LinearGradient>
      </View>
      {!lesson.videoUri && (
        <AppText size={12} color={c.muted} align="center" style={{ marginTop: spacing.sm }}>Video coming soon · placeholder</AppText>
      )}

      <AppText size={23} weight="700" style={{ marginTop: spacing.lg }}>{lesson.title}</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
        <Chip label={lesson.durationLabel} intent="lavender" readOnly />
        <Chip label={lesson.category} intent="lavender" readOnly />
      </View>

      <AppText size={15} color={c.text2} lineHeightMultiple={1.55} style={{ marginTop: spacing.lg }}>{lesson.summary}</AppText>

      <View style={{ backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.3), borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg }}>
        <AppText size={12} weight="700" color={c.teal} uppercase letterSpacing={0.6}>Action prompt</AppText>
        <AppText size={15} lineHeightMultiple={1.4} style={{ marginTop: spacing.sm }}>{lesson.actionPrompt}</AppText>
      </View>
    </Screen>
  );
}
