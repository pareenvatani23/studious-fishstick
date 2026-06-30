import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situations, situationById } from '../../data/situations';
import { aiEnabled } from '../../ai/config';
import { suggestSituations } from '../../ai/openai';
import { radius, spacing, sizing } from '../../theme/tokens';

const READ = 'How heavy does it feel right now? Then, what happened? Tap the one that fits best.';

/**
 * Step 1 — concrete situation + optional heaviness check (severity routing).
 * When AI is on, a few personalised situations (from the user's history) are
 * appended below the fixed base list. "Something else" captures free text that
 * the AI uses to personalise.
 */
export function SituationScreen() {
  const { theme, tint } = useTheme();
  const { resets } = useApp();
  const { update } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const [heaviness, setHeaviness] = useState<number | undefined>();
  const [extra, setExtra] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (!aiEnabled) return;
    const recent = resets
      .map((r) => r.customSituation || situationById(r.situationId ?? '')?.label)
      .filter(Boolean) as string[];
    suggestSituations(recent, situations.map((s) => s.label)).then(setExtra).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (id: string, label: string) => {
    update({ situationId: id, situationLabel: label, customSituation: undefined });
    nav.navigate('ResetNarration');
  };

  const pickCustom = (text: string) => {
    const t = text.trim();
    update({ situationId: 'somethingElse', situationLabel: t || 'Something else', customSituation: t || undefined });
    nav.navigate('ResetNarration');
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <FlowHeader progress={0.33} onBack={() => nav.goBack()} readAloudText={READ} />

      <AppText size={15} color={c.text2}>How heavy does it feel right now?</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = heaviness === n;
          return (
            <Pressable
              key={n}
              onPress={() => { setHeaviness(n); update({ heaviness: n }); }}
              accessibilityRole="button"
              accessibilityLabel={`Heaviness ${n} of 5`}
              accessibilityState={{ selected: on }}
              style={{ flex: 1, height: sizing.minTap, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? tint(c.teal, 0.16) : c.card, borderWidth: on ? 1.5 : c.borderWidth, borderColor: on ? c.teal : c.border }}
            >
              <AppText size={16} weight={on ? '700' : '500'} color={on ? c.teal : c.text2}>{n}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <AppText size={12} color={c.muted}>Light</AppText>
        <AppText size={12} color={c.muted}>Heavy</AppText>
      </View>

      {heaviness !== undefined && heaviness >= 4 && (
        <Pressable onPress={() => nav.navigate('CrisisResources')} accessibilityRole="button" accessibilityLabel="See urgent support options">
          <Card intent="accent" style={{ marginTop: spacing.lg, borderColor: tint(c.lavender, 0.4), flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <Icon name="heart" color={c.lavender} size={22} />
            <View style={{ flex: 1 }}>
              <AppText size={14} weight="600">That sounds like a lot to carry.</AppText>
              <AppText size={13} color={c.text2} lineHeightMultiple={1.4} style={{ marginTop: 2 }}>You can keep going here — and support is one tap away if you need it.</AppText>
            </View>
            <Icon name="chevronRight" color={c.muted} size={18} />
          </Card>
        </Pressable>
      )}

      <AppText size={26} weight="700" style={{ marginTop: spacing.xxl }}>What happened?</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }}>Tap the one that fits best.</AppText>

      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {situations.filter((s) => s.id !== 'somethingElse').map((s) => (
          <SelectableCard key={s.id} title={s.label} icon={s.icon} onPress={() => pick(s.id, s.label)} />
        ))}

        {/* personalised suggestions */}
        {extra.map((label) => (
          <SelectableCard key={`x-${label}`} title={label} icon="sparkle" intent="lavender" onPress={() => pickCustom(label)} />
        ))}

        {/* something else (free text) */}
        {customOpen ? (
          <Card>
            <AppText size={12} weight="600" color={c.muted}>In your words</AppText>
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              placeholder="What happened?"
              placeholderTextColor={c.muted}
              autoFocus
              multiline
              allowFontScaling
              style={{ color: c.text1, fontSize: 16, marginTop: spacing.sm, minHeight: 44, textAlignVertical: 'top' }}
            />
            <View style={{ marginTop: spacing.md }}>
              <Button label="Continue" onPress={() => pickCustom(customText)} disabled={!customText.trim()} />
            </View>
          </Card>
        ) : (
          <SelectableCard title="Something else" icon="plus" onPress={() => setCustomOpen(true)} />
        )}
      </View>
    </Screen>
  );
}
