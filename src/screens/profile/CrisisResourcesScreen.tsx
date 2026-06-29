import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';

/**
 * Crisis Resources (design 23). Clear, direct, no decorative distractions.
 * Australia resources from the brief. Tapping a number dials it.
 */
const RESOURCES = [
  { name: 'Emergency', sub: 'Immediate danger', number: '000', dial: '000', danger: true },
  { name: 'Lifeline', sub: '24/7 crisis support', number: '13 11 14', dial: '131114' },
  { name: 'Beyond Blue', sub: 'Mental health support', number: '1300 22 4636', dial: '1300224636' },
];

export function CrisisResourcesScreen() {
  const { theme, tint } = useTheme();
  const nav = useRootNav();
  const c = theme.colors;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <AppText size={26} weight="700" lineHeightMultiple={1.25}>If you need urgent support</AppText>
      <AppText size={15} color={c.text2} lineHeightMultiple={1.55} style={{ marginTop: spacing.lg }}>
        TrueShift is not a crisis service. If you are in immediate danger, contact emergency services.
      </AppText>

      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
        {RESOURCES.map((r) => (
          <Pressable
            key={r.name}
            onPress={() => Linking.openURL(`tel:${r.dial}`)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${r.name}, ${r.number}`}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: radius.lg,
              padding: spacing.lg + 2,
              backgroundColor: r.danger ? tint(c.danger, 0.1) : c.card,
              borderWidth: c.borderWidth,
              borderColor: r.danger ? tint(c.danger, 0.4) : c.border,
            }}
          >
            <View>
              <AppText size={16} weight="600">{r.name}</AppText>
              <AppText size={13} color={c.text2} style={{ marginTop: 2 }}>{r.sub}</AppText>
            </View>
            <AppText size={r.danger ? 22 : 18} weight="700" color={r.danger ? c.danger : c.teal}>{r.number}</AppText>
          </Pressable>
        ))}
      </View>
      <AppText size={12} color={c.muted} align="center" style={{ marginTop: spacing.xl }}>Australia · resources vary by region</AppText>
    </Screen>
  );
}
