import React from 'react';
import Svg, { Path, Circle, Polygon, G } from 'react-native-svg';

/**
 * Line-icon set matching the design's stroke style (1.8px, round caps,
 * 24×24 viewBox, no fill). One component, named via `name`. Colour is passed
 * in so icons always inherit the active theme.
 */

export type Accent = 'teal' | 'lavender';

export type IconName =
  // navigation / chrome
  | 'home' | 'shift' | 'explore' | 'progress' | 'user'
  | 'back' | 'chevronRight' | 'arrowRight' | 'arrowFade'
  | 'speaker' | 'edit' | 'trash' | 'play' | 'plus'
  // affordances
  | 'check' | 'badgeCheck' | 'eye' | 'shield' | 'shieldCheck'
  // pull / response / feeling glyphs
  | 'person' | 'alertTriangle' | 'bars' | 'heart' | 'sparkle'
  | 'cloud' | 'grid' | 'circleDashed' | 'flag'
  | 'flame' | 'sun' | 'lines' | 'search'
  | 'faceWorried' | 'faceSad' | 'faceAngry' | 'faceTired'
  | 'breathe' | 'target';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

const dot = (cx: number, cy: number, color: string) => (
  <Circle cx={cx} cy={cy} r={0.9} fill={color} stroke="none" />
);

