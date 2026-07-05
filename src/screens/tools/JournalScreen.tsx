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
import { spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolJournal'>;

export function JournalScreen({ route }: Props) {
  const { theme, scale } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const finish = useToolFinish();
  const mode = route.params?.mode ?? 'standalone';
  const prompt = route.params?.prompt || 'Write down what’s on your mind — the thought, the worry, exactly as it is. Getting it out of your head and onto the page loosens its grip.';
  const [text, setText] = useState('');
  const startedAt = useRef(Date.now());

  const save = () => {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    // payload text stays private to the user's own tool_events row (RLS-scoped).
    finish(mode as any, { tool: 'journal', seconds, completed: text.trim().length > 0, payload: { text: text.trim() } });
  };

  return (
    <Screen scroll bottom={<Button label="Save" large disabled={!text.trim()} onPress={save} />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginTop: spacing.sm }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
        <AppText size={26} weight="700" style={{ marginTop: spacing.lg }}>Take a note</AppText>
        <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>{prompt}</AppText>
        <Card style={{ marginTop: spacing.lg }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Start writing…"
            placeholderTextColor={c.muted}
            multiline
            autoFocus
            allowFontScaling
            style={{ color: c.text1, fontSize: scale(16), lineHeight: scale(23), minHeight: scale(160), textAlignVertical: 'top' }}
          />
        </Card>
        <AppText size={12} color={c.muted} style={{ marginTop: spacing.md }}>Private to you. Stored on your account.</AppText>
      </KeyboardAvoidingView>
    </Screen>
  );
}
