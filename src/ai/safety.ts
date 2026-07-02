/**
 * Client-side safety pre-check. A cheap, offline crisis screen used before we
 * even call the edge function. The authoritative crisis + moderation checks
 * run server-side inside the `ai` edge function.
 */
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
