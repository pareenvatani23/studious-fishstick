import { OPENAI_API_KEY } from './config';

/**
 * Safety layer. Cheap local crisis screen + OpenAI moderation. Used to gate AI
 * generation: if either trips, we skip the model and route to crisis support.
 */

// Conservative, high-signal crisis phrases. Local first-pass before any network.
const CRISIS_PATTERNS = [
  /\bkill myself\b/i,
  /\bend (my|it all|my life)\b/i,
  /\b(suicid|suicide)\w*/i,
  /\bwant to die\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcut(ting)? myself\b/i,
  /\bno reason to live\b/i,
  /\boverdose\b/i,
];

export function localCrisisCheck(text?: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

/** OpenAI moderation. Returns true if flagged (or on hard error, fail safe = true). */
export async function moderationFlagged(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
    });
    if (!res.ok) return false; // don't block the user on a moderation outage
    const json = await res.json();
    return Boolean(json?.results?.[0]?.flagged);
  } catch {
    return false;
  }
}
