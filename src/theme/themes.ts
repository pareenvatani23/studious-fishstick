/**
 * TrueShift — 5 switchable themes, neurodivergent-friendly.
 * Values are taken from the design-system "Switchable Themes" board and the
 * per-theme preview cards. Calm Dark is the default.
 *
 * Rule from the board: colour carries meaning, never decoration; never colour
 * alone for state (always pair with border + ✓). Components must read every
 * colour from the active theme — no hard-coded hex in components/screens.
 */

export type ThemeName =
  | 'calmDark'
  | 'warmSand'
  | 'lowStimulation'
  | 'warmNight'
  | 'highContrast'
  | 'softLight';

export interface ThemeColors {
  /** Surfaces */
  background: string;
  card: string;
  elevated: string;
  soft: string;
  /** Brand accents — teal = shift/action, lavender = reflection/inner pattern */
  teal: string;
  lavender: string;
  /** Status */
  success: string;
  warning: string;
  danger: string;
  /** Text */
  text1: string; // primary
  text2: string; // secondary
  muted: string; // metadata
  /** Lines */
  border: string;
  borderStrong: string;
  borderWidth: number;
  /** Text colour that sits on a filled teal button */
  onAccent: string;
  /** Modal scrim */
  overlay: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  /** affects status bar + a few subtle treatments */
  isDark: boolean;
  /** swatch shown in the theme picker */
  swatch: string;
  colors: ThemeColors;
}

/** Compose an rgba() string from a #RRGGBB hex + alpha. Used for accent tints. */
export function rgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const themes: Record<ThemeName, Theme> = {
  calmDark: {
    name: 'calmDark',
    label: 'Calm Dark',
    description: 'Recommended',
    isDark: true,
    swatch: '#0E1619',
    colors: {
      background: '#0E1619',
      card: '#18262B',
      elevated: '#1F2F35',
      soft: '#243036',
      teal: '#74C7B8',
      lavender: '#A99BD4',
      success: '#6FC7A0',
      warning: '#E0B074',
      danger: '#E0808C',
      text1: '#E6EBEB',
      text2: '#9DABAE',
      muted: '#6B7A7D',
      border: 'rgba(255,255,255,0.08)',
      borderStrong: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      onAccent: '#0E1619',
      overlay: 'rgba(5,9,11,0.55)',
    },
  },

  warmSand: {
    name: 'warmSand',
    label: 'Warm Sand',
    description: 'Warm, calm daylight',
    isDark: false,
    swatch: '#EFE6D6',
    colors: {
      // Editorial warm-light palette (sand + sage + soft plum), MindDay-esque.
      background: '#F5EEE2',
      card: '#FCF7EE',
      elevated: '#FFFFFF',
      soft: '#EDE4D4',
      teal: '#4E9A86',
      lavender: '#8B7BB0',
      success: '#4E9A86',
      warning: '#C08A4E',
      danger: '#C56B63',
      text1: '#332F29',
      text2: '#7C766C',
      muted: '#A79E8F',
      border: 'rgba(60,50,35,0.09)',
      borderStrong: 'rgba(60,50,35,0.16)',
      borderWidth: 1,
      onAccent: '#FCF7EE',
      overlay: 'rgba(38,32,25,0.4)',
    },
  },

  lowStimulation: {
    name: 'lowStimulation',
    label: 'Low Stimulation',
    description: 'Fewer colours, very quiet',
    isDark: true,
    swatch: '#181B1C',
    colors: {
      // Single muted accent — no second hue, as specified on the board.
      background: '#181B1C',
      card: '#202425',
      elevated: '#272B2C',
      soft: '#2C3031',
      teal: '#8FB3A6',
      lavender: '#8FB3A6',
      success: '#8FB3A6',
      warning: '#C2A98C',
      danger: '#C29696',
      text1: '#DADDDC',
      text2: '#7E8485',
      muted: '#6E7475',
      border: 'rgba(255,255,255,0.08)',
      borderStrong: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      onAccent: '#181B1C',
      overlay: 'rgba(5,7,8,0.55)',
    },
  },

  warmNight: {
    name: 'warmNight',
    label: 'Warm Night',
    description: 'Less blue light, calming',
    isDark: true,
    swatch: '#16120E',
    colors: {
      background: '#16120E',
      card: '#1E1813',
      elevated: '#261F18',
      soft: '#2C241B',
      teal: '#D8B98C',
      lavender: '#C99B96',
      success: '#A9C99C',
      warning: '#D8B98C',
      danger: '#C99696',
      text1: '#ECE3D8',
      text2: '#8A7C6C',
      muted: '#756A5C',
      border: 'rgba(255,255,255,0.07)',
      borderStrong: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      onAccent: '#16120E',
      overlay: 'rgba(8,5,3,0.55)',
    },
  },

  highContrast: {
    name: 'highContrast',
    label: 'High Contrast',
    description: 'Easier to read',
    isDark: true,
    swatch: '#000507',
    colors: {
      background: '#000507',
      card: '#0E1518',
      elevated: '#16201F',
      soft: '#1A2528',
      teal: '#5BD6C2',
      lavender: '#B9A9E8',
      success: '#5BD6C2',
      warning: '#F0C88C',
      danger: '#F0909C',
      text1: '#FFFFFF',
      text2: '#C8D2D4',
      muted: '#9FB0B2',
      border: '#2E3A3E',
      borderStrong: '#3E4A4E',
      borderWidth: 2,
      onAccent: '#000507',
      overlay: 'rgba(0,0,0,0.7)',
    },
  },

  softLight: {
    name: 'softLight',
    label: 'Soft Light',
    description: 'Gentle daytime',
    isDark: false,
    swatch: '#F2EEE7',
    colors: {
      background: '#F2EEE7',
      card: '#FBF8F3',
      elevated: '#FFFFFF',
      soft: '#ECE7DE',
      teal: '#3E9E8C',
      lavender: '#7C6FB0',
      success: '#3E9E8C',
      warning: '#B98A4C',
      danger: '#C2606C',
      text1: '#2A3133',
      text2: '#8A938F',
      muted: '#A0A89F',
      border: 'rgba(0,0,0,0.08)',
      borderStrong: 'rgba(0,0,0,0.14)',
      borderWidth: 1,
      onAccent: '#FBF8F3',
      overlay: 'rgba(30,30,30,0.4)',
    },
  },
};

export const themeOrder: ThemeName[] = [
  'calmDark',
  'warmSand',
  'softLight',
  'warmNight',
  'lowStimulation',
  'highContrast',
];
