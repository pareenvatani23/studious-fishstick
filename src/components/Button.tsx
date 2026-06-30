import React from 'react';
import { Pressable, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon, IconName } from './icons';
import { radius, sizing, spacing } from '../theme/tokens';

/**
 * Button primitive — variants from design board 05.
 *   primary      filled teal, onAccent label (the hero CTA)
 *   secondary    elevated surface + border
 *   text         no chrome, teal label
 *   destructive  danger-tinted surface + danger border/label
 *
 * Default CTA height 56px; pass `large` for the 60px hero CTA. Always ≥44px tap
 * target; label is the accessibility label by default.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: IconName;
  /** taller hero CTA */
  large?: boolean;
  /** override the height entirely */
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', disabled, icon, large, height, style, accessibilityHint }: ButtonProps) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const h = height ?? (variant === 'text' ? sizing.minTap : large ? 60 : sizing.cta);

  let bg = c.teal;
  let fg = c.onAccent;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    bg = c.elevated;
    fg = c.text1;
    borderColor = c.borderStrong;
    borderWidth = c.borderWidth;
  } else if (variant === 'text') {
    bg = 'transparent';
    fg = c.teal;
  } else if (variant === 'destructive') {
    bg = tint(c.danger, 0.14);
    fg = c.danger;
    borderColor = tint(c.danger, 0.5);
    borderWidth = c.borderWidth;
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          height: h,
          minHeight: sizing.minTap,
          borderRadius: radius.lg,
          backgroundColor: disabled ? c.soft : bg,
          borderColor,
          borderWidth,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
        },
        variant === 'primary' && !disabled && {
          shadowColor: c.teal,
          shadowOpacity: 0.45,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 4,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} color={disabled ? c.muted : fg} size={large ? 22 : 20} />}
      <AppText size={large ? 18 : 16} weight={large ? '700' : '600'} color={disabled ? c.muted : fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Pins one or more buttons to the bottom of a screen, above the safe area. */
export function BottomBar({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap: spacing.md, paddingTop: spacing.md }, style]}>{children}</View>;
}
