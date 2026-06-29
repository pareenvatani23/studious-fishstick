import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme/tokens';

/**
 * ProgressBar — board component. Track + teal→lavender gradient fill.
 * `progress` is 0..1. Used for onboarding steppers and the weekly chart bars.
 */
export function ProgressBar({ progress, height = 8 }: { progress: number; height?: number }) {
  const { theme } = useTheme();
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct * 100), min: 0, max: 100 }}
      style={{ height, borderRadius: radius.full, backgroundColor: theme.colors.elevated, overflow: 'hidden' }}
    >
      <LinearGradient
        colors={[theme.colors.teal, theme.colors.lavender]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${pct * 100}%`, height: '100%', borderRadius: radius.full }}
      />
    </View>
  );
}

/** Segmented step indicator for onboarding (e.g. ▮▮▯). */
export function SegmentedSteps({ total, current }: { total: number; current: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: radius.sm,
            backgroundColor: i <= current ? theme.colors.teal : theme.colors.elevated,
          }}
        />
      ))}
    </View>
  );
}

/** Dot step indicator for the flow (● ○ ○). */
export function DotSteps({ total, current }: { total: number; current: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{ width: 10, height: 10, borderRadius: radius.full, backgroundColor: i === current ? theme.colors.teal : theme.colors.elevated }}
        />
      ))}
    </View>
  );
}
