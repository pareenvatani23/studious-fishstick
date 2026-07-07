import React, { useEffect, useRef } from 'react';
import { Animated, View, Pressable } from 'react-native';
import { AppText } from './AppText';
import { AnimatedLogo } from './AnimatedLogo';
import { spacing, radius } from '../theme/tokens';

// Fixed brand launch colours (theme-independent) so there is no flicker between
// the native splash and this animated splash.
const SPLASH_BG = '#0E1619';
const SPLASH_CARD = '#1F2F35';
const SPLASH_TEXT = '#E6EBEB';
const SPLASH_SUB = '#9DABAE';
const SPLASH_TEAL = '#74C7B8';

// expo-splash-screen is a native module; on an OTA delivered to an older build
// that lacks it, require() throws — so load it defensively and no-op if absent.
let SplashScreen: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SplashScreen = require('expo-splash-screen');
} catch {}

/**
 * Launch splash shown on every cold start: the Higgsfield "settling tide" logo
 * animation + wordmark, then a gentle fade-out. Auto-dismisses (~2.6s) and is
 * tappable to skip. Honours Reduce Motion (AnimatedLogo falls back to the SVG).
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(8)).current;
  const done = useRef(false);

  const dismiss = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => onDone());
  };

  useEffect(() => {
    // Our splash is painted — hand off from the native splash (no dark gap).
    SplashScreen?.hideAsync?.().catch?.(() => {});
    Animated.timing(rise, { toValue: 0, duration: 700, useNativeDriver: true }).start();
    const t = setTimeout(dismiss, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: fade }}>
      <Pressable onPress={dismiss} accessibilityRole="button" accessibilityLabel="Skip intro" style={{ flex: 1, backgroundColor: SPLASH_BG, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ alignItems: 'center', gap: spacing.xl, transform: [{ translateY: rise }] }}>
          <View style={{ width: 132, height: 132, borderRadius: radius.xxl, backgroundColor: SPLASH_CARD, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: SPLASH_TEAL, shadowOpacity: 0.5, shadowRadius: 40, shadowOffset: { width: 0, height: 0 }, elevation: 8 }}>
            <AnimatedLogo size={132} />
          </View>
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <AppText size={30} weight="700" letterSpacing={-0.5} color={SPLASH_TEXT}>TrueShift</AppText>
            <AppText size={14} color={SPLASH_SUB}>Your daily reset for a steadier mind.</AppText>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
