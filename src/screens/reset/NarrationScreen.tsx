import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Pressable, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import { WaveMark } from '../../components/WaveMark';
import { useTheme } from '../../theme/ThemeContext';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { voiceEnabled } from '../../ai/config';
import { synthesize } from '../../ai/elevenlabs';
import { radius, spacing } from '../../theme/tokens';

/**
 * The "video": a personalised spoken message played over a breathing visual with
 * captions. Audio = ElevenLabs TTS when available, else expo-speech. Honours
 * Reduce Motion. ElevenLabs avatar VIDEO has no API yet — swap in later.
 */
export function NarrationScreen() {
  const { theme, tint, reduceMotion } = useTheme();
  const { draft } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const script = draft.narration || `${draft.reframe ?? ''} A small step: ${draft.actionText ?? ''}`.trim();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [prep, setPrep] = useState(true);
  const pulse = useRef(new Animated.Value(0.85)).current;

  // breathing animation
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

  const stopAll = useCallback(async () => {
    Speech.stop();
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
    setPlaying(false);
  }, []);

  const speakFallback = useCallback(() => {
    setPlaying(true);
    Speech.speak(script, { rate: 0.92, onDone: () => setPlaying(false), onStopped: () => setPlaying(false) });
  }, [script]);

  const start = useCallback(async () => {
    setPrep(true);
    try {
      if (voiceEnabled && script) {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const uri = await synthesize(script);
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        soundRef.current = sound;
        setPlaying(true);
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.isLoaded && s.didJustFinish) setPlaying(false);
        });
      } else {
        speakFallback();
      }
    } catch {
      speakFallback();
    } finally {
      setPrep(false);
    }
  }, [script, speakFallback]);

  useEffect(() => {
    start();
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async () => {
    if (playing) {
      await stopAll();
    } else if (soundRef.current) {
      await soundRef.current.replayAsync();
      setPlaying(true);
    } else {
      start();
    }
  };

  return (
    <Screen
      glow="lavender"
      bottom={
        <Button label="Continue" large onPress={async () => { await stopAll(); nav.navigate('ResetDone'); }} />
      }
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xxl }}>
        <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'} >
          <Animated.View style={{ width: 180, height: 180, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.12), borderWidth: 1.5, borderColor: tint(c.teal, 0.4), alignItems: 'center', justifyContent: 'center', transform: [{ scale: reduceMotion ? 1 : pulse }] }}>
            <WaveMark size={96} />
            <View style={{ position: 'absolute', bottom: -6, right: -6, width: 48, height: 48, borderRadius: radius.full, backgroundColor: c.teal, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={playing ? 'pause' : 'play'} color={c.onAccent} size={20} />
            </View>
          </Animated.View>
        </Pressable>

        <AppText size={12} weight="700" color={c.muted} uppercase letterSpacing={1}>
          {prep ? 'Preparing your message…' : playing ? 'Playing' : 'Your reset'}
        </AppText>

        {/* captions */}
        <AppText size={19} weight="600" align="center" lineHeightMultiple={1.5}>{script}</AppText>
      </View>
    </Screen>
  );
}
