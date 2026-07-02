import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';
import { ensurePermission } from '../../notifications/reminders';

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>;

const BULLETS = [
  'One gentle nudge a day — never nagging',
  'Written from your own recent resets',
  'Private, created on your device',
  'Turn it off anytime in settings',
];

/** Optional opt-in for the personalised daily check-in (defaults to 8pm). */
export function RemindersScreen({ navigation }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const { setReminder } = useApp();

  const enable = async () => {
    const ok = await ensurePermission();
    setReminder({ enabled: ok, hour: 20, minute: 0 });
    navigation.navigate('Ready');
  };

  const skip = () => {
    setReminder({ enabled: false });
    navigation.navigate('Ready');
  };

  return (
    <Screen
      scroll
      bottom={
        <View style={{ gap: spacing.md }}>
          <Button label="Yes, remind me" onPress={enable} />
          <Button label="Not now" variant="secondary" onPress={skip} />
        </View>
      }
    >
      <View style={{ width: 56, height: 56, borderRadius: radius.lg, backgroundColor: tint(c.lavender, 0.14), borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.4), alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl, marginTop: spacing.sm }}>
        <Icon name="bell" color={c.lavender} size={28} />
      </View>
      <AppText size={26} weight="700" lineHeightMultiple={1.25}>A calm daily check-in?</AppText>
      <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.lg }}>
        A short, personal reminder to take one small reset — shaped by what’s actually been on your mind. No pressure, no streak-guilt.
      </AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
        {BULLETS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.md + 2, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
            <Icon name="check" color={c.success} size={18} strokeWidth={2.4} />
            <AppText size={15} style={{ flex: 1 }}>{b}</AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}
