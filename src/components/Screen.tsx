import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';

/**
 * Screen shell — SafeArea + 20px horizontal padding (RN notes), themed
 * background, optional radial-style top glow, optional scroll, keyboard-safe,
 * and a pinned bottom CTA region that respects the home indicator inset.
 */
interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  /** content pinned to the bottom (CTA buttons) */
  bottom?: React.ReactNode;
  /** soft accent glow behind the top of the screen */
  glow?: 'teal' | 'lavender' | 'none';
  /** center children vertically (for hero screens) */
  center?: boolean;
  padHorizontal?: number;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll, bottom, glow = 'none', center, padHorizontal = spacing.xl, contentStyle }: ScreenProps) {
  const { theme, tint } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  const inner = (
    <View style={[{ flex: 1, paddingHorizontal: padHorizontal }, center && { justifyContent: 'center' }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {glow !== 'none' && (
        <LinearGradient
          colors={[tint(glow === 'teal' ? c.teal : c.lavender, 0.16), 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360 }}
          pointerEvents="none"
        />
      )}
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={[{ paddingHorizontal: padHorizontal, paddingBottom: spacing.xxl }, center && { flexGrow: 1, justifyContent: 'center' }, contentStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            inner
          )}
          {bottom && (
            <View style={{ paddingHorizontal: padHorizontal, paddingBottom: Math.max(insets.bottom, spacing.xxl), paddingTop: spacing.sm }}>
              {bottom}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/** Simple themed surface card. */
export function Card({ children, style, intent }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; intent?: 'plain' | 'accent' }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderRadius: 20,
          borderWidth: c.borderWidth,
          borderColor: intent === 'accent' ? c.borderStrong : c.border,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
