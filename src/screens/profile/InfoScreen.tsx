import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, sizing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Info'>;

/**
 * Generic info screen for About / Terms / Privacy. Non-clinical copy.
 * The legal text below is placeholder boilerplate for the MVP — replace with
 * reviewed Terms & Privacy Policy before release.
 */
const CONTENT: Record<Props['route']['params']['kind'], { title: string; paragraphs: string[] }> = {
  about: {
    title: 'About TrueShift',
    paragraphs: [
      'TrueShift is your daily reset for a steadier mind.',
      'Pause. Name the story. Choose a steadier response. Take one small action.',
      'It is a self-reflection and behaviour-change app — not therapy, not a medical device, and not a crisis service.',
      'Reminders are not yet available in this MVP build. [PLACEHOLDER — reminder settings coming soon.]',
    ],
  },
  privacy: {
    title: 'Privacy',
    paragraphs: [
      'Private by default. TrueShift stores everything on this device.',
      'No account is required. There are no ads and no social feed. Nothing is sent to a server in this MVP.',
      'You can delete all of your data at any time from You → Delete data.',
    ],
  },
  terms: {
    title: 'Terms · Privacy Policy',
    paragraphs: [
      '[PLACEHOLDER — Terms of Use]',
      '[PLACEHOLDER — Privacy Policy]',
      'Replace this screen with your reviewed legal copy before release.',
    ],
  },
};

export function InfoScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const data = CONTENT[route.params.kind];

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => navigation.goBack()} label="Go back" />
      </View>
      <AppText size={26} weight="700">{data.title}</AppText>
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        {data.paragraphs.map((p, i) => (
          <AppText key={i} size={16} color={c.text2} lineHeightMultiple={1.55}>{p}</AppText>
        ))}
      </View>
    </Screen>
  );
}