export function Icon({ name, size = 24, color, strokeWidth = 1.8 }: IconProps) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };

  const body = (() => {
    switch (name) {
      case 'home':
        return <><Path {...p} d="M3 10.5 12 4l9 6.5" /><Path {...p} d="M5 9.5V20h14V9.5" /></>;
      case 'shift':
        return <><Path {...p} d="M4 9a8 8 0 0 1 13-4" /><Path {...p} d="M20 15a8 8 0 0 1-13 4" /><Path {...p} d="M17 2v4h-4" /><Path {...p} d="M7 22v-4h4" /></>;
      case 'explore':
        return <><Circle {...p} cx={12} cy={12} r={8.5} /><Path {...p} d="m15 9-2.2 4.2L8.6 15l2.2-4.2z" /></>;
      case 'progress':
        return <><Path {...p} d="M5 19v-7" /><Path {...p} d="M12 19V5" /><Path {...p} d="M19 19v-10" /></>;
      case 'user':
        return <><Circle {...p} cx={12} cy={8.5} r={3.5} /><Path {...p} d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></>;
      case 'back':
        return <><Path {...p} d="M19 12H5" /><Path {...p} d="m12 5-7 7 7 7" /></>;
      case 'chevronRight':
        return <Path {...p} d="m9 6 6 6-6 6" />;
      case 'arrowRight':
        return <><Path {...p} d="M5 12h13" /><Path {...p} d="m13 6 6 6-6 6" /></>;
      case 'arrowFade':
        return <><Path {...p} d="M5 12h14" /><Path {...p} d="m12 5 7 7-7 7" opacity={0.4} /></>;
      case 'speaker':
        return <><Path {...p} d="M11 5 6 9H3v6h3l5 4z" /><Path {...p} d="M16 9a5 5 0 0 1 0 6" /><Path {...p} d="M19 6.5a9 9 0 0 1 0 11" /></>;
      case 'edit':
        return <><Path {...p} d="M12 20h9" /><Path {...p} d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>;
      case 'trash':
        return <><Path {...p} d="M4 7h16" /><Path {...p} d="M9 7V5h6v2" /><Path {...p} d="M6 7l1 13h10l1-13" /></>;
      case 'play':
        return <Polygon points="8,5 19,12 8,19" fill={color} stroke="none" />;
      case 'plus':
        return <><Path {...p} d="M12 5v14" /><Path {...p} d="M5 12h14" /></>;
      case 'check':
        return <Path {...p} d="m5 13 4 4L19 7" />;
      case 'badgeCheck':
        return <><Circle {...p} cx={12} cy={12} r={9.5} /><Path {...p} d="M9 11.5 11.5 14 16 8.5" /></>;
      case 'eye':
        return <><Path {...p} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><Circle {...p} cx={12} cy={12} r={3} /></>;
      case 'shield':
        return <Path {...p} d="M12 3 4 6v6c0 4.5 3.5 7.5 8 9 4.5-1.5 8-4.5 8-9V6z" />;
      case 'shieldCheck':
        return <><Path {...p} d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6z" /><Path {...p} d="m9 12 2 2 4-4" /></>;
      case 'person':
        return <><Circle {...p} cx={12} cy={8} r={4} /><Path {...p} d="M5 21a7 7 0 0 1 14 0" /></>;
      case 'alertTriangle':
        return <><Path {...p} d="M12 4 3 20h18z" /><Path {...p} d="M12 10v4" /></>;
      case 'bars':
        return <><Path {...p} d="M3 18v-6" /><Path {...p} d="M9 18V6" /><Path {...p} d="M15 18v-9" /><Path {...p} d="M21 18V4" /></>;
      case 'heart':
        return <Path {...p} d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />;
      case 'sparkle':
        return <Path {...p} d="M12 3l1.9 5L19 9.8l-5 1.7L12 17l-2-5.5L5 9.8 10 8z" />;
      case 'cloud':
        return <Path {...p} d="M7 17h10a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.6-1A4 4 0 0 0 7 17z" />;
      case 'grid':
        return <><Path {...p} d="M4 4h7v7H4z" /><Path {...p} d="M13 4h7v7h-7z" /><Path {...p} d="M4 13h7v7H4z" /><Path {...p} d="M13 13h7v7h-7z" /></>;
      case 'circleDashed':
        return <Circle {...p} cx={12} cy={12} r={9} strokeDasharray="3 4" />;
      case 'flag':
        return <><Path {...p} d="M5 21V4" /><Path {...p} d="M5 4h11l-2 4 2 4H5" /></>;
      case 'flame':
        return <><Path {...p} d="M12 2v6" /><Path {...p} d="M12 22a7 7 0 0 0 7-7c0-3-3-6-7-9-4 3-7 6-7 9a7 7 0 0 0 7 7z" /></>;
      case 'sun':
        return <><Circle {...p} cx={12} cy={12} r={3} /><Path {...p} d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" /></>;
      case 'lines':
        return <Path {...p} d="M4 12h16M4 6h16M4 18h10" />;
      case 'search':
        return <><Circle {...p} cx={11} cy={11} r={7} /><Path {...p} d="m20 20-3.5-3.5" /></>;
      case 'target':
        return <><Circle {...p} cx={12} cy={12} r={8} /><Circle {...p} cx={12} cy={12} r={3} /></>;
      case 'breathe':
        return <><Path {...p} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><Circle {...p} cx={12} cy={12} r={3} /></>;
      case 'faceWorried':
        return <G><Circle {...p} cx={12} cy={12} r={9} /><Path {...p} d="M8 15c1-1.5 2.5-2 4-2s3 .5 4 2" />{dot(9, 9, color)}{dot(15, 9, color)}</G>;
      case 'faceSad':
        return <G><Circle {...p} cx={12} cy={12} r={9} /><Path {...p} d="M9 16c1-1 2-1.5 3-1.5s2 .5 3 1.5" />{dot(9, 9, color)}{dot(15, 9, color)}</G>;
      case 'faceAngry':
        return <G><Circle {...p} cx={12} cy={12} r={9} /><Path {...p} d="M9 16c1-1 2-1.5 3-1.5s2 .5 3 1.5" /><Path {...p} d="M8.5 8.5 10 9.5M15.5 8.5 14 9.5" /></G>;
      case 'faceTired':
        return <G><Circle {...p} cx={12} cy={12} r={9} /><Path {...p} d="M8 14h8" />{dot(9, 9, color)}{dot(15, 9, color)}</G>;
      default:
        return null;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {body}
    </Svg>
  );
}
