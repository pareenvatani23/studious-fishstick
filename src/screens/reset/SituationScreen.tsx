import React, { useEffect, useMemo, useState } from 'react';
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

const MAX_EMOTIONS = 3;
const MAX_SITUATIONS = 2;

interface PickedSituation { id: string; label: string; custom?: boolean }

/**
 * Step 1 of the reset — a short wizard, ONE question per screen: heaviness →
 * feeling(s) → what happened. All three are REQUIRED and feed the CBT prompt:
 * heaviness (1–5), up to 3 feelings, up to 2 situations. Heaviness ≥4 gently
 * surfaces crisis support (severity routing).
 */
export function SituationScreen() {
  const { theme, tint } = useTheme();
  const { resets } = useApp();
  const { update } = useResetFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const [step, setStep] = useState(0); // 0 heaviness · 1 feelings · 2 situations
  const [heaviness, setHeaviness] = useState<number | undefined>();
  const [selEmotions, setSelEmotions] = useState<string[]>([]);
  const [selSituations, setSelSituations] = useState<PickedSituation[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [suggestedEmotions, setSuggestedEmotions] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (!aiEnabled) return;
    const recentSituations = resets
      .flatMap((r) => r.situations ?? [r.customSituation || situationById(r.situationId ?? '')?.label])
      .filter(Boolean) as string[];
    suggestSituations(recentSituations, situations.map((s) => s.label)).then(setExtra).catch(() => {});
    const recentEmotions = resets.flatMap((r) => r.emotions ?? [r.emotion]).filter(Boolean) as string[];
    suggestEmotions(recentEmotions, emotions).then(setSuggestedEmotions).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedEmotions = useMemo(() => [
    ...suggestedEmotions,
    ...emotions.filter((e) => !suggestedEmotions.some((s) => s.toLowerCase() === e.toLowerCase())),
  ], [suggestedEmotions]);

  const toggleEmotion = (e: string) => {
    setSelEmotions((cur) => cur.includes(e) ? cur.filter((x) => x !== e) : cur.length < MAX_EMOTIONS ? [...cur, e] : cur);
  };
  const isSitSelected = (id: string, label: string) => selSituations.some((s) => s.id === id && s.label === label);
  const toggleSituation = (id: string, label: string) => {
    setSelSituations((cur) => {
      const exists = cur.some((s) => s.id === id && s.label === label);
      if (exists) return cur.filter((s) => !(s.id === id && s.label === label));
      return cur.length < MAX_SITUATIONS ? [...cur, { id, label }] : cur;
    });
  };
  const addCustom = () => {
    const t = customText.trim();
    if (!t) return;
    setSelSituations((cur) => (cur.length < MAX_SITUATIONS ? [...cur, { id: 'somethingElse', label: t, custom: true }] : cur));
    setCustomText('');
    setCustomOpen(false);
  };

  const back = () => (step > 0 ? setStep(step - 1) : nav.goBack());

  const goNarration = () => {
    const custom = selSituations.find((s) => s.custom);
    update({
      heaviness,
      emotions: selEmotions,
      emotion: selEmotions[0],
      situations: selSituations.map((s) => s.label),
      situationIds: selSituations.map((s) => s.id),
      situationId: selSituations[0]?.id,
      situationLabel: selSituations[0]?.label,
      customSituation: custom?.label,
    });
    nav.navigate('ResetNarration');
  };

  const canContinue = step === 0 ? heaviness !== undefined : step === 1 ? selEmotions.length > 0 : selSituations.length > 0;
  const onContinue = () => { if (step < 2) setStep(step + 1); else goNarration(); };
  const progress = 0.15 + step * 0.12;

  return (
    <Screen
      scroll={step === 2}
      contentStyle={step === 2 ? { paddingBottom: sizing.tabBar + spacing.xl } : undefined}
      bottom={<Button label="Continue" large disabled={!canContinue} onPress={onContinue} />}
    >
      <FlowHeader progress={progress} onBack={back} readAloudText={step === 0 ? 'How heavy does it feel right now?' : step === 1 ? "What are you feeling? Pick up to three." : 'What happened? Pick one or two.'} />

      {/* STEP 0 — heaviness (required) */}
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

      {/* STEP 1 — feelings (up to 3, required) */}
      {step === 1 && (
        <View style={{ marginTop: spacing.xxxl }}>
          <AppText size={28} weight="700" lineHeightMultiple={1.2}>What are you feeling?</AppText>
          <AppText size={15} color={c.text2} style={{ marginTop: spacing.md }}>
            Naming it helps it settle. Pick up to {MAX_EMOTIONS}.{selEmotions.length ? `  (${selEmotions.length}/${MAX_EMOTIONS})` : ''}
          </AppText>
          {suggestedEmotions.length > 0 && (
            <AppText size={12} weight="600" color={c.muted} uppercase letterSpacing={1} style={{ marginTop: spacing.xl }}>Likely for you</AppText>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: suggestedEmotions.length > 0 ? spacing.md : spacing.xl }}>
            {orderedEmotions.map((e, i) => (
              <Chip key={`${e}-${i}`} label={e} intent="lavender" selected={selEmotions.includes(e)} onPress={() => toggleEmotion(e)} />
            ))}
          </View>
        </View>
      )}

      {/* STEP 2 — what happened (up to 2, required) */}
      {step === 2 && (
        <View>
          <AppText size={28} weight="700" style={{ marginTop: spacing.lg }}>What happened?</AppText>
          <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }}>
            Pick one or two.{selSituations.length ? `  (${selSituations.length}/${MAX_SITUATIONS})` : ''}
          </AppText>
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {situations.filter((s) => s.id !== 'somethingElse').map((s) => (
              <SelectableCard key={s.id} title={s.label} icon={s.icon} selected={isSitSelected(s.id, s.label)} onPress={() => toggleSituation(s.id, s.label)} />
            ))}
            {extra.map((label) => (
              <SelectableCard key={`x-${label}`} title={label} icon="sparkle" intent="lavender" selected={isSitSelected('somethingElse', label)} onPress={() => toggleSituation('somethingElse', label)} />
            ))}
            {/* custom entries already chosen */}
            {selSituations.filter((s) => s.custom).map((s) => (
              <SelectableCard key={`c-${s.label}`} title={s.label} icon="sparkle" intent="lavender" selected onPress={() => toggleSituation(s.id, s.label)} />
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
                  <Button label="Add" onPress={addCustom} disabled={!customText.trim()} />
                </View>
              </Card>
            ) : (
              selSituations.length < MAX_SITUATIONS && (
                <SelectableCard title="Something else" icon="plus" onPress={() => setCustomOpen(true)} />
              )
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}
