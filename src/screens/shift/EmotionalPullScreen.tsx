import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { pulls } from '../../data/pulls';
import { spacing } from '../../theme/tokens';

const READ = 'What pulled you today? Choose the one that fits best.';

/** Emotional Pull Selection (design 12, Full mode). Single select. */
export function EmotionalPullScreen() {
  const { draft, update } = useShiftFlow();
  const nav = useRootNav();
  const [selected, setSelected] = useState<string | undefined>(draft.pullId);

  const next = () => {
    update({ pullId: selected });
    nav.navigate('NameStory');
  };

  return (
    <Screen scroll bottom={<Button label="Continue" onPress={next} disabled={!selected} />}>
      <FlowHeader progress={0.2} onBack={() => nav.goBack()} readAloudText={READ} />
      <AppText size={26} weight="700">What pulled you today?</AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {pulls.map((p) => (
          <SelectableCard
            key={p.id}
            title={p.cardLabel}
            description={p.description}
            icon={p.icon}
            intent="lavender"
            selected={selected === p.id}
            onPress={() => setSelected(p.id)}
          />
        ))}
      </View>
    </Screen>
  );
}
