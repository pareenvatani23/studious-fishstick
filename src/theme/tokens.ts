/**
 * TrueShift design tokens — pulled verbatim from the design-system board.
 * Spacing scale: 4·8·12·16·20·24·32   Radius: 8·12·16·20·24·full
 * Do not invent new spacing/radius values; compose from these.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

/**
 * Base type scale (board 02 · TYPE SCALE).
 * Sizes are the "Normal" text-size step; scaleType() applies the user's
 * in-app text-size multiplier on top (Normal / Large / Largest).
 */
export const type = {
  largeTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -0.6, lineHeight: 36 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3, lineHeight: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  button: { fontSize: 16, fontWeight: '600' },
  buttonEasy: { fontSize: 19, fontWeight: '700' },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  overline: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
} as const;

/** In-app text-size multipliers. Compose with OS Dynamic Type via allowFontScaling. */
export const textSizeScale = {
  Normal: 1,
  Large: 1.15,
  Largest: 1.32,
} as const;

export type TextSizeName = keyof typeof textSizeScale;

/** Minimum tap target + CTA heights (accessibility board). */
export const sizing = {
  minTap: 44,
  cta: 56,
  ctaEasy: 64,
  tabBar: 84,
} as const;
