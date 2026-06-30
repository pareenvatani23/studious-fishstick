import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme/tokens';

/**
 * Slow, subtle moving gradient blobs that make the app feel alive without
 * distraction. Teal + lavender, very low opacity, long drift loops. Honours
 * Reduce Motion (renders static). Sits behind all screen content.
 */
export function AmbientBackground() {
  const { theme, tint, reduceMotion } = useTheme();
  const { width, height } = useWindowDimensions();
  const c = theme.colors;
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const mk = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    const la = mk(a, 19000);
    const lb = mk(b, 25000);
    la.start();
    lb.start();
    return () => { la.stop(); lb.stop(); };
  }, [a, b, reduceMotion]);

  const size = Math.max(width, height) * 0.9;
  const blobA = {
    transform: [
      { translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.25, width - size * 0.55] }) },
      { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.2, height * 0.25] }) },
      { scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
    ],
  };
  const blobB = {
    transform: [
      { translateX: b.interpolate({ inputRange: [0, 1], outputRange: [width - size * 0.5, -size * 0.2] }) },
      { translateY: b.interpolate({ inputRange: [0, 1], outputRange: [height - size * 0.7, height * 0.35] }) },
      { scale: b.interpolate({ inputRange: [0, 1], outputRange: [1.15, 0.95] }) },
    ],
  };

  const Blob = ({ color, style }: { color: string; style: any }) => (
    <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: radius.full, opacity: theme.isDark ? 0.5 : 0.7 }, style]}>
      <LinearGradient
        colors={[tint(color, theme.isDark ? 0.22 : 0.3), 'transparent']}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, borderRadius: radius.full }}
      />
    </Animated.View>
  );

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Blob color={c.teal} style={reduceMotion ? { transform: [{ translateX: -size * 0.2 }, { translateY: -size * 0.15 }] } : blobA} />
      <Blob color={c.lavender} style={reduceMotion ? { transform: [{ translateX: width - size * 0.5 }, { translateY: height - size * 0.6 }] } : blobB} />
    </View>
  );
}
