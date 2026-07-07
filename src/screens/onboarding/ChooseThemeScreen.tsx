import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { themes, themeOrder } from '../../theme/themes';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseTheme'>;

/** First-run theme picker. Sets a live-previewed theme; changeable later in Profile. */
export function ChooseThemeScreen({ navigation }: Props) {
  const { theme, themeName, setTheme } = useTheme();
  const c = theme.colors;

  return (
    <Screen bottom={<Button label="Next" onPress={() => navigation.navigate('TextSize')} />}>
      <AppText size={27} weight="700" style={{ marginTop: spacing.lg }}>Pick a look that feels calm</AppText>
      <AppText size={15} color={c.text2} style={{ marginTop: spacing.md }} lineHeightMultiple={1.4}>
        Tap to preview. You can change it anytime in your profile.
      </AppText>
      <ScrollView style={{ marginTop: spacing.xl }} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.md }} showsVerticalScrollIndicator={false}>
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
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: t.swatch, borderWidth: 1, borderColor: t.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 14, height: 14, borderRadius: radius.full, backgroundColor: t.colors.teal }} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText size={15} weight="600">{t.label}</AppText>
                <AppText size={12} color={c.text2}>{t.description}</AppText>
              </View>
              {selected && <Icon name="check" color={c.teal} size={22} strokeWidth={2.4} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
