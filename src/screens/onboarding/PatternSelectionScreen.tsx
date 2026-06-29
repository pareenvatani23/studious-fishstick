import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { RoundIconButton } from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { pulls } from '../../data/pulls';
import { spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PatternSelection'>;

/**
 * Pattern Selection (brief screen 3). Multi-select; enables Full mode. Reached
 * when the user opts into Full mode from Profile. Easy mode never requires it.
 */
export function PatternSelectionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { patternsSelected, setPatternsSelected, setMode } = useApp();
  const c = theme.colors;
  const [selected, setSelected] = useState<string[]>(patternsSelected);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const build = () => {
    setPatternsSelected(selected);
    setMode('full');
    navigation.navigate('Main');
  };

  return (
    <Screen
      scroll
      bottom={<Button label="Build my reset" onPress={build} disabled={selected.length === 0} />}
    >
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => navigation.goBack()} label="Go back" />
      </View>
      <AppText size={26} weight="700">What pulls you most often?</AppText>
      <AppText size={15} color={c.text2} style={{ marginTop: spacing.sm }}>Choose anything that feels familiar.</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xl }}>
        {pulls.map((p) => (
          <Chip key={p.id} label={p.label} intent="lavender" selected={selected.includes(p.id)} onPress={() => toggle(p.id)} />
        ))}
      </View>
    </Screen>
  );
}
