import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { SelectableCard } from '../../components/SelectableCard';
import { useTheme } from '../../theme/ThemeContext';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { actions } from '../../data/actions';
import { responseById } from '../../data/responses';
import { spacing } from '../../theme/tokens';

/** Choose Small Action (design 16). Actions related to the chosen response float to the top. */
export function ActionSelectionScreen() {
  const { theme } = useTheme();
  const { draft, update } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;
  const [selected, setSelected] = useState<string | undefined>(draft.actionId);

  const ordered = useMemo(() => {
    if (!draft.responseId) return actions;
    return [...actions].sort((a, b) => Number(b.relatedResponse === draft.responseId) - Number(a.relatedResponse === draft.responseId));
  }, [draft.responseId]);

  const next = () => {
    update({ actionId: selected });
    nav.navigate('ProofCollected');
  };

  return (
    <Screen scroll bottom={<Button label="Lock this action" onPress={next} disabled={!selected} />}>
      <FlowHeader progress={0.86} onBack={() => nav.goBack()} readAloudText="One small action. Do not aim for perfect. Aim for proof." />
      <AppText size={26} weight="700">One small action.</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.sm }}>Do not aim for perfect. Aim for proof.</AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {ordered.map((a) => (
          <SelectableCard
            key={a.id}
            title={a.title}
            description={a.description}
            meta={`~${a.estMinutes} min`}
            footer={responseById(a.relatedResponse)?.label}
            selected={selected === a.id}
            onPress={() => setSelected(a.id)}
          />
        ))}
      </View>
    </Screen>
  );
}
