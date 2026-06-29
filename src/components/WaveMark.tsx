import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

/**
 * "Settling tide" brand mark — two waves (emotion rises and settles).
 * Teal over dusty lavender. Used on splash, welcome, home and the app icon.
 */
export function WaveMark({ size = 124 }: { size?: number }) {
  const { theme } = useTheme();
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 124 124" fill="none">
      <Path d="M20 64c14-16 28-16 42 0s28 16 42 0" stroke={theme.colors.teal} strokeWidth={5} strokeLinecap="round" />
      <Path d="M20 80c14-16 28-16 42 0s28 16 42 0" stroke={theme.colors.lavender} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
    </Svg>
  );
}
