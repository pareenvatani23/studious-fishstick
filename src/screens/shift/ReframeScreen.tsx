import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { reframeForPull } from '../../data/reframes';
import { radius, spacing } from '../../theme/tokens';

/**
 * Reframe (design 14). Relief + clarity. Shows detected pattern chips and a
 * balanced reframe card. Clinical safety: when the reframe for this pull is a
 * placeholder (copyFinal=false) we DO NOT present invented guidance — we show a
 * clearly-marked "coming soon" state and invite the user to write their own.
 */
export function ReframeScreen() {
  const { theme, tint, scale } = useTheme();
  const { mode } = useApp();
  const { draft, update } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const reframe = reframeForPull(draft.pullId);
  const hasReal = reframe.copyFinal;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.reframeText ?? (hasReal ? reframe.text : ''));

  const next = () => {
    update({ reframeText: text || (hasReal ? reframe.text : undefined) });
    nav.navigate(mode === 'easy' ? 'ActionSelection' : 'SteadierResponse');
  };

  return (
    <Screen scroll glow="teal" bottom={<Button label="Choose a steadier response" onPress={next} />}>
      <FlowHeader progress={0.6} onBack={() => nav.goBack()} readAloudText={hasReal ? `Here's the shift. ${reframe.text}` : "Here's the shift."} />
      <AppText size={26} weight="700">Here's the shift.</AppText>

      {mode === 'full' && reframe.patterns.length > 0 && (
        <>
          <AppText size={12} weight="700" color={c.muted} uppercase letterSpacing={0.6} style={{ marginTop: spacing.xl }}>Patterns detected</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
            {reframe.patterns.map((p) => (
              <Chip key={p} label={p} intent="lavender" readOnly />
            ))}
          </View>
        </>
      )}

      <View style={{ marginTop: spacing.xl, borderRadius: radius.xxl, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.3), backgroundColor: c.card, overflow: 'hidden' }}>
        <LinearGradient colors={[tint(c.teal, 0.16), tint(c.lavender, 0.1)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ padding: spacing.xxl }}>
          <AppText size={13} weight="700" color={c.teal} uppercase letterSpacing={0.8} style={{ marginBottom: spacing.lg }}>Balanced reframe</AppText>

          {editing ? (
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write a balanced thought in your own words…"
              placeholderTextColor={c.muted}
              multiline
              autoFocus
              allowFontScaling
              style={{ color: c.text1, fontSize: scale(20), fontWeight: '600', lineHeight: scale(28), minHeight: scale(80), textAlignVertical: 'top' }}
            />
          ) : hasReal || text ? (
            <AppText size={20} weight="600" lineHeightMultiple={1.4}>{text || reframe.text}</AppText>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <AppText size={16} weight="600" color={c.text2} lineHeightMultiple={1.4}>
                A balanced reframe for this pull is coming soon.
              </AppText>
              <AppText size={14} color={c.muted} lineHeightMultiple={1.4}>
                For now, write one in your own words — what would a kinder, truer thought sound like?
              </AppText>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => setEditing((e) => !e)}
        accessibilityRole="button"
        accessibilityLabel={editing ? 'Done editing reframe' : 'Edit this reframe'}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl, minHeight: 44 }}
      >
        <Icon name="edit" color={c.text2} size={16} />
        <AppText size={14} color={c.text2}>{editing ? 'Done' : 'Edit this reframe'}</AppText>
      </Pressable>
    </Screen>
  );
}
