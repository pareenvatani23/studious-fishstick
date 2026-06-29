import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon } from './icons';
import { radius, spacing, sizing } from '../theme/tokens';

/**
 * Chip — board 07. Two intents: 'teal' (action) and 'lavender' (reflection).
 * Selected state uses tinted background + accent border + ✓ (never colour alone).
 */
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  intent?: 'teal' | 'lavender';
  /** static chip (no press) */
  readOnly?: boolean;
}

export function Chip({ label, selected, onPress, intent = 'teal', readOnly }: ChipProps) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const accent = intent === 'lavender' ? c.lavender : c.teal;

  const content = (
    <>
      {selected && <Icon name="check" color={accent} size={15} strokeWidth={2.4} />}
      <AppText size={13} weight={selected ? '600' : '500'} color={selected ? accent : c.text2}>
        {label}
      </AppText>
    </>
  );

  const baseStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs + 2,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    minHeight: 36,
    backgroundColor: selected ? tint(accent, 0.14) : c.elevated,
    borderWidth: c.borderWidth,
    borderColor: selected ? tint(accent, 0.5) : c.border,
  };

  if (readOnly || !onPress) {
    return <Pressable disabled style={baseStyle}>{content}</Pressable>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      hitSlop={6}
      style={baseStyle}
    >
      {content}
    </Pressable>
  );
}
