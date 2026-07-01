import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Pressable, Animated, Easing, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { Icon } from '../../components/icons';
import { WaveMark } from '../../components/WaveMark';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situationById } from '../../data/situations';
import { aiEnabled, voiceEnabled } from '../../ai/config';
import { generateReset } from '../../ai/openai';
import { synthesize } from '../../ai/elevenlabs';
import { radius, spacing } from '../../theme/tokens';

/**
 * "Hear my reset" — the single support+voice screen the user lands on right
 * after picking a situation. Generates personalised content (validate → reframe
 * → step), shows it to read, and auto-plays it in the calm voice (ElevenLabs,
 * with expo-speech fallback). Crisis/moderation gated; static fallback if AI off.
 */
interface Content {
  validate: string;
  reframe: string;
  step: string;
  narration: string;
  keywords: string[];
  distortion: string;
  source: 'ai' | 'fallback';
}

export function NarrationScreen() {
  const { theme, tint, reduceMotion } = useTheme();
  const { resets } = useApp();
  const { draft, update } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const situation = situationById(draft.situationId ?? 'somethingElse')!;
  const label = draft.situationLabel || situation.label;

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Content | null>(null);
  const [audio, setAudio] = useState<'idle' | 'preparing' | 'playing' | 'paused'>('idle');
  const soundRef = useRef<Audio.Sound | null>(null);
  const tokenRef = useRef(0); // cancels stale synth requests (prevents double voice)
  const pulse = useRef(new Animated.Value(0.85)).current;

  const recent = {
    reframes: resets.map((r) => r.reframe).filter(Boolean) as string[],
    steps: resets.map((r) => r.actionText).filter(Boolean) as string[],
  };

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.85, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const stopAudio = useCallback(async () => {
    tokenRef.current += 1; // invalidate any in-flight synth
    Speech.stop();
    const s = soundRef.current;
    soundRef.current = null;
    if (s) { try { await s.unloadAsync(); } catch {} }
    setAudio('idle');
  }, []);

  /**
   * Synthesize (or speak) then play ONE instance. Token-guarded so a second
   * call while the first synth is in flight cancels the first — no double voice.
   * Shows a 'preparing' state while the audio downloads.
   */
  const prepare = useCallback(async (text: string) => {
    if (!text) return;
    // tear down any existing sound first
    Speech.stop();
    if (soundRef.current) { const s = soundRef.current; soundRef.current = null; try { await s.unloadAsync(); } catch {} }
    const token = ++tokenRef.current;
    setAudio('preparing');
    try {
      if (voiceEnabled) {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const uri = await synthesize(text);
        if (token !== tokenRef.current) return; // superseded
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        if (token !== tokenRef.current) { try { await sound.unloadAsync(); } catch {} return; }
        soundRef.current = sound;
        setAudio('playing');
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) { sound.setPositionAsync(0).catch(() => {}); setAudio('paused'); }
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

  const fallbackContent = useCallback((): Content => ({
    validate: situation.validate,
    reframe: situation.reframe,
    step: situation.actions[0].text,
    narration: `${situation.validate} ${situation.reframe} A small step: ${situation.actions[0].text}`,
    keywords: [],
    distortion: '',
    source: 'fallback',
  }), [situation]);

  const generate = useCallback(
    async (avoidR: string[], avoidS: string[]): Promise<Content | null> => {
      if (!aiEnabled) return fallbackContent();
      try {
        const r = await generateReset({
          situationLabel: label,
          customSituation: draft.customSituation,
          heaviness: draft.heaviness,
          emotion: draft.emotion,
          note: draft.note,
          avoidReframes: avoidR,
          avoidSteps: avoidS,
        });
        if (r.crisis) {
          nav.navigate('CrisisResources');
          return null;
        }
        return {
          validate: r.validate || situation.validate,
          reframe: r.reframe || situation.reframe,
          step: r.smallStep || situation.actions[0].text,
          narration: r.narration || `${r.validate} ${r.reframe} A small step: ${r.smallStep}`,
          keywords: r.keywords || [],
          distortion: r.distortion || '',
          source: 'ai',
        };
      } catch {
        return fallbackContent();
      }
    },
    [label, draft, nav, situation, fallbackContent]
  );

  const apply = useCallback((ct: Content) => {
    setContent(ct);
    update({ reframe: ct.reframe, actionText: ct.step, narration: ct.narration, keywords: ct.keywords, distortion: ct.distortion, aiGenerated: ct.source === 'ai' });
  }, [update]);

  // first generation + autoplay
  useEffect(() => {
    (async () => {
      setLoading(true);
      const ct = await generate(recent.reframes.slice(0, 6), recent.steps.slice(0, 6));
      if (ct) { apply(ct); setLoading(false); prepare(ct.narration); }
    })();
    return () => { stopAudio(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryAnother = async () => {
    if (!content) return;
    await stopAudio();
    setLoading(true);
    const ct = await generate([content.reframe, ...recent.reframes].slice(0, 6), [content.step, ...recent.steps].slice(0, 6));
    if (ct) { apply(ct); setLoading(false); prepare(ct.narration); }
  };

  const toggle = useCallback(async () => {
    if (audio === 'preparing') return; // ignore taps while downloading
    if (audio === 'playing') {
      if (soundRef.current) { try { await soundRef.current.pauseAsync(); } catch {} setAudio('paused'); }
      else { Speech.stop(); setAudio('paused'); }
      return;
    }
    if (audio === 'paused' && soundRef.current) {
      try { await soundRef.current.playAsync(); } catch {} setAudio('playing');
      return;
    }
    if (content) prepare(content.narration); // idle, or paused speech → (re)start
  }, [audio, content, prepare]);

  const cont = async () => { await stopAudio(); nav.navigate('ResetDone'); };

  if (loading || !content) {
    return (
      <Screen center glow="teal">
        <View style={{ alignItems: 'center', gap: spacing.xl }}>
          <View style={{ width: 96, height: 96, borderRadius: radius.full, borderWidth: 1.5, borderColor: tint(c.teal, 0.4), alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={c.teal} />
          </View>
          <AppText size={18} weight="600" color={c.text2}>Thinking with care…</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll glow="lavender" video bottom={<Button label="Continue" large onPress={cont} />}>
      <FlowHeader progress={0.7} onBack={() => { stopAudio(); nav.goBack(); }} />

      {/* play control */}
      <View style={{ alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.xl }}>
        <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={audio === 'playing' ? 'Pause voice' : audio === 'preparing' ? 'Preparing voice' : 'Play voice'}>
          <Animated.View style={{ width: 132, height: 132, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.12), borderWidth: 1.5, borderColor: tint(c.teal, 0.4), alignItems: 'center', justifyContent: 'center', transform: [{ scale: reduceMotion || audio !== 'playing' ? 1 : pulse }] }}>
            <WaveMark size={76} />
            <View style={{ position: 'absolute', bottom: -4, right: -4, width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' }}>
              {audio === 'preparing' ? (
                <ActivityIndicator color={c.onAccent} size="small" />
              ) : (
                <Icon name={audio === 'playing' ? 'pause' : 'play'} color={c.onAccent} size={18} />
              )}
            </View>
          </Animated.View>
        </Pressable>
        <AppText size={12} weight="700" color={audio === 'preparing' ? c.lavender : c.muted} uppercase letterSpacing={1} style={{ marginTop: spacing.md }}>
          {audio === 'preparing' ? 'Preparing voice…' : audio === 'playing' ? 'Playing' : 'Tap to hear it'}
        </AppText>
      </View>

      {/* readable content */}
      <AppText size={19} weight="700" lineHeightMultiple={1.4}>{content.validate}</AppText>

      <View style={{ marginTop: spacing.lg, borderRadius: radius.xxl, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.3), backgroundColor: c.card, padding: spacing.xl }}>
        <AppText size={12} weight="700" color={c.teal} uppercase letterSpacing={0.8} style={{ marginBottom: spacing.md }}>Another way to see it</AppText>
        <AppText size={17} lineHeightMultiple={1.45}>{content.reframe}</AppText>
      </View>

      <Card intent="accent" style={{ marginTop: spacing.md, borderColor: tint(c.teal, 0.3) }}>
        <AppText size={12} weight="700" color={c.muted} uppercase letterSpacing={0.8} style={{ marginBottom: spacing.sm }}>One small step</AppText>
        <AppText size={17} weight="600" lineHeightMultiple={1.35}>{content.step}</AppText>
      </Card>

      <Pressable onPress={tryAnother} accessibilityRole="button" accessibilityLabel="Try another" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, minHeight: 44 }}>
        <Icon name="shift" color={c.text2} size={16} />
        <AppText size={14} color={c.text2}>Try another</AppText>
      </Pressable>
    </Screen>
  );
}
