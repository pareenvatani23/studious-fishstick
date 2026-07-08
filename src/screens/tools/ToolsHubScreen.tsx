import React from 'react';
import { View, Pressable } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { RoundIconButton } from '../../components/Header';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { TOOLS } from '../../tools/catalog';
import { radius, spacing } from '../../theme/tokens';

/** A calm library of every in-app tool, usable any time (not only inside a reset). */
export function ToolsHubScreen() {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.sm }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <AppText size={28} weight="700" style={{ marginTop: spacing.lg }}>Calm tools</AppText>
      <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md, marginBottom: spacing.xl }}>
        Small things that help in the moment. Use any of them any time — no reset needed.
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => nav.navigate(t.route as any, { mode: 'standalone', ...(t.params ?? {}) } as any)}
            accessibilityRole="button"
            accessibilityLabel={`${t.label}: ${t.sub}`}
            style={{ width: '47.5%', flexGrow: 1, alignItems: 'flex-start', gap: spacing.sm, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.lg, padding: spacing.lg }}
          >
            <View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: tint(c.teal, 0.12), alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={t.icon} color={c.teal} size={22} />
            </View>
            <AppText size={15} weight="600">{t.label}</AppText>
            <AppText size={12} color={c.muted}>{t.sub}</AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
