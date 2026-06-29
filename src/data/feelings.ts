/**
 * Easy-mode feelings (design screen 09 · "What are you feeling right now?").
 * Plain emotion words — tap-only, no typing. These four are shown in the design.
 *
 * NOTE: emotion → reframe/action mapping is intentionally NOT defined here.
 * That mapping is clinical content and lives (stubbed) in reframes.ts / actions.ts
 * for the content owner to supply.
 */
import type { Accent, IconName } from '../components/icons';

export interface Feeling {
  id: string;
  label: string;
  icon: IconName;
  accent: Accent;
}

export const feelings: Feeling[] = [
  { id: 'worried', label: 'Worried', icon: 'faceWorried', accent: 'lavender' },
  { id: 'sad', label: 'Sad', icon: 'faceSad', accent: 'teal' },
  { id: 'angry', label: 'Angry', icon: 'faceAngry', accent: 'lavender' },
  { id: 'tired', label: 'Tired', icon: 'faceTired', accent: 'teal' },
];
