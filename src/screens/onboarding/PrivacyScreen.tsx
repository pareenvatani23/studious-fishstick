import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

const BULLETS = ['No account required in MVP', 'Stored on this device', 'No ads · No social feed', 'Delete anytime'];

export function PrivacyScreen({ navigation }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;

  return (
    <Screen scroll bottom={<Button label="I understand" onPress={() => navigation.navigate('Ready')} />}>
      <View style={{ width: 56, height: 56, borderRadius: radius.lg, backgroundColor: tint(c.teal, 0.13), borderWidth: c.borderWidth, borderColor: tint(c.teal, 0.4), alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl, marginTop: spacing.sm }}>
        <Icon name="shieldCheck" color={c.teal} size={28} />
      </View>
      <AppText size={26} weight="700" lineHeightMultiple={1.25}>Private by default. Not a crisis service.</AppText>
      <AppText size={15} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.lg }}>
        TrueShift is a self-reflection and behaviour-change app. It is not therapy, not a medical device, and not a crisis service.
      </AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
        {BULLETS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: c.card, borderWidth: c.borderWidth, borderColor: c.border, borderRadius: radius.md + 2, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
            <Icon name="check" color={c.success} size={18} strokeWidth={2.4} />
            <AppText size={15}>{b}</AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}
