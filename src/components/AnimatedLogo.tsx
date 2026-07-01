import React from 'react';
import { ResizeMode, Video } from 'expo-av';
import { useTheme } from '../theme/ThemeContext';
import { WaveMark } from './WaveMark';
import { logoVideo } from '../assets/media';

/**
 * Animated "settling tide" logo (Higgsfield-generated). Falls back to the static
 * SVG WaveMark when no video asset is set or Reduce Motion is on.
 */
export function AnimatedLogo({ size = 124, source = logoVideo }: { size?: number; source?: number | null }) {
  const { reduceMotion } = useTheme();
  if (!source || reduceMotion) return <WaveMark size={size} />;
  return (
    <Video
      source={source}
      style={{ width: size, height: size }}
      resizeMode={ResizeMode.CONTAIN}
      isLooping
      isMuted
      shouldPlay
    />
  );
}
