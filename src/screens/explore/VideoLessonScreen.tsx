import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { useLessons } from '../../store/Lessons';
import { voiceEnabled } from '../../ai/config';
import { synthesize } from '../../ai/elevenlabs';
import { radius, spacing, sizing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoLesson'>;

/**
 * Lesson detail — a readable CBT lesson with a spoken version (ElevenLabs via
 * the tts edge function, expo-speech fallback) and practical actions. "Try a
 * reset now" drops the reader into a reset.
 */
export function VideoLessonScreen({ route }: Props) {
  const { theme, tint } = useTheme();
  const { markLessonWatched } = useApp();
  const { start } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const { getById } = useLessons();
  const lesson = getById(route.params.lessonId);

  const [audio, setAudio] = useState<'idle' | 'preparing' | 'playing' | 'paused'>('idle');
  const soundRef = useRef<Audio.Sound | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => {
    if (lesson) markLessonWatched(lesson.id);
  }, [lesson, markLessonWatched]);

  // full spoken script: explicit voiceScript, else intro + sections + key idea
  const spoken = lesson
    ? lesson.voiceScript ||
      [lesson.intro, ...lesson.sections.map((s) => s.body), `The key idea: ${lesson.keyIdea}`].join(' ')
    : '';

  const stopAudio = useCallback(async () => {
    tokenRef.current += 1;
    Speech.stop();
    const s = soundRef.current;
    soundRef.current = null;
    if (s) { try { await s.unloadAsync(); } catch {} }
    setAudio('idle');
  }, []);

  const prepare = useCallback(async (text: string) => {
    if (!text) return;
    Speech.stop();
    if (soundRef.current) { const s = soundRef.current; soundRef.current = null; try { await s.unloadAsync(); } catch {} }
    const token = ++tokenRef.current;
    setAudio('preparing');
    try {
      if (voiceEnabled) {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const uri = await synthesize(text);
        if (token !== tokenRef.current) return;
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        if (token !== tokenRef.current) { try { await sound.unloadAsync(); } catch {} return; }
        soundRef.current = sound;
        setAudio('playing');
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) {
            sound.setStatusAsync({ shouldPlay: false, positionMillis: 0 }).catch(() => {});
            setAudio('paused');
          }
        });
        return;
      }
    } catch {
      if (token !== tokenRef.current) return;
    }
    if (token !== tokenRef.current) return;
    setAudio('playing');
    Speech.speak(text, { rate: 0.92, onDone: () => setAudio('paused'), onStopped: () => {} });
  }, []);

  const toggle = useCallback(async () => {
    if (audio === 'preparing') return;
    if (audio === 'playing') {
      if (soundRef.current) { try { await soundRef.current.pauseAsync(); } catch {} setAudio('paused'); }
      else { Speech.stop(); setAudio('paused'); }
      return;
    }
    if (audio === 'paused' && soundRef.current) {
      try { await soundRef.current.playAsync(); } catch {} setAudio('playing');
      return;
    }
    prepare(spoken);
  }, [audio, prepare, spoken]);

  useEffect(() => () => { stopAudio(); }, [stopAudio]);

  if (!lesson) {
    return (
      <Screen center>
        <AppText size={16} color={c.text2} align="center">Lesson not found.</AppText>
      </Screen>
    );
  }

  const takeAction = () => { stopAudio(); start(); nav.navigate('ResetSituation'); };

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }} bottom={<Button label="Try a reset now" onPress={takeAction} />}>
      <View style={{ marginTop: spacing.sm }}>
        <RoundIconButton icon="back" onPress={() => { stopAudio(); nav.goBack(); }} label="Go back" />
      </View>

      {/* header */}
      <View style={{ height: 120, borderRadius: radius.xl, marginTop: spacing.lg, overflow: 'hidden' }}>
        <LinearGradient colors={lesson.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.lg }}>
          <AppText size={12} weight="700" color={c.onAccent} uppercase letterSpacing={1} style={{ opacity: 0.85 }}>{lesson.category}</AppText>
          <AppText size={22} weight="700" color={c.onAccent} style={{ marginTop: 2 }}>{lesson.title}</AppText>
        </LinearGradient>
      </View>

      {/* listen control */}
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={audio === 'playing' ? 'Pause lesson' : 'Listen to lesson'}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.35), borderRadius: radius.lg, padding: spacing.md }}
      >
        <View style={{ width: 40, height: 40, borderRadius: radius.full, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' }}>
          {audio === 'preparing' ? <ActivityIndicator color={c.onAccent} size="small" /> : <Icon name={audio === 'playing' ? 'pause' : 'play'} color={c.onAccent} size={18} />}
        </View>
        <View style={{ flex: 1 }}>
          <AppText size={15} weight="600">{audio === 'preparing' ? 'Preparing voice…' : audio === 'playing' ? 'Playing — tap to pause' : 'Listen to this lesson'}</AppText>
          <AppText size={12} color={c.muted}>{lesson.durationLabel} read · calm voice</AppText>
        </View>
      </Pressable>

      {/* intro */}
      <AppText size={17} lineHeightMultiple={1.5} style={{ marginTop: spacing.xl }}>{lesson.intro}</AppText>

      {/* sections */}
      {lesson.sections.map((s, i) => (
        <View key={i} style={{ marginTop: spacing.xl }}>
          {s.heading ? <AppText size={16} weight="700" style={{ marginBottom: spacing.sm }}>{s.heading}</AppText> : null}
          <AppText size={16} color={c.text1} lineHeightMultiple={1.55}>{s.body}</AppText>
        </View>
      ))}

      {/* practical actions */}
      <Card style={{ marginTop: spacing.xxl }}>
        <AppText size={12} weight="700" color={c.teal} uppercase letterSpacing={0.8}>Try this</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {lesson.actions.map((a, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
              <View style={{ width: 22, height: 22, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.16), alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <AppText size={12} weight="700" color={c.teal}>{i + 1}</AppText>
              </View>
              <AppText size={15} lineHeightMultiple={1.45} style={{ flex: 1 }}>{a}</AppText>
            </View>
          ))}
        </View>
      </Card>

      {/* key idea */}
      <View style={{ marginTop: spacing.md, borderRadius: radius.xl, borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.3), backgroundColor: c.card, overflow: 'hidden' }}>
        <LinearGradient colors={[tint(c.lavender, 0.16), tint(c.teal, 0.08)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ padding: spacing.lg }}>
          <AppText size={12} weight="700" color={c.lavender} uppercase letterSpacing={0.8}>Key idea</AppText>
          <AppText size={17} weight="600" lineHeightMultiple={1.4} style={{ marginTop: spacing.sm }}>{lesson.keyIdea}</AppText>
        </View>
      </View>
    </Screen>
  );
}
