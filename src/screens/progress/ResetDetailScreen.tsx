import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { RoundIconButton } from '../../components/Header';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/icons';
import { SectionLabel } from '../../components/Settings';
import { useTheme } from '../../theme/ThemeContext';
import { useApp } from '../../store/AppState';
import { useRootNav } from '../../navigation/hooks';
import { situationById } from '../../data/situations';
import { radius, spacing, sizing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetDetail'>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Full detail of a single past reset — feeling, situation, reframe, step, outcome. */
export function ResetDetailScreen({ route }: Props) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();
  const { resets } = useApp();
  const reset = resets.find((r) => r.id === route.params.id);

  if (!reset) {
    return (
      <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
          <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
        </View>
        <AppText size={18} weight="600">This reset isn’t available.</AppText>
      </Screen>
    );
  }

  const situationLabel = reset.customSituation?.trim() || (reset.situationId ? situationById(reset.situationId)?.label : '') || 'A moment';
  const done = reset.outcome === 'done';

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <RoundIconButton icon="back" onPress={() => nav.goBack()} label="Go back" />
      </View>

      <AppText size={13} color={c.muted}>{formatDate(reset.date)}</AppText>
      <AppText size={26} weight="700" lineHeightMultiple={1.2} style={{ marginTop: spacing.xs }}>{situationLabel}</AppText>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
        {reset.emotion ? <Chip label={reset.emotion} intent="lavender" readOnly /> : null}
        {typeof reset.heaviness === 'number' ? <Chip label={`Heaviness ${reset.heaviness}/5`} intent="teal" readOnly /> : null}
        {reset.distortion ? <Chip label={reset.distortion} intent="teal" readOnly /> : null}
      </View>

      {reset.note ? (
        <Card style={{ marginTop: spacing.lg }}>
          <SectionLabel>The thought</SectionLabel>
          <AppText size={16} lineHeightMultiple={1.5} style={{ marginTop: spacing.sm }}>{reset.note}</AppText>
        </Card>
      ) : null}

      {reset.reframe ? (
        <Card style={{ marginTop: spacing.md }}>
          <SectionLabel>Another way to see it</SectionLabel>
          <AppText size={16} lineHeightMultiple={1.5} style={{ marginTop: spacing.sm }}>{reset.reframe}</AppText>
        </Card>
      ) : null}

      {reset.actionText ? (
        <Card style={{ marginTop: spacing.md }}>
          <SectionLabel>One small step</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginTop: spacing.sm }}>
            <View style={{ width: 26, height: 26, borderRadius: radius.full, backgroundColor: done ? tint(c.success, 0.16) : c.elevated, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
              <Icon name={done ? 'check' : 'target'} color={done ? c.success : c.muted} size={16} strokeWidth={2.4} />
            </View>
            <AppText size={16} lineHeightMultiple={1.5} style={{ flex: 1 }}>{reset.actionText}</AppText>
          </View>
          <AppText size={13} color={done ? c.success : c.muted} style={{ marginTop: spacing.md }}>
            {done ? 'You marked this done. Nice.' : 'Not marked done — that’s okay.'}
          </AppText>
        </Card>
      ) : null}

      {reset.keywords && reset.keywords.length > 0 ? (
        <Card style={{ marginTop: spacing.md }}>
          <SectionLabel>Thought tags</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
            {reset.keywords.map((k, i) => (
              <View key={`${k}-${i}`} style={{ paddingVertical: 5, paddingHorizontal: 11, borderRadius: radius.full, backgroundColor: tint(c.lavender, 0.12), borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.3) }}>
                <AppText size={13} weight="600" color={c.lavender}>{k}</AppText>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
