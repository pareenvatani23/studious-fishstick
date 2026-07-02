import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Theme, ThemeName, themes, rgba } from './themes';
import { textSizeScale, TextSizeName } from './tokens';
import { useApp } from '../store/AppState';

/**
 * Display & comfort context. Display preferences now live in the DB (per user,
 * via AppState); this context just projects them into the active theme object
 * and exposes setters that write through to the DB. Must sit UNDER
 * <AppStateProvider>.
 */
const DEFAULT_THEME: ThemeName = 'calmDark';

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
  scale: (size: number) => number;
  tint: (hex: string, alpha: number) => string;
  resetDisplay: () => Promise<void>;
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const themeName = (themes[app.theme as ThemeName] ? (app.theme as ThemeName) : DEFAULT_THEME);
  const textSize = app.textSize;

  const setTheme = useCallback((name: ThemeName) => app.setDisplayPref({ theme: name }), [app]);
  const setTextSize = useCallback((size: TextSizeName) => app.setDisplayPref({ textSize: size }), [app]);
  const setReduceMotion = useCallback((v: boolean) => app.setDisplayPref({ reduceMotion: v }), [app]);
  const setReadAloud = useCallback((v: boolean) => app.setDisplayPref({ readAloud: v }), [app]);
  const resetDisplay = useCallback(async () => {
    app.setDisplayPref({ theme: DEFAULT_THEME, textSize: 'Normal', reduceMotion: false, readAloud: false });
  }, [app]);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = themes[themeName];
    return {
      theme,
      themeName,
      setTheme,
      textSize,
      setTextSize,
      reduceMotion: app.reduceMotion,
      setReduceMotion,
      readAloud: app.readAloud,
      setReadAloud,
      scale: (size: number) => Math.round(size * textSizeScale[textSize]),
      tint: rgba,
      resetDisplay,
      hydrated: app.hydrated,
    };
  }, [themeName, textSize, app.reduceMotion, app.readAloud, app.hydrated, setTheme, setTextSize, setReduceMotion, setReadAloud, resetDisplay]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
