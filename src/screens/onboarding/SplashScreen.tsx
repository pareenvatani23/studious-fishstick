import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { theme, reduceMotion } = useTheme();
  const c = theme.colors;
  const glow = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.85, duration: 2500, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.55, duration: 2500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow, reduceMotion]);

  return (
    <Screen glow="teal" center bottom={<Button label="Start" onPress={() => navigation.navigate('Welcome')} />}>
      <View style={{ alignItems: 'center', gap: spacing.xxl }}>
        <Animated.View
          style={{
            width: 124,
            height: 124,
            borderRadius: 34,
            backgroundColor: c.elevated,
            borderWidth: c.borderWidth,
            borderColor: c.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: reduceMotion ? 1 : glow,
            shadowColor: c.teal,
            shadowOpacity: 0.5,
            shadowRadius: 40,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          }}
        >
          <AnimatedLogo size={124} />
        </Animated.View>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <AppText size={33} weight="700" letterSpacing={-0.6}>TrueShift</AppText>
          <AppText size={15} color={c.text2} align="center">Your daily reset for a steadier mind.</AppText>
        </View>
      </View>
    </Screen>
  );
}
