import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useResetFlow } from '../../store/ResetFlow';
import { useRootNav } from '../../navigation/hooks';
import { situations, situationById } from '../../data/situations';
import { emotions } from '../../data/emotions';
import { aiEnabled } from '../../ai/config';
import { suggestSituations, suggestEmotions } from '../../ai/openai';
import { radius, spacing, sizing } from '../../theme/tokens';

/**
 * Step 1 of the reset — a short wizard, ONE question per screen (low cognitive
 * load): heaviness → feeling → what happened. Heaviness + feeling are optional
 * (Skip); "what happened" is the choice that advances to the reset. Heaviness ≥4
 * gently surfaces crisis support (severity routing).
 */
export function SituationScreen() {
  const { theme, tint } = useTheme();
  const { resets } = useApp();
  const { update } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const [step, setStep] = useState(0); // 0 heaviness · 1 feeling · 2 situation
  const [heaviness, setHeaviness] = useState<number | undefined>();
  const [emotion, setEmotion] = useState<string | undefined>();
  const [extra, setExtra] = useState<string[]>([]);
  const [suggestedEmotions, setSuggestedEmotions] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (!aiEnabled) return;
    const recentSituations = resets
      .map((r) => r.customSituation || situationById(r.situationId ?? '')?.label)
      .filter(Boolean) as string[];
    suggestSituations(recentSituations, situations.map((s) => s.label)).then(setExtra).catch(() => {});

    const recentEmotions = resets.map((r) => r.emotion).filter(Boolean) as string[];
    suggestEmotions(recentEmotions, emotions).then(setSuggestedEmotions).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preloaded personalised feelings first, then the rest (de-duplicated).
  const orderedEmotions = [
    ...suggestedEmotions,
    ...emotions.filter((e) => !suggestedEmotions.some((s) => s.toLowerCase() === e.toLowerCase())),
  ];

  const back = () => (step > 0 ? setStep(step - 1) : nav.goBack());

  const pick = (id: string, label: string) => {
    update({ situationId: id, situationLabel: label, customSituation: undefined, heaviness, emotion });
    nav.navigate('ResetNarration');
  };
  const pickCustom = (text: string) => {
    const t = text.trim();
    update({ situationId: 'somethingElse', situationLabel: t || 'Something else', customSituation: t || undefined, heaviness, emotion });
    nav.navigate('ResetNarration');
  };

  const progress = 0.15 + step * 0.12;

  return (
    <Screen
      scroll={step === 2}
      contentStyle={step === 2 ? { paddingBottom: sizing.tabBar + spacing.xl } : undefined}
      bottom={step < 2 ? (
        <View style={{ gap: spacing.sm }}>
          <Button label="Continue" large onPress={() => setStep(step + 1)} />
          <Pressable onPress={() => setStep(step + 1)} accessibilityRole="button" accessibilityLabel="Skip" style={{ alignItems: 'center', minHeight: 40, justifyContent: 'center' }}>
            <AppText size={14} color={c.muted}>Skip</AppText>
          </Pressable>
        </View>
      ) : undefined}
    >
      <FlowHeader progress={progress} onBack={back} readAloudText={step === 0 ? 'How heavy does it feel right now?' : step === 1 ? "What's the feeling?" : 'What happened? Tap the one that fits best.'} />

      {/* STEP 0 — heaviness */}
      {step === 0 && (
        <View style={{ marginTop: spacing.xxxl }}>
          <AppText size={28} weight="700" lineHeightMultiple={1.2}>How heavy does it feel right now?</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = heaviness === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => { setHeaviness(on ? undefined : n); update({ heaviness: on ? undefined : n }); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Heaviness ${n} of 5`}
                  accessibilityState={{ selected: on }}
                  style={{ flex: 1, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? tint(c.teal, 0.16) : c.card, borderWidth: on ? 1.5 : c.borderWidth, borderColor: on ? c.teal : c.border }}
                >
                  <AppText size={20} weight={on ? '700' : '500'} color={on ? c.teal : c.text2}>{n}</AppText>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
            <AppText size={13} color={c.muted}>Light</AppText>
            <AppText size={13} color={c.muted}>Heavy</AppText>
          </View>
          {heaviness !== undefined && heaviness >= 4 && (
            <Pressable onPress={() => nav.navigate('CrisisResources')} accessibilityRole="button" accessibilityLabel="See urgent support options">
              <Card intent="accent" style={{ marginTop: spacing.xl, borderColor: tint(c.lavender, 0.4), flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                <Icon name="heart" color={c.lavender} size={22} />
                <View style={{ flex: 1 }}>
                  <AppText size={14} weight="600">That sounds like a lot to carry.</AppText>
                  <AppText size={13} color={c.text2} lineHeightMultiple={1.4} style={{ marginTop: 2 }}>You can keep going here — and support is one tap away if you need it.</AppText>
                </View>
                <Icon name="chevronRight" color={c.muted} size={18} />
              </Card>
            </Pressable>
          )}
        </View>
      )}

      {/* STEP 1 — feeling */}
      {step === 1 && (
        <View style={{ marginTop: spacing.xxxl }}>
          <AppText size={28} weight="700" lineHeightMultiple={1.2}>What’s the feeling?</AppText>
          <AppText size={15} color={c.text2} style={{ marginTop: spacing.md }}>Naming it helps it settle. Optional.</AppText>
          {suggestedEmotions.length > 0 && (
            <AppText size={12} weight="600" color={c.muted} uppercase letterSpacing={1} style={{ marginTop: spacing.xl }}>Likely for you</AppText>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: suggestedEmotions.length > 0 ? spacing.md : spacing.xl }}>
            {orderedEmotions.map((e, i) => (
              <Chip
                key={`${e}-${i}`}
                label={e}
                intent="lavender"
                selected={emotion === e}
                onPress={() => setEmotion(emotion === e ? undefined : e)}
              />
            ))}
          </View>
        </View>
      )}

      {/* STEP 2 — what happened */}
      {step === 2 && (
        <View>
          <AppText size={28} weight="700" style={{ marginTop: spacing.lg }}>What happened?</AppText>
          <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }}>Tap the one that fits best.</AppText>
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {situations.filter((s) => s.id !== 'somethingElse').map((s) => (
              <SelectableCard key={s.id} title={s.label} icon={s.icon} onPress={() => pick(s.id, s.label)} />
            ))}
            {extra.map((label) => (
              <SelectableCard key={`x-${label}`} title={label} icon="sparkle" intent="lavender" onPress={() => pickCustom(label)} />
            ))}
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
        </View>
      )}
    </Screen>
  );
}
