import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { ReadAloudInline } from '../../components/ReadAloud';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const READ = 'Hello. This is your calm space. It helps you feel a little steadier. It takes about 3 minutes.';

export function WelcomeScreen({ navigation }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;

  return (
    <Screen
      glow="teal"
      center
      bottom={
        <View style={{ gap: spacing.md }}>
          <Button label="Get started" onPress={() => navigation.navigate('SignUp')} />
          <Button label="I already have an account" variant="text" onPress={() => navigation.navigate('SignIn')} />
          <ReadAloudInline text={READ} />
        </View>
      }
    >
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        {/* concentric "settling" rings */}
        <View style={{ width: 120, height: 120, borderRadius: radius.full, backgroundColor: c.elevated, borderWidth: c.borderWidth, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: radius.full, borderWidth: 2, borderColor: tint(c.teal, 0.3) }} />
          <View style={{ position: 'absolute', width: 62, height: 62, borderRadius: radius.full, borderWidth: 2, borderColor: tint(c.teal, 0.55) }} />
          <View style={{ width: 32, height: 32, borderRadius: radius.full, backgroundColor: c.teal }} />
        </View>
        <AppText size={32} weight="700">Hello.</AppText>
        <AppText size={19} color={c.text1} align="center" lineHeightMultiple={1.5}>
          This is your calm space.{'\n'}It helps you feel a little steadier.
        </AppText>
        <AppText size={16} color={c.text2} align="center">It takes about 3 minutes.</AppText>
      </View>
    </Screen>
  );
}
