import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon, IconName } from './icons';
import { ProgressBar, DotSteps } from './ProgressBar';
import { ReadAloudIconButton } from './ReadAloud';
import { radius, spacing, sizing } from '../theme/tokens';

/** 44px round icon button used for back/forward chrome. */
export function RoundIconButton({ icon, onPress, label, accent }: { icon: IconName; onPress?: () => void; label: string; accent?: 'teal' | 'lavender' }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: sizing.minTap,
        height: sizing.minTap,
        borderRadius: radius.full,
        backgroundColor: c.card,
        borderWidth: c.borderWidth,
        borderColor: c.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} color={accent === 'lavender' ? c.lavender : accent === 'teal' ? c.teal : c.text2} size={22} />
    </Pressable>
  );
}

/** Flow header: back · thin progress bar · optional read-aloud (Full flow). */
export function FlowHeader({ onBack, progress, readAloudText }: { onBack?: () => void; progress: number; readAloudText?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
      <RoundIconButton icon="back" onPress={onBack} label="Go back" />
      <View style={{ flex: 1 }}>
        <ProgressBar progress={progress} height={4} />
      </View>
      {readAloudText ? <ReadAloudIconButton text={readAloudText} /> : null}
    </View>
  );
}

/** Easy-mode step header: back · dots · read-aloud. */
export function StepDotsHeader({ onBack, total, current, readAloudText }: { onBack?: () => void; total: number; current: number; readAloudText?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
      <RoundIconButton icon="back" onPress={onBack} label="Go back" />
      <DotSteps total={total} current={current} />
      {readAloudText ? <ReadAloudIconButton text={readAloudText} /> : <View style={{ width: sizing.minTap }} />}
    </View>
  );
}
