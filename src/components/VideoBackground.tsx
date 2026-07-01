import React, { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import { useTheme } from '../theme/ThemeContext';
import { backgroundVideo } from '../assets/media';

/**
 * Subtle looping video background. The generated clip isn't a seamless loop, so
 * instead of expo-av's hard `isLooping` (which visibly snaps back), we crossfade:
 * fade out just before the end, replay, fade back in. Renders nothing when no
 * asset or Reduce Motion is on (the animated gradient shows instead).
 */
export function VideoBackground({ source = backgroundVideo, opacity = 0.5 }: { source?: number | null; opacity?: number }) {
  const { reduceMotion } = useTheme();
  const videoRef = useRef<Video>(null);
  const fade = useRef(new Animated.Value(opacity)).current;
  const fadingRef = useRef(false);

  if (!source || reduceMotion) return null;

  const onStatus = (st: AVPlaybackStatus) => {
    if (!st.isLoaded || !st.durationMillis) return;
    if (!fadingRef.current && st.positionMillis >= st.durationMillis - 500) {
      fadingRef.current = true;
      Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    }
    if (st.didJustFinish) {
      videoRef.current?.replayAsync().catch(() => {});
      Animated.timing(fade, { toValue: opacity, duration: 800, useNativeDriver: true }).start(() => {
        fadingRef.current = false;
      });
    }
  };

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade, overflow: 'hidden' }]}>
      <Video
        ref={videoRef}
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        isMuted
        shouldPlay
        onPlaybackStatusUpdate={onStatus}
      />
    </Animated.View>
  );
}
