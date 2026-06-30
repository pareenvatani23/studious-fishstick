import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situationById } from '../../data/situations';
import { radius, spacing } from '../../theme/tokens';

/**
 * Step 2 — the whole "support" in one screen, in clinically-safe order:
 *   1) validate (first, always)
 *   2) "another way to look at it" — a reframe shown as a hypothesis, editable
 *   3) one small action (implementation intention), swappable
 * Optional "add the thought" note for users who want a touch more depth.
 */
export function SupportScreen() {
  const { theme, tint, scale } = useTheme();
  const { draft, update } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const situation = situationById(draft.situationId ?? 'somethingElse')!;
  const [actionIdx, setActionIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [reframe, setReframe] = useState(situation.reframe);
  const [note, setNote] = useState(draft.note ?? '');
  const [showNote, setShowNote] = useState(false);

  const action = situation.actions[actionIdx % situation.actions.length];

  const next = () => {
    update({ actionText: action.text, note: note || undefined });
    nav.navigate('ResetDone');
  };

  return (
    <Screen scroll glow="teal" bottom={<Button label="I’ll try it" large onPress={next} />}>
      <FlowHeader progress={0.66} onBack={() => nav.goBack()} readAloudText={`${situation.validate} ${reframe} A small step: ${action.text}`} />

      {/* 1) validate */}
      <AppText size={20} weight="700" lineHeightMultiple={1.35}>{situation.validate}</AppText>

      {/* 2) reframe as a hypothesis, editable */}
      <View style={{ marginTop: spacing.xl, borderRadius: radius.xxl, borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.3), backgroundColor: c.card, overflow: 'hidden' }}>
        <LinearGradient colors={[tint(c.teal, 0.14), tint(c.lavender, 0.1)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ padding: spacing.xl }}>
          <AppText size={12} weight="700" color={c.teal} uppercase letterSpacing={0.8} style={{ marginBottom: spacing.md }}>Another way to see it</AppText>
          {editing ? (
            <TextInput
              value={reframe}
              onChangeText={setReframe}
              multiline
              autoFocus
              allowFontScaling
              style={{ color: c.text1, fontSize: scale(17), lineHeight: scale(25), minHeight: scale(80), textAlignVertical: 'top' }}
            />
          ) : (
            <AppText size={17} lineHeightMultiple={1.45}>{reframe}</AppText>
          )}
        </View>
      </View>
      <Pressable onPress={() => setEditing((e) => !e)} accessibilityRole="button" accessibilityLabel={editing ? 'Done editing' : 'Put it in my own words'} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md, minHeight: 44 }}>
        <Icon name="edit" color={c.text2} size={16} />
        <AppText size={14} color={c.text2}>{editing ? 'Done' : 'Put it in my own words'}</AppText>
      </Pressable>

      {/* optional note */}
      {showNote ? (
        <Card style={{ marginTop: spacing.sm }}>
          <AppText size={12} weight="600" color={c.muted}>The thought underneath (optional)</AppText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What did your mind say?"
            placeholderTextColor={c.muted}
            multiline
            allowFontScaling
            style={{ color: c.text1, fontSize: scale(15), marginTop: spacing.sm, minHeight: scale(40), textAlignVertical: 'top' }}
          />
        </Card>
      ) : (
        <Pressable onPress={() => setShowNote(true)} accessibilityRole="button" accessibilityLabel="Add the thought underneath" style={{ alignItems: 'center', minHeight: 36, justifyContent: 'center' }}>
          <AppText size={13} color={c.muted}>+ Add the thought underneath</AppText>
        </Pressable>
      )}

      {/* 3) one small action */}
      <AppText size={12} weight="700" color={c.muted} uppercase letterSpacing={0.8} style={{ marginTop: spacing.xl }}>One small step</AppText>
      <Card intent="accent" style={{ marginTop: spacing.md, borderColor: tint(c.teal, 0.3) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText size={17} weight="600" style={{ flex: 1, paddingRight: spacing.md }} lineHeightMultiple={1.35}>{action.text}</AppText>
          <View style={{ backgroundColor: tint(c.teal, 0.14), paddingVertical: 5, paddingHorizontal: 11, borderRadius: radius.full }}>
            <AppText size={12} weight="600" color={c.teal}>~{action.minutes} min</AppText>
          </View>
        </View>
        {situation.actions.length > 1 && (
          <Pressable onPress={() => setActionIdx((i) => i + 1)} accessibilityRole="button" accessibilityLabel="Try a different step" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, minHeight: 36 }}>
            <Icon name="shift" color={c.text2} size={16} />
            <AppText size={13} color={c.text2}>Try a different step</AppText>
          </Pressable>
        )}
      </Card>
    </Screen>
  );
}
