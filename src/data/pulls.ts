/**
 * Full-mode emotional pulls (design screens 03 Pattern Selection & 12 Emotional
 * Pull Selection). Labels come from the build brief. One-line descriptions that
 * appear in the design are used verbatim; the rest are marked [PLACEHOLDER —
 * supply real copy] because subline framing is clinical content.
 */
import type { IconName } from '../components/icons';

export interface Pull {
  id: string;
  /** short label used on the Pattern Selection chips */
  label: string;
  /** first-person label used on the Emotional Pull Selection cards */
  cardLabel: string;
  description: string;
  icon: IconName;
  /** true when description is final design copy, false when it's a placeholder */
  copyFinal: boolean;
}

export const pulls: Pull[] = [
  { id: 'approval', label: 'Approval', cardLabel: 'I wanted approval', description: 'Needing others to be okay with me', icon: 'person', copyFinal: true },
  { id: 'fear', label: 'Fear', cardLabel: 'I feared judgement', description: 'Bracing for criticism', icon: 'alertTriangle', copyFinal: true },
  { id: 'comparison', label: 'Comparison', cardLabel: 'I compared myself', description: 'Measuring against someone else', icon: 'bars', copyFinal: true },
  { id: 'avoidance', label: 'Avoidance', cardLabel: 'I avoided something', description: 'Putting off what matters', icon: 'arrowFade', copyFinal: true },
  { id: 'peoplePleasing', label: 'People pleasing', cardLabel: 'I kept everyone happy', description: 'People-pleasing at my own cost', icon: 'heart', copyFinal: true },
  // ↓ labels from brief; descriptions are placeholders for the content owner
  { id: 'perfectionism', label: 'Perfectionism', cardLabel: 'I waited until it felt perfect', description: '[PLACEHOLDER — supply real copy]', icon: 'sparkle', copyFinal: false },
  { id: 'selfDoubt', label: 'Self-doubt', cardLabel: 'I felt not good enough', description: '[PLACEHOLDER — supply real copy]', icon: 'cloud', copyFinal: false },
  { id: 'control', label: 'Control', cardLabel: 'I needed control', description: '[PLACEHOLDER — supply real copy]', icon: 'grid', copyFinal: false },
  { id: 'numbness', label: 'Numbness', cardLabel: 'I felt bored or empty', description: '[PLACEHOLDER — supply real copy]', icon: 'circleDashed', copyFinal: false },
  { id: 'proving', label: 'Proving', cardLabel: 'I wanted to prove myself', description: '[PLACEHOLDER — supply real copy]', icon: 'flag', copyFinal: false },
];

export const pullById = (id: string) => pulls.find((p) => p.id === id);
