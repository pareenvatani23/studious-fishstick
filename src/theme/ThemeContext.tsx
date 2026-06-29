import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, themes, rgba } from './themes';
import { textSizeScale, TextSizeName } from './tokens';

/**
 * Display & comfort context. Swaps the active theme's token object and exposes
 * the in-app text-size + reduce-motion + read-aloud preferences. Every
 * component should read colours via useTheme().theme.colors and scale font
 * sizes via useTheme().scale().
 */

const STORAGE_KEY = '@trueshift/display';

interface DisplayPrefs {
  themeName: ThemeName;
  textSize: TextSizeName;
  reduceMotion: boolean;
  readAloud: boolean;
}

const DEFAULTS: DisplayPrefs = {
  themeName: 'calmDark',
  textSize: 'Normal',
  reduceMotion: false,
  readAloud: false,
};

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  textSize: TextSizeName;
  setTextSize: (size: TextSizeName) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  readAloud: boolean;
  setReadAloud: (v: boolean) => void;
  /** scale a base font size by the active in-app text-size step */
  scale: (size: number) => number;
  /** accent tint helper: tint(theme.colors.teal, 0.14) */
  tint: (hex: string, alpha: number) => string;
  /** clear all display prefs (used by Delete data) */
  resetDisplay: () => Promise<void>;
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<DisplayPrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        // local-only app; ignore read errors and fall back to defaults
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback((next: DisplayPrefs) => {
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setTheme = useCallback((themeName: ThemeName) => persist({ ...prefs, themeName }), [persist, prefs]);
  const setTextSize = useCallback((textSize: TextSizeName) => persist({ ...prefs, textSize }), [persist, prefs]);
  const setReduceMotion = useCallback((reduceMotion: boolean) => persist({ ...prefs, reduceMotion }), [persist, prefs]);
  const setReadAloud = useCallback((readAloud: boolean) => persist({ ...prefs, readAloud }), [persist, prefs]);

  const resetDisplay = useCallback(async () => {
    setPrefs(DEFAULTS);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = themes[prefs.themeName];
    return {
      theme,
      themeName: prefs.themeName,
      setTheme,
      textSize: prefs.textSize,
      setTextSize,
      reduceMotion: prefs.reduceMotion,
      setReduceMotion,
      readAloud: prefs.readAloud,
      setReadAloud,
      scale: (size: number) => Math.round(size * textSizeScale[prefs.textSize]),
      tint: rgba,
      resetDisplay,
      hydrated,
    };
  }, [prefs, setTheme, setTextSize, setReduceMotion, setReadAloud, resetDisplay, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
