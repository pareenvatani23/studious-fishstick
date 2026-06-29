import React from 'react';
import { View, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SegmentedSteps } from '../../components/ProgressBar';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { TextSizeName } from '../../theme/tokens';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TextSize'>;

const OPTIONS: { name: TextSizeName; sample: number }[] = [
  { name: 'Normal', sample: 20 },
  { name: 'Large', sample: 28 },
  { name: 'Largest', sample: 36 },
];

export function TextSizeScreen({ navigation }: Props) {
  const { theme, textSize, setTextSize } = useTheme();
  const c = theme.colors;

  return (
    <Screen bottom={<Button label="Next" onPress={() => navigation.navigate('ReadAloud')} />}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.xxl }}>
        <SegmentedSteps total={3} current={1} />
      </View>
      <AppText size={28} weight="700">Let's make it comfy.</AppText>
      <AppText size={17} color={c.text2} style={{ marginTop: spacing.md }}>How big should the words be?</AppText>

      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
        {OPTIONS.map((o) => {
          const selected = textSize === o.name;
          return (
            <Pressable
              key={o.name}
              onPress={() => setTextSize(o.name)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${o.name} text size`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: c.card,
                borderRadius: radius.xl,
                borderWidth: selected ? 2 : c.borderWidth,
                borderColor: selected ? c.teal : c.border,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.xl,
              }}
            >
              <AppText size={o.name === 'Normal' ? 18 : o.name === 'Large' ? 22 : 26} weight="600">{o.name}</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <AppText size={o.sample} weight="700" color={selected ? c.teal : c.text2}>Aa</AppText>
                {selected && <Icon name="check" color={c.teal} size={22} strokeWidth={2.4} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
