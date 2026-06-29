import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Toggle, ListGroup, SettingsRow } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Profile / Settings (design 21). Calm settings list with clear spacing. */
export function ProfileScreen() {
  const { theme } = useTheme();
  const { name, mode, setMode } = useApp();
  const nav = useRootNav();
  const c = theme.colors;

  const onToggleMode = (toFull: boolean) => {
    if (toFull) {
      nav.navigate('PatternSelection', { fromSettings: true });
    } else {
      setMode('easy');
    }
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>You</AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.xl, padding: spacing.lg }}>
        <LinearGradient colors={[c.teal, c.lavender]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 52, height: 52, borderRadius: radius.full }} />
        <View>
          <AppText size={17} weight="600">{name}</AppText>
          <AppText size={13} color={c.muted}>On this device · no account</AppText>
        </View>
      </View>

      {/* Mode */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.xl, padding: spacing.lg }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <AppText size={15} weight="600">Full mode</AppText>
          <AppText size={13} color={c.text2} lineHeightMultiple={1.4} style={{ marginTop: 2 }}>
            {mode === 'full' ? 'CBT pulls, journaling, patterns & insights.' : 'Easy mode is on — plain, tap-only steps.'}
          </AppText>
        </View>
        <Toggle value={mode === 'full'} onChange={onToggleMode} label="Full mode" />
      </View>

      <ListGroup style={{ marginTop: spacing.lg }}>
        <SettingsRow label="Display & comfort" onPress={() => nav.navigate('ThemePicker')} />
        <SettingsRow label="Reminder settings" onPress={() => nav.navigate('Info', { kind: 'about' })} />
        <SettingsRow label="Privacy" onPress={() => nav.navigate('Info', { kind: 'privacy' })} />
        <SettingsRow label="Crisis resources" onPress={() => nav.navigate('CrisisResources')} last />
      </ListGroup>

      <ListGroup style={{ marginTop: spacing.md }}>
        <SettingsRow label="About TrueShift" onPress={() => nav.navigate('Info', { kind: 'about' })} />
        <SettingsRow label="Terms · Privacy Policy" onPress={() => nav.navigate('Info', { kind: 'terms' })} />
        <SettingsRow label="Delete data" danger onPress={() => nav.navigate('DeleteData')} last />
      </ListGroup>
    </Screen>
  );
}
