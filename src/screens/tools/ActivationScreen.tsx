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

type Props = NativeStackScreenProps<RootStackParamList, 'ToolActivation'>;

const IDEAS = ['Step outside for 2 minutes', 'Text someone I like', 'Tidy one small surface', 'Stretch or walk a little', 'Make a warm drink', 'Play one song I love'];

/**
 * Behavioural activation — pick ONE small, doable action and commit to it now.
 * Doing a little (not fixing everything) is what shifts a low or stuck mood.
 */
export function ActivationScreen({ route }: Props) {
  const { theme, tint, scale } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const [choice, setChoice] = useState('');
  const [custom, setCustom] = useState('');
  const startedAt = useRef(Date.now());
  const action = (custom.trim() || choice).trim();

  const commit = () => {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    finish(mode as any, { tool: 'activation', seconds, completed: !!action, payload: { action } });
  };

  return (
    <Screen scroll bottom={<Button label="I’ll do this now" large disabled={!action} onPress={commit} />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginTop: spacing.sm }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
        <AppText size={26} weight="700" style={{ marginTop: spacing.lg }}>One small action</AppText>
        <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>
          Pick one small thing you can do in the next few minutes. Not the whole day — just one gentle move in a good direction.
        </AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          {IDEAS.map((idea) => {
            const on = choice === idea && !custom.trim();
            return (
              <Pressable key={idea} onPress={() => { setChoice(idea); setCustom(''); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: on ? tint(c.teal, 0.12) : c.card, borderWidth: on ? 1.5 : c.borderWidth, borderColor: on ? c.teal : c.border, borderRadius: radius.lg, padding: spacing.lg }}>
                <View style={{ width: 24, height: 24, borderRadius: radius.full, borderWidth: 1.5, borderColor: on ? c.teal : c.border, alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Icon name="check" color={c.teal} size={15} strokeWidth={2.6} />}
                </View>
                <AppText size={15} weight="600" style={{ flex: 1 }}>{idea}</AppText>
              </Pressable>
            );
          })}
        </View>
        <AppText size={12} weight="700" color={c.muted} uppercase letterSpacing={0.8} style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Or your own</AppText>
        <Card>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Type one small thing…"
            placeholderTextColor={c.muted}
            allowFontScaling
            style={{ color: c.text1, fontSize: scale(16), lineHeight: scale(22) }}
          />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
