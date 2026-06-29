import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';
import { Icon, IconName } from './icons';
import { radius, spacing } from '../theme/tokens';

/**
 * Encouraging empty / first-run state. Used on Progress (no shifts yet) and
 * Explore (nothing watched). Useful, not a dead-end — pairs with a CTA.
 */
export function EmptyState({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: React.ReactNode }) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md }}>
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: radius.full,
          backgroundColor: tint(c.teal, 0.12),
          borderWidth: c.borderWidth,
          borderColor: tint(c.teal, 0.4),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} color={c.teal} size={34} />
      </View>
      <AppText size={20} weight="700" align="center">{title}</AppText>
      <AppText size={15} color={c.text2} align="center" lineHeightMultiple={1.5} style={{ maxWidth: 300 }}>{body}</AppText>
      {children}
    </View>
  );
}
