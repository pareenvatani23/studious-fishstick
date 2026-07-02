import { aiEnabled } from './config';
import { localCrisisCheck } from './safety';
import { invokeAI } from './edge';

/**
 * CBT "brain" — now a thin client over the `ai` edge function (keys live
 * server-side). The edge function does crisis + moderation authoritatively;
 * we keep a cheap local crisis pre-check for an instant, offline response.
 */

/** Structured result for one reset. */
export interface AIReset {
  crisis: boolean;
  validate: string;
  reframe: string;
  smallStep: string;
  narration: string;
  keywords: string[];
  distortion: string;
}

interface GenerateInput {
  situationLabel: string;
  customSituation?: string;
  heaviness?: number;
  emotion?: string;
  note?: string;
  avoidReframes?: string[];
  avoidSteps?: string[];
  avoidValidations?: string[];
}

function crisisResult(): AIReset {
  return { crisis: true, validate: '', reframe: '', smallStep: '', narration: '', keywords: [], distortion: '' };
}

/** Generate the personalised reset content via the edge function. */
export async function generateReset(input: GenerateInput): Promise<AIReset> {
  const userText = [input.customSituation, input.note].filter(Boolean).join(' ');
  if (localCrisisCheck(userText) || localCrisisCheck(input.situationLabel)) return crisisResult();

  const data = await invokeAI<Partial<AIReset>>('generateReset', input);
  return {
    crisis: Boolean(data.crisis),
    validate: String(data.validate ?? ''),
    reframe: String(data.reframe ?? ''),
    smallStep: String(data.smallStep ?? ''),
    narration: String(data.narration ?? ''),
    keywords: Array.isArray(data.keywords) ? data.keywords.slice(0, 4).map((k: any) => String(k)) : [],
    distortion: String(data.distortion ?? ''),
  };
}

/** Personalised extra situation chips, appended to the base list. Never throws fatally. */
export async function suggestSituations(recentSituations: string[], baseLabels: string[]): Promise<string[]> {
  if (!aiEnabled) return [];
  try {
    const data = await invokeAI<{ situations?: string[] }>('suggestSituations', { recentSituations, baseLabels });
    const arr = Array.isArray(data.situations) ? data.situations : [];
    return arr.map((s: any) => String(s)).filter((s: string) => s && s.length <= 40).slice(0, 3);
  } catch {
    return [];
  }
}

/** Personalised feeling words, ordered by likelihood, to preload the feeling step. */
export async function suggestEmotions(recentEmotions: string[], baseLabels: string[]): Promise<string[]> {
  if (!aiEnabled) return [];
  try {
    const data = await invokeAI<{ emotions?: string[] }>('suggestEmotions', { recentEmotions, baseLabels });
    const arr = Array.isArray(data.emotions) ? data.emotions : [];
    return arr.map((s: any) => String(s)).filter((s: string) => s && s.length <= 20).slice(0, 4);
  } catch {
    return [];
  }
}

// ── Reminders ────────────────────────────────────────────────────────────────
export interface ReminderMessage {
  title: string;
  body: string;
}

export interface ReminderHistory {
  recentSituations: string[];
  recentEmotions: string[];
  topSituation?: string | null;
  lastActionText?: string | null;
  lastActionDone?: boolean | null;
  streak?: number;
  total?: number;
  name?: string;
}

/** Generate `count` distinct daily reminders via the edge function; safe fallback. */
export async function generateReminders(history: ReminderHistory, count: number): Promise<ReminderMessage[]> {
  const n = Math.max(1, Math.min(count, 7));
  if (!aiEnabled) return fallbackReminders(history, n);
  try {
    const data = await invokeAI<{ reminders?: ReminderMessage[] }>('generateReminders', { history, count: n });
    const arr = Array.isArray(data.reminders)
      ? data.reminders
          .map((r: any) => ({ title: String(r?.title ?? '').slice(0, 60), body: String(r?.body ?? '').slice(0, 160) }))
          .filter((r: ReminderMessage) => r.title && r.body)
      : [];
    return arr.length ? arr.slice(0, n) : fallbackReminders(history, n);
  } catch {
    return fallbackReminders(history, n);
  }
}

/** Safe, lightly-personalised reminders when the edge call is unavailable. */
export function fallbackReminders(history: ReminderHistory, count: number): ReminderMessage[] {
  const name = history.name && history.name !== 'there' ? history.name : '';
  const hi = name ? `${name}, ` : '';
  const theme = history.topSituation || (history.recentSituations && history.recentSituations[0]);
  const pool: ReminderMessage[] = [
    { title: 'A quiet minute for you', body: `${hi}whatever today held, two minutes can help it feel lighter.`.trim() },
    { title: 'How are you, really?', body: 'Name what’s on your mind and take one small step. That’s all it takes.' },
    theme
      ? { title: 'One small reset', body: `If “${theme}” is on your mind again, a quick reset can steady it.`.slice(0, 130) }
      : { title: 'One small reset', body: 'A steadier mind is one thought and one small step away.' },
    history.lastActionText
      ? { title: 'Following up', body: 'Did your last small step happen? Either way, today is a fresh start.' }
      : { title: 'Two minutes, that’s it', body: 'Check in with yourself — one balanced thought can shift the day.' },
    { title: 'Still here for you', body: 'When something feels heavy, open TrueShift and take one small step.' },
    { title: 'A gentle check-in', body: `${hi}how are you feeling right now? A short reset is ready when you are.`.trim() },
    { title: 'Your daily reset', body: 'One honest thought, one small step. Let’s take a calm minute together.' },
  ];
  const out: ReminderMessage[] = [];
  for (let i = 0; i < count; i++) out.push(pool[i % pool.length]);
  return out.map((r) => ({ title: r.title.slice(0, 60), body: r.body.slice(0, 160) }));
}
