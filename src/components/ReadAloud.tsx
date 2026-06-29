import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon } from './icons';
import { spacing, radius, sizing } from '../theme/tokens';

/** Speak/stop helper around expo-speech. Read-aloud is offered on text-heavy screens. */
export function useSpeak() {
  const [speaking, setSpeaking] = useState(false);
  const speak = useCallback((text: string) => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, { onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), rate: 0.95 });
  }, []);
  const stop = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);
  const toggle = useCallback((text: string) => (speaking ? stop() : speak(text)), [speaking, speak, stop]);
  return { speaking, speak, stop, toggle };
}

/** Round icon button (44px) used in flow headers. */
export function ReadAloudIconButton({ text }: { text: string }) {
  const { theme } = useTheme();
  const { speaking, toggle } = useSpeak();
  return (
    <Pressable
      onPress={() => toggle(text)}
      accessibilityRole="button"
      accessibilityLabel={speaking ? 'Stop reading aloud' : 'Read this to me'}
      style={{
        width: sizing.minTap,
        height: sizing.minTap,
        borderRadius: radius.full,
        backgroundColor: theme.colors.card,
        borderWidth: theme.colors.borderWidth,
        borderColor: speaking ? theme.colors.lavender : theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="speaker" color={theme.colors.lavender} size={22} />
    </Pressable>
  );
}

/** Inline "Read this to me" text+icon row (used on onboarding). */
export function ReadAloudInline({ text, label = 'Read this to me' }: { text: string; label?: string }) {
  const { theme } = useTheme();
  const { speaking, toggle } = useSpeak();
  return (
    <Pressable
      onPress={() => toggle(text)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: sizing.minTap }}
    >
      <Icon name="speaker" color={theme.colors.text2} size={20} />
      <AppText size={15} color={theme.colors.text2}>{speaking ? 'Stop' : label}</AppText>
    </Pressable>
  );
}

export const ReadAloud = View; // placeholder export to keep import sites tidy
