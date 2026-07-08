import React, { useRef, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useToolFinish } from '../../tools/toolFinish';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolWorry'>;

const WHENS = ['This evening', 'Tomorrow', 'In an hour'];

/**
 * Worry postponement — write the worry down and choose a set time to return to
 * it, so your mind can let it go for now (evidence-based for rumination/GAD).
 */
export function WorryScreen({ route }: Props) {
  const { theme, tint, scale } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const [text, setText] = useState('');
  const [when, setWhen] = useState(WHENS[0]);
  const [parked, setParked] = useState(false);
  const startedAt = useRef(Date.now());

  const park = () => setParked(true);
  const done = () => {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    finish(mode as any, { tool: 'worry', seconds, completed: true, payload: { worry: text.trim(), when } });
  };

  if (parked) {
    return (
      <Screen glow="teal" center bottom={<Button label="I’ve let it go for now" large onPress={done} />}>
        <View style={{ alignItems: 'center', gap: spacing.lg }}>
          <View style={{ width: 104, height: 104, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.12), borderWidth: 1.5, borderColor: tint(c.teal, 0.5), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" color={c.teal} size={46} strokeWidth={2.2} />
          </View>
          <AppText size={24} weight="700" align="center">It’s parked.</AppText>
          <AppText size={16} color={c.text2} align="center" lineHeightMultiple={1.5}>
            You’ve set it aside until {when.toLowerCase()}. It’ll still be there if it matters — so your mind
            doesn’t need to hold it right now. Let it rest.
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll bottom={<Button label="Park it" large disabled={!text.trim()} onPress={park} />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginTop: spacing.sm }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
        <AppText size={26} weight="700" style={{ marginTop: spacing.lg }}>Park the worry</AppText>
        <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>
          Write the worry down, then choose when you’ll come back to it. Naming a time tells your mind it’s safe to set down for now.
        </AppText>
        <Card style={{ marginTop: spacing.lg }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What’s the worry?"
            placeholderTextColor={c.muted}
            multiline
            autoFocus
            allowFontScaling
            style={{ color: c.text1, fontSize: scale(16), lineHeight: scale(23), minHeight: scale(96), textAlignVertical: 'top' }}
          />
        </Card>
        <AppText size={12} weight="700" color={c.muted} uppercase letterSpacing={0.8} style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>Come back to it</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {WHENS.map((w) => {
            const on = w === when;
            return (
              <Pressable key={w} onPress={() => setWhen(w)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: on ? tint(c.teal, 0.14) : c.card, borderWidth: on ? 1.5 : c.borderWidth, borderColor: on ? c.teal : c.border }}>
                <AppText size={13} weight="600" color={on ? c.teal : c.text2}>{w}</AppText>
              </Pressable>
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
