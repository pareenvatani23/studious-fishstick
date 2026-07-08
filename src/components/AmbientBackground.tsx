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
  const e = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const mk = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    // Noticeably livelier drift (shorter loops, wider travel) but still calm.
    const la = mk(a, 12000);
    const lb = mk(b, 16000);
    const le = mk(e, 20000);
    la.start();
    lb.start();
    le.start();
    return () => { la.stop(); lb.stop(); le.stop(); };
  }, [a, b, e, reduceMotion]);

  const size = Math.max(width, height) * 0.95;
  const blobA = {
    transform: [
      { translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.35, width - size * 0.45] }) },
      { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.3, height * 0.35] }) },
      { scale: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] }) },
    ],
  };
  const blobB = {
    transform: [
      { translateX: b.interpolate({ inputRange: [0, 1], outputRange: [width - size * 0.45, -size * 0.3] }) },
      { translateY: b.interpolate({ inputRange: [0, 1], outputRange: [height - size * 0.6, height * 0.15] }) },
      { scale: b.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.2, 0.9, 1.2] }) },
    ],
  };
  const blobE = {
    transform: [
      { translateX: e.interpolate({ inputRange: [0, 1], outputRange: [width * 0.1, width * 0.55] }) },
      { translateY: e.interpolate({ inputRange: [0, 1], outputRange: [height * 0.55, height * 0.05] }) },
      { scale: e.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1.15, 0.85] }) },
    ],
  };

  const Blob = ({ color, style }: { color: string; style: any }) => (
    <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: radius.full, opacity: theme.isDark ? 0.62 : 0.85 }, style]}>
      <LinearGradient
        colors={[tint(color, theme.isDark ? 0.34 : 0.45), 'transparent']}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, borderRadius: radius.full }}
      />
    </Animated.View>
  );

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Blob color={c.teal} style={reduceMotion ? { transform: [{ translateX: -size * 0.2 }, { translateY: -size * 0.15 }] } : blobA} />
      <Blob color={c.lavender} style={reduceMotion ? { transform: [{ translateX: width - size * 0.5 }, { translateY: height - size * 0.6 }] } : blobB} />
      {!reduceMotion && <Blob color={c.teal} style={blobE} />}
    </View>
  );
}
