import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { StepDotsHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { useTheme } from '../../theme/ThemeContext';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { feelings } from '../../data/feelings';
import { spacing } from '../../theme/tokens';

const READ = 'What are you feeling right now? Tap one. There is no wrong answer.';

/** Easy Shift step (design 09) — plain feelings, tap-only, big cards. */
export function EasyFeelingScreen() {
  const { theme } = useTheme();
  const { draft, update } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const [selected, setSelected] = useState<string | undefined>(draft.feelingId);

  const next = () => {
    update({ feelingId: selected });
    nav.navigate('Reframe');
  };

  return (
    <Screen
      scroll
      bottom={<Button label="Next" onPress={next} disabled={!selected} />}
    >
      <StepDotsHeader total={3} current={0} onBack={() => nav.goBack()} readAloudText={READ} />
      <AppText size={28} weight="700" lineHeightMultiple={1.2}>What are you feeling right now?</AppText>
      <AppText size={16} color={c.text2} style={{ marginTop: spacing.md }}>Tap one. There's no wrong answer.</AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {feelings.map((f) => (
          <SelectableCard
            key={f.id}
            title={f.label}
            icon={f.icon}
            intent={f.accent}
            selected={selected === f.id}
            onPress={() => setSelected(f.id)}
          />
        ))}
      </View>
    </Screen>
  );
}
