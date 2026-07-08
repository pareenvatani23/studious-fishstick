import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { WaveMark } from './WaveMark';
import { useTheme } from '../theme/ThemeContext';

/**
 * Animated "settling tide" brand mark — a gentle breathing + drift on the
 * transparent SVG WaveMark (emotion rises and settles). Transparent everywhere
 * (no baked-in background), so it sits cleanly on any theme. Falls back to a
 * static mark under Reduce Motion.
 */
export function AnimatedLogo({ size = 124 }: { size?: number; source?: number | null }) {
  const { reduceMotion } = useTheme();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, reduceMotion]);

  if (reduceMotion) return <WaveMark size={size} />;

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [size * 0.02, -size * 0.02] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.03] });
  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
      <WaveMark size={size} />
    </Animated.View>
  );
}
