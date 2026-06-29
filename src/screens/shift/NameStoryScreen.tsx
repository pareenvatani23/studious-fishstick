import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { FlowHeader } from '../../components/Header';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { useTheme } from '../../theme/ThemeContext';
import { useShiftFlow } from '../../store/ShiftFlow';
import { useRootNav } from '../../navigation/hooks';
import { emotionWords } from '../../data/emotions';
import { radius, spacing } from '../../theme/tokens';

/** Name the Story (design 13, Full mode). Guided reflection, not a dense form. */
export function NameStoryScreen() {
  const { theme } = useTheme();
  const { draft, updateStory } = useShiftFlow();
  const nav = useRootNav();
  const c = theme.colors;

  const [whatHappened, setWhatHappened] = useState(draft.story.whatHappened ?? '');
  const [mindSaid, setMindSaid] = useState(draft.story.mindSaid ?? '');
  const [emotions, setEmotions] = useState<string[]>(draft.story.emotions ?? []);
  const [wantedToDo, setWantedToDo] = useState(draft.story.wantedToDo ?? '');

  const toggleEmotion = (w: string) => setEmotions((e) => (e.includes(w) ? e.filter((x) => x !== w) : [...e, w]));

  const next = () => {
    updateStory({ whatHappened, mindSaid, emotions, wantedToDo });
    nav.navigate('Reframe');
  };

  return (
    <Screen scroll bottom={<Button label="Show me the shift" onPress={next} />}>
      <FlowHeader progress={0.45} onBack={() => nav.goBack()} readAloudText="Name the story. A thought is not a fact. Let's write what your mind created." />
      <AppText size={26} weight="700">Name the story.</AppText>
      <AppText size={14} color={c.text2} lineHeightMultiple={1.5} style={{ marginTop: spacing.sm }}>
        A thought is not a fact. Let's write what your mind created.
      </AppText>
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        <Input label="What happened?" value={whatHappened} onChangeText={setWhatHappened} placeholder="Just the facts…" />
        <Input label="What did your mind say?" value={mindSaid} onChangeText={setMindSaid} placeholder="The story your mind added…" />
        <Card>
          <AppText size={12} weight="600" color={c.muted}>What emotion showed up?</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
            {emotionWords.map((w) => (
              <Chip key={w} label={w} intent="lavender" selected={emotions.includes(w)} onPress={() => toggleEmotion(w)} />
            ))}
          </View>
        </Card>
        <Input label="What did it make you want to do?" value={wantedToDo} onChangeText={setWantedToDo} placeholder="The urge you felt…" />
      </View>
    </Screen>
  );
}
