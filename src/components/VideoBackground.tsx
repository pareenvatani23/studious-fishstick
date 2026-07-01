import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { useTheme } from '../theme/ThemeContext';
import { backgroundVideo } from '../assets/media';

/**
 * Subtle looping video background (Higgsfield-generated). Renders nothing when
 * no asset is set or Reduce Motion is on — in which case the animated gradient
 * (AmbientBackground) shows instead. Kept low-opacity so text stays legible.
 */
export function VideoBackground({ source = backgroundVideo, opacity = 0.5 }: { source?: number | null; opacity?: number }) {
  const { reduceMotion } = useTheme();
  if (!source || reduceMotion) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, overflow: 'hidden' }]}>
      <Video
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay
        // @ts-ignore web attribute passthrough
        pointerEvents="none"
      />
    </View>
  );
}
