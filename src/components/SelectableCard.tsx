import React from 'react';
import { Pressable, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon, IconName } from './icons';
import { radius, spacing, sizing } from '../theme/tokens';

/**
 * SelectableCard — board: "Teal border + ✓ on select". Used for pulls,
 * feelings, responses, actions, options. Selected = accent border + ✓ + tinted
 * surface, so selection never relies on colour alone.
 *
 * Layouts:
 *   'row'   icon · (title + description) · ✓        (lists)
 *   'stack' icon over title                          (grid, e.g. responses)
 */
interface SelectableCardProps {
  title: string;
  description?: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
  intent?: 'teal' | 'lavender';
  layout?: 'row' | 'stack';
  /** right-aligned meta (e.g. "~2 min") */
  meta?: string;
  /** chip-like footer label (e.g. related response) */
  footer?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function SelectableCard({
  title,
  description,
  icon,
  selected,
  onPress,
  intent = 'teal',
  layout = 'row',
  meta,
  footer,
  style,
  children,
}: SelectableCardProps) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const accent = intent === 'lavender' ? c.lavender : c.teal;

  const containerStyle: ViewStyle = {
    backgroundColor: selected ? tint(accent, 0.12) : c.card,
    borderWidth: selected ? Math.max(1.5, c.borderWidth) : c.borderWidth,
    borderColor: selected ? tint(accent, 0.55) : c.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  };

  if (layout === 'stack') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: !!selected }}
        accessibilityLabel={title}
        style={[containerStyle, { minHeight: 88, gap: spacing.md }, style]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {icon && <Icon name={icon} color={selected ? accent : c.text2} size={22} />}
          {selected && <Icon name="check" color={accent} size={20} strokeWidth={2.4} />}
        </View>
        <AppText size={16} weight="600">{title}</AppText>
        {children}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={description ? `${title}. ${description}` : title}
      style={[containerStyle, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
        {icon && (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: selected ? tint(accent, 0.2) : c.soft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} color={selected ? accent : c.text2} size={22} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText size={16} weight="600" style={{ flex: 1 }}>{title}</AppText>
            {meta && <AppText size={12} color={c.muted}>{meta}</AppText>}
          </View>
          {description && <AppText size={13} color={c.text2} lineHeightMultiple={1.4}>{description}</AppText>}
          {footer && (
            <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
              <View style={{ backgroundColor: selected ? tint(accent, 0.14) : c.soft, paddingVertical: 5, paddingHorizontal: 11, borderRadius: radius.full }}>
                <AppText size={12} weight={selected ? '600' : '400'} color={selected ? accent : c.text2}>{footer}</AppText>
              </View>
            </View>
          )}
          {children}
        </View>
        {selected && layout === 'row' && <Icon name="check" color={accent} size={20} strokeWidth={2.2} />}
      </View>
    </Pressable>
  );
}
