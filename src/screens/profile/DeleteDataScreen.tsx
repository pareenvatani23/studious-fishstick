import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DeleteData'>;

/**
 * Delete Data Confirmation (design 24). Bottom-sheet over a scrim. Clear but
 * not alarmist. Clears app data AND display prefs; the app returns to onboarding.
 */
export function DeleteDataScreen({ navigation }: Props) {
  const { theme, tint, resetDisplay } = useTheme();
  const { deleteAllData } = useApp();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  const confirmDelete = async () => {
    await deleteAllData();
    await resetDisplay();
    // onboardingComplete flips false → RootNavigator swaps to the onboarding group.
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }}>
      <Pressable style={{ flex: 1 }} accessibilityLabel="Dismiss" accessibilityRole="button" onPress={() => navigation.goBack()} />
      <View
        style={{
          margin: spacing.md,
          marginBottom: Math.max(insets.bottom, spacing.lg),
          backgroundColor: c.elevated,
          borderWidth: c.borderWidth,
          borderColor: c.borderStrong,
          borderRadius: radius.xxl + 2,
          padding: spacing.xxl,
        }}
      >
        <View style={{ width: 52, height: 52, borderRadius: radius.md + 2, backgroundColor: tint(c.danger, 0.12), borderWidth: c.borderWidth, borderColor: tint(c.danger, 0.4), alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <Icon name="trash" color={c.danger} size={24} />
        </View>
        <AppText size={23} weight="700">Delete all data?</AppText>
        <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.md }}>
          This removes your shifts, preferences, and progress from this device. This can't be undone.
        </AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Button label="Delete all data" variant="destructive" height={54} onPress={confirmDelete} />
          <Button label="Cancel" variant="secondary" height={54} onPress={() => navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}
