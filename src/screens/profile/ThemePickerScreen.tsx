import React from 'react';
import { View, Pressable } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { RoundIconButton } from '../../components/Header';
import { Toggle, SectionLabel } from '../../components/Settings';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { themes, themeOrder } from '../../theme/themes';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Display & Comfort (design 22). Theme picker + larger text + reduce motion. */
export function ThemePickerScreen() {
  const { theme, themeName, setTheme, textSize, setTextSize, reduceMotion, setReduceMotion } = useTheme();
  const nav = useRootNav();
  const c = theme.colors;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <AppText size={26} weight="700">Display &amp; comfort</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }}>Set what feels easiest for your eyes and mind.</AppText>

      <SectionLabel style={{ marginTop: spacing.xl }}>Theme</SectionLabel>
      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        {themeOrder.map((name) => {
          const t = themes[name];
          const selected = name === themeName;
          return (
            <Pressable
              key={name}
              onPress={() => setTheme(name)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t.label}. ${t.description}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: c.card, borderRadius: radius.lg, borderWidth: selected ? 1.5 : c.borderWidth, borderColor: selected ? c.teal : c.border, padding: spacing.lg }}
            >
              <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: t.swatch, borderWidth: 1, borderColor: t.colors.borderStrong }} />
              <View style={{ flex: 1 }}>
                <AppText size={15} weight="600">{t.label}</AppText>
                <AppText size={12} color={c.text2}>{t.description}</AppText>
              </View>
              {selected && <Icon name="check" color={c.teal} size={22} strokeWidth={2.4} />}
            </Pressable>
          );
        })}
      </View>

      <SectionLabel style={{ marginTop: spacing.xl }}>Text size</SectionLabel>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        {(['Normal', 'Large', 'Largest'] as const).map((s) => {
          const selected = textSize === s;
          return (
            <Pressable
              key={s}
              onPress={() => setTextSize(s)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${s} text size`}
              style={{ flex: 1, alignItems: 'center', gap: spacing.sm, backgroundColor: c.card, borderRadius: radius.lg, borderWidth: selected ? 1.5 : c.borderWidth, borderColor: selected ? c.teal : c.border, paddingVertical: spacing.lg }}
            >
              <AppText size={s === 'Normal' ? 18 : s === 'Large' ? 22 : 26} weight="700" color={selected ? c.teal : c.text2}>Aa</AppText>
              <AppText size={12} color={selected ? c.teal : c.text2}>{s}</AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        <PrefRow label="Larger text" sub="Follows your phone size too" value={textSize !== 'Normal'} onChange={(v) => setTextSize(v ? 'Large' : 'Normal')} />
        <PrefRow label="Reduce motion" sub="Calmer, fewer animations" value={reduceMotion} onChange={setReduceMotion} />
      </View>
    </Screen>
  );
}

function PrefRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.lg, padding: spacing.lg }}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <AppText size={15} weight="600">{label}</AppText>
        <AppText size={12} color={c.text2}>{sub}</AppText>
      </View>
      <Toggle value={value} onChange={onChange} label={label} />
    </View>
  );
}
