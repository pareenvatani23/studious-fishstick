import React, { useRef, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { useToolFinish } from '../../tools/toolFinish';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolGratitude'>;

/** Three good things — a small, evidence-backed lift for mood and perspective. */
export function GratitudeScreen({ route }: Props) {
  const { theme, tint, scale } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const [items, setItems] = useState(['', '', '']);
  const startedAt = useRef(Date.now());
  const filled = items.filter((t) => t.trim()).length;

  const setAt = (idx: number, v: string) => setItems((arr) => arr.map((t, k) => (k === idx ? v : t)));
  const save = () => {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    finish(mode as any, { tool: 'gratitude', seconds, completed: filled > 0, payload: { items: items.map((t) => t.trim()).filter(Boolean) } });
  };

  return (
    <Screen scroll bottom={<Button label="Save" large disabled={filled === 0} onPress={save} />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginTop: spacing.sm }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
        <AppText size={26} weight="700" style={{ marginTop: spacing.lg }}>Three good things</AppText>
        <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>
          Name up to three things — however small — that were okay today. A warm drink, a message, a moment of quiet. They all count.
        </AppText>
        {items.map((val, idx) => (
          <Card key={idx} style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 30, height: 30, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.14), alignItems: 'center', justifyContent: 'center' }}>
              <AppText size={14} weight="700" color={c.teal}>{idx + 1}</AppText>
            </View>
            <TextInput
              value={val}
              onChangeText={(v) => setAt(idx, v)}
              placeholder={idx === 0 ? 'Something that was okay…' : 'Anything else?'}
              placeholderTextColor={c.muted}
              autoFocus={idx === 0}
              allowFontScaling
              style={{ flex: 1, color: c.text1, fontSize: scale(16), lineHeight: scale(22) }}
            />
          </Card>
        ))}
        <AppText size={12} color={c.muted} style={{ marginTop: spacing.md }}>Private to you. Stored on your account.</AppText>
      </KeyboardAvoidingView>
    </Screen>
  );
}
