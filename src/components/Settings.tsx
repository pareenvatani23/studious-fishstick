import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon } from './icons';
import { radius, spacing, sizing } from '../theme/tokens';

/** Custom pill toggle (design screen 22). Accessible switch role. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      hitSlop={8}
      style={{
        width: 48,
        height: 28,
        borderRadius: radius.full,
        backgroundColor: value ? c.teal : c.soft,
        borderWidth: value ? 0 : c.borderWidth,
        borderColor: c.border,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radius.full,
          backgroundColor: value ? c.onAccent : c.text2,
          marginLeft: value ? 23 : 3,
        }}
      />
    </Pressable>
  );
}

/** Uppercase muted section label. */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useTheme();
  return (
    <AppText size={12} weight="700" color={theme.colors.muted} uppercase letterSpacing={1} style={style}>
      {children}
    </AppText>
  );
}

/** A grouped list (rounded surface) of rows. */
export function ListGroup({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[{ backgroundColor: c.card, borderRadius: radius.xl, borderWidth: c.borderWidth, borderColor: c.border, overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}

/** A single navigable settings row with a chevron. */
export function SettingsRow({ label, onPress, last, danger, value }: { label: string; onPress?: () => void; last?: boolean; danger?: boolean; value?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        minHeight: sizing.minTap + 8,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: last ? 0 : c.borderWidth,
        borderBottomColor: c.border,
      }}
    >
      <AppText size={15} color={danger ? c.danger : c.text1}>{label}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {value && <AppText size={14} color={c.muted}>{value}</AppText>}
        <Icon name="chevronRight" color={c.muted} size={18} />
      </View>
    </Pressable>
  );
}
