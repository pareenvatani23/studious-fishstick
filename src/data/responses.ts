/**
 * Steadier responses (design screen 15). Single-word values from the brief.
 * These are value labels, not therapeutic prose, so they are included as-is.
 * Six are shown as cards in the design; the remaining four appear as a quiet
 * "Truth · Patience · Meaning · Health" row but are fully selectable here.
 */
import type { IconName } from '../components/icons';

export interface SteadierResponse {
  id: string;
  label: string;
  icon: IconName;
}

export const responses: SteadierResponse[] = [
  { id: 'selfRespect', label: 'Self-respect', icon: 'shield' },
  { id: 'courage', label: 'Courage', icon: 'flame' },
  { id: 'calm', label: 'Calm', icon: 'sun' },
  { id: 'discipline', label: 'Discipline', icon: 'lines' },
  { id: 'kindness', label: 'Kindness', icon: 'heart' },
  { id: 'curiosity', label: 'Curiosity', icon: 'search' },
  { id: 'truth', label: 'Truth', icon: 'check' },
  { id: 'patience', label: 'Patience', icon: 'sun' },
  { id: 'meaning', label: 'Meaning', icon: 'sparkle' },
  { id: 'health', label: 'Health', icon: 'heart' },
];

export const responseById = (id: string) => responses.find((r) => r.id === id);
