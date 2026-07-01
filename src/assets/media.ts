/**
 * Higgsfield-generated media.
 *
 * The looping background VIDEO is disabled: the generated clip isn't a seamless
 * loop (it snaps) and read as distracting. The smooth animated gradient
 * (AmbientBackground) provides the "alive" feel instead. To re-enable, generate
 * a seamless loop and set: export const backgroundVideo = require('./bg-loop.mp4').
 *
 * The animated LOGO is kept for the splash (falls back to the SVG mark).
 */
import logo from './logo-loop.mp4';

export const backgroundVideo: number | null = null;
export const logoVideo: number | null = logo;
