import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon, IconName } from './icons';
import { radius, spacing } from '../theme/tokens';

/**
 * Plain-language explainer for the daily Reset. Shared by onboarding and the
 * "How TrueShift works" screen in Profile. Concrete example included so the
 * idea lands without any jargon.
 */
const STEPS: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'eye', title: 'Say what happened', sub: 'Tap from a short list. No typing needed.' },
  { icon: 'sun', title: 'Get a calmer view', sub: 'A kinder way to see it, plus one small thing to try.' },
  { icon: 'check', title: 'Mark how it went', sub: 'That’s it — about 3 minutes, just for you.' },
];

export function HowItWorksBody() {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  return (
    <View>
      <AppText size={15} color={c.text2} lineHeightMultiple={1.5}>
        When something’s on your mind, open TrueShift and do a quick{' '}
        <AppText size={15} weight="700" color={c.teal}>reset</AppText> — a short moment to feel a little steadier.
      </AppText>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {STEPS.map((s, i) => (
          <View key={s.title} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.xl, padding: spacing.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.lg, backgroundColor: tint(c.teal, 0.14), alignItems: 'center', justifyContent: 'center' }}>
              <AppText size={18} weight="700" color={c.teal}>{i + 1}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText size={18} weight="700">{s.title}</AppText>
              <AppText size={14} color={c.text2} lineHeightMultiple={1.4} style={{ marginTop: 2 }}>{s.sub}</AppText>
            </View>
            <Icon name={s.icon} color={c.text2} size={22} />
          </View>
        ))}
      </View>

      {/* concrete example so it isn't abstract */}
      <View style={{ marginTop: spacing.xl, borderRadius: radius.xl, borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.35), backgroundColor: c.card, padding: spacing.lg, gap: spacing.md }}>
        <AppText size={12} weight="700" color={c.lavender} uppercase letterSpacing={0.8}>For example</AppText>
        <ExampleRow label="You pick" value="“Someone didn’t reply”" c={c} />
        <ExampleRow label="We show" value="“Silence is missing info, not a verdict.”" c={c} />
        <ExampleRow label="You try" value="“Wait 30 minutes before checking again.”" c={c} />
      </View>
    </View>
  );
}

function ExampleRow({ label, value, c }: { label: string; value: string; c: any }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      <AppText size={13} color={c.muted} style={{ width: 64 }}>{label}</AppText>
      <AppText size={14} weight="600" style={{ flex: 1 }} lineHeightMultiple={1.4}>{value}</AppText>
    </View>
  );
}
