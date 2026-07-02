import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { ListGroup, SettingsRow } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useAuth } from '../../supabase/auth';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';

/** Profile / Settings. Calm settings list with clear spacing. No modes. */
export function ProfileScreen() {
  const { theme } = useTheme();
  const { name, reminderEnabled } = useApp();
  const { user, configured, signOut } = useAuth();
  const nav = useRootNav();
  const c = theme.colors;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>You</AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.xl, padding: spacing.lg }}>
        <LinearGradient colors={[c.teal, c.lavender]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 52, height: 52, borderRadius: radius.full }} />
        <View style={{ flex: 1 }}>
          <AppText size={17} weight="600">{name}</AppText>
          <AppText size={13} color={c.muted}>{user?.email ? `${user.email} · synced` : 'On this device'}</AppText>
        </View>
      </View>

      <ListGroup style={{ marginTop: spacing.lg }}>
        <SettingsRow label="How TrueShift works" onPress={() => nav.navigate('HowToUse')} />
        <SettingsRow label="Display & comfort" onPress={() => nav.navigate('ThemePicker')} />
        <SettingsRow label="Daily check-in" value={reminderEnabled ? 'On' : 'Off'} onPress={() => nav.navigate('ReminderSettings')} />
        <SettingsRow label="Privacy" onPress={() => nav.navigate('Info', { kind: 'privacy' })} />
        <SettingsRow label="Crisis resources" onPress={() => nav.navigate('CrisisResources')} last />
      </ListGroup>

      <ListGroup style={{ marginTop: spacing.md }}>
        <SettingsRow label="About TrueShift" onPress={() => nav.navigate('Info', { kind: 'about' })} />
        <SettingsRow label="Terms · Privacy Policy" onPress={() => nav.navigate('Info', { kind: 'terms' })} />
        <SettingsRow label="Delete data" danger onPress={() => nav.navigate('DeleteData')} last />
      </ListGroup>

      {configured && user && (
        <ListGroup style={{ marginTop: spacing.md }}>
          <SettingsRow label="Sign out" onPress={signOut} last />
        </ListGroup>
      )}
    </Screen>
  );
}
