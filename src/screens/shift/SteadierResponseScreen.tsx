import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { responses } from '../../data/responses';
import { spacing } from '../../theme/tokens';

const READ = 'What do you want to stand on instead? Choose a steadier response.';

/** Steadier Response (design 15). 2-col grid; all options selectable. */
export function SteadierResponseScreen() {
  const { draft, update } = useShiftFlow();
  const nav = useRootNav();
  const [selected, setSelected] = useState<string | undefined>(draft.responseId);

  const next = () => {
    update({ responseId: selected });
    nav.navigate('ActionSelection');
  };

  return (
    <Screen scroll bottom={<Button label="Choose action" onPress={next} disabled={!selected} />}>
      <FlowHeader progress={0.72} onBack={() => nav.goBack()} readAloudText={READ} />
      <AppText size={25} weight="700" lineHeightMultiple={1.25}>What do you want to stand on instead?</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xl }}>
        {responses.map((r) => (
          <View key={r.id} style={{ width: '47.8%' }}>
            <SelectableCard
              layout="stack"
              title={r.label}
              icon={r.icon}
              selected={selected === r.id}
              onPress={() => setSelected(r.id)}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}
