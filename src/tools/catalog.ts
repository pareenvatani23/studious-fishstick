import type { IconName } from '../components/icons';

/** One entry per interactive tool — used by the Tools hub, Home, and AI routing. */
export interface ToolDef {
  key: string;            // matches the AI `tool` value + tool_events.tool
  label: string;
  sub: string;
  icon: IconName;
  route: string;          // RootStack route name
  params?: Record<string, unknown>;
  /** button label when offered as the reset's "one small step" */
  action: string;
}

export const TOOLS: ToolDef[] = [
  { key: 'breathing', label: 'Breathe', sub: 'Box · 4-7-8', icon: 'breathe', route: 'ToolBreathing', params: { variant: 'box' }, action: 'Do the breathing now' },
  { key: 'grounding', label: 'Ground', sub: '5-4-3-2-1 senses', icon: 'target', route: 'ToolGrounding', action: 'Do the grounding now' },
  { key: 'journal', label: 'Note', sub: 'Write it down', icon: 'edit', route: 'ToolJournal', action: 'Write it now' },
  { key: 'worry', label: 'Park it', sub: 'Worry postponement', icon: 'cloud', route: 'ToolWorry', action: 'Park the worry now' },
  { key: 'activation', label: 'One step', sub: 'A small action', icon: 'sun', route: 'ToolActivation', action: 'Pick one small action' },
  { key: 'selfcompassion', label: 'Be kind', sub: 'Self-compassion', icon: 'heart', route: 'ToolSelfCompassion', action: 'Take a kind moment' },
  { key: 'gratitude', label: 'Good things', sub: 'Three good things', icon: 'sparkle', route: 'ToolGratitude', action: 'Name three good things' },
  { key: 'urgesurf', label: 'Ride it', sub: 'Urge surfing', icon: 'lines', route: 'ToolUrgeSurf', action: 'Ride the wave now' },
  { key: 'relax', label: 'Unclench', sub: 'Muscle relaxation', icon: 'flame', route: 'ToolRelax', action: 'Release the tension now' },
];

export const toolByKey = (key: string): ToolDef | undefined => TOOLS.find((t) => t.key === key);
