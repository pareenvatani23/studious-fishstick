import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { RoundIconButton } from '../../components/Header';
import { Toggle, SectionLabel } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useRootNav } from '../../navigation/hooks';
import { radius, spacing, sizing } from '../../theme/tokens';
import { ensurePermission, notificationsAvailable } from '../../notifications/reminders';

/** Preset times shown as chips — {label, hour}. */
const TIMES: { label: string; hour: number }[] = [
  { label: 'Morning', hour: 8 },
  { label: 'Midday', hour: 12 },
  { label: 'Evening', hour: 20 },
  { label: 'Night', hour: 22 },
];

function fmt(hour: number, minute: number) {
  const h12 = ((hour + 11) % 12) + 1;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Reminder settings — opt-in toggle + a preferred time. Messages themselves are
 * generated + scheduled by useReminderSync whenever prefs or history change.
 */
export function ReminderSettingsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const { reminderEnabled, reminderHour, reminderMinute, setReminder } = useApp();
  const [denied, setDenied] = useState(false);

  const onToggle = async (v: boolean) => {
    if (v) {
      const ok = await ensurePermission();
      if (!ok) {
        setDenied(true);
        setReminder({ enabled: false });
        return;
      }
      setDenied(false);
    }
    setReminder({ enabled: v });
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>
      <AppText size={26} weight="700">Daily check-in</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }} lineHeightMultiple={1.4}>
        One gentle, personalised nudge a day — written from your own recent resets, never nagging. Turn it off anytime.
      </AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <AppText size={15} weight="600">Daily reminder</AppText>
          <AppText size={12} color={c.text2}>A calm check-in, once a day</AppText>
        </View>
        <Toggle value={reminderEnabled} onChange={onToggle} label="Daily reminder" />
      </View>

      {denied && (
        <AppText size={13} color={c.danger} style={{ marginTop: spacing.md }}>
          Notifications are turned off for TrueShift. Enable them in your phone’s Settings, then try again.
        </AppText>
      )}

      {!notificationsAvailable && (
        <AppText size={13} color={c.muted} style={{ marginTop: spacing.md }}>
          Reminders need the latest app version. Update TrueShift to turn them on.
        </AppText>
      )}

      {reminderEnabled && (
        <>
          <SectionLabel style={{ marginTop: spacing.xl }}>Preferred time</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md }}>
            {TIMES.map((t) => {
              const selected = reminderHour === t.hour;
              return (
                <Pressable
                  key={t.label}
                  onPress={() => setReminder({ hour: t.hour, minute: 0 })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${t.label}, ${fmt(t.hour, 0)}`}
                  style={{ minWidth: 96, alignItems: 'center', gap: 2, backgroundColor: c.card, borderRadius: radius.lg, borderWidth: selected ? 1.5 : c.borderWidth, borderColor: selected ? c.teal : c.border, paddingVertical: spacing.md, paddingHorizontal: spacing.lg }}
                >
                  <AppText size={15} weight="600" color={selected ? c.teal : c.text1}>{t.label}</AppText>
                  <AppText size={12} color={selected ? c.teal : c.text2}>{fmt(t.hour, 0)}</AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText size={13} color={c.muted} style={{ marginTop: spacing.lg }} lineHeightMultiple={1.4}>
            Currently set for {fmt(reminderHour, reminderMinute)}. Your reminders are private and created on your device.
          </AppText>
        </>
      )}
    </Screen>
  );
}
