/**
 * community-post — the gate for the Community "Daily Drop".
 * Requires a user JWT. Enforces one post/day, runs a crisis + moderation + AI
 * QUALITY check, and only then publishes (via service role). Keeps the feed
 * beautiful: positive/affirming/helpful only — no spam, ads, junk, or negativity.
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// ── Observability + resilience (structured logs for Supabase log explorer) ───
const FN = 'community-post';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function logErr(where: string, err: unknown, extra: Record<string, unknown> = {}) {
  const e = err as any;
  console.error(JSON.stringify({
    level: 'error', fn: FN, where,
    error: String(e?.message ?? e),
    stack: e?.stack ? String(e.stack).split('\n').slice(0, 5).join(' | ') : undefined,
    ...extra,
  }));
}
function logWarn(where: string, msg: string, extra: Record<string, unknown> = {}) {
  console.warn(JSON.stringify({ level: 'warn', fn: FN, where, msg, ...extra }));
}
function backoffMs(attempt: number, retryAfterSec: number | null): number {
  if (retryAfterSec && retryAfterSec > 0) return Math.min(15000, retryAfterSec * 1000);
  return Math.min(8000, 400 * 2 ** attempt) + Math.floor(Math.random() * 250);
}
/**
 * fetch() with retry+exponential backoff on 429 / 5xx (OpenAI rate limits &
 * transient errors). Honors Retry-After. Each attempt has its own timeout.
 * Returns the last Response (never throws for HTTP status); throws only if the
 * network call itself fails on the final attempt.
 */
async function fetchRetry(url: string, init: RequestInit, where: string, tries = 3, timeoutMs = 20000): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 0; attempt < tries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok || (res.status !== 429 && res.status < 500)) return res;
      last = res;
      logWarn(`${where}.retry`, `upstream ${res.status}`, { attempt: attempt + 1, status: res.status });
      if (attempt < tries - 1) await sleep(backoffMs(attempt, Number(res.headers.get('retry-after')) || null));
    } catch (e) {
      clearTimeout(timer);
      logErr(`${where}.network`, e, { attempt: attempt + 1 });
      if (attempt === tries - 1) throw e;
      await sleep(backoffMs(attempt, null));
    }
  }
  return last as Response;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function jwtUid(req: Request): string | null {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return null;
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (p.role !== 'authenticated' || !p.sub) return null;
    if (p.exp && p.exp * 1000 < Date.now()) return null;
    return p.sub as string;
  } catch { return null; }
}
async function sb(path: string, init?: RequestInit) {
  return fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
}
const CRISIS_RE = /\b(kill myself|killing myself|end my life|ending my life|suicid|take my (own )?life|want to die|don'?t want to (live|be alive)|better off dead|self[-\s]?harm|hurt myself|cutting myself|overdose)\b/i;

const FALLBACK_HANDLES = ['Aria', 'Milo', 'Noor', 'Kai', 'Sana', 'Leo', 'Maya', 'Ravi', 'Elin', 'Theo', 'Zara', 'Finn'];
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : '');
/** "Pareen Vatani" -> "Parvat"; single name -> first 6 chars; blank -> stable fallback from uid. */
function handleFromName(name: string, uid: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return cap(parts[0].slice(0, 3)) + parts[parts.length - 1].slice(0, 3).toLowerCase();
  if (parts.length === 1 && parts[0].toLowerCase() !== 'there') return cap(parts[0].slice(0, 6));
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum = (sum + uid.charCodeAt(i)) % FALLBACK_HANDLES.length;
  return FALLBACK_HANDLES[sum];
}
async function moderationFlagged(text: string): Promise<boolean> {
  try {
    const res = await fetchRetry('https://api.openai.com/v1/moderations', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'omni-moderation-latest', input: text }) }, 'moderation');
    if (!res.ok) return false;
    return !!(await res.json())?.results?.[0]?.flagged;
  } catch (e) { logErr('moderationFlagged', e); return false; }
}
async function qualityCheck(text: string): Promise<{ ok: boolean; score: number; reason: string }> {
  if (!OPENAI_API_KEY) return { ok: true, score: 70, reason: '' };
  try {
    const prompt = [
      `A user wants to post a short message to a supportive mental-wellbeing community feed. The ONLY allowed posts are genuine positive thoughts, affirmations, or encouragement meant to help or uplift a stranger who reads it.`,
      `Message: """${text}"""`,
      `Reject if it is: spam, an ad or self-promotion, a link, junk/gibberish, off-topic, a question, negative/harmful, hateful, political, or not actually uplifting/affirming.`,
      `Score 0-100 for how genuinely positive, kind, and helpful it is to a stranger. ok=true only if it clearly belongs and score>=60.`,
      `Return minified JSON: {"ok":true|false,"score":0-100,"reason":"short reason if not ok"}`,
    ].join('\n');
    const res = await fetchRetry('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.2, max_tokens: 120, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are a strict but fair moderator for a kindness-only feed. Output ONLY minified JSON.' }, { role: 'user', content: prompt }] }) }, 'chat');
    if (!res.ok) return { ok: true, score: 65, reason: '' };
    const d = JSON.parse((await res.json()).choices[0].message.content);
    return { ok: !!d.ok && Number(d.score) >= 60, score: Math.max(0, Math.min(100, Number(d.score) || 0)), reason: String(d.reason ?? '') };
  } catch (e) {
    logErr('qualityCheck', e);
    return { ok: true, score: 65, reason: '' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const uid = jwtUid(req);
  if (!uid) return json({ error: 'Sign in required' }, 401);
  if (!SVC) return json({ error: 'Not configured' }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const text = String(body?.text ?? '').trim().replace(/\s+/g, ' ');
  if (text.length < 4) return json({ status: 'rejected', reason: 'A little too short — add a few more words.' });
  if (text.length > 280) return json({ status: 'rejected', reason: 'Keep it under 280 characters.' });

  // one post per day
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const recent = await sb(`posts?select=id&user_id=eq.${uid}&created_at=gte.${since}&limit=1`);
  if (recent.ok && (await recent.json()).length > 0) return json({ status: 'limit', reason: 'You’ve already shared today. Come back tomorrow 💛' });

  // safety
  if (CRISIS_RE.test(text)) return json({ status: 'crisis' });
  if (await moderationFlagged(text)) return json({ status: 'rejected', reason: 'That doesn’t fit our kindness-only feed.' });

  // quality
  const qc = await qualityCheck(text);
  if (!qc.ok) return json({ status: 'rejected', reason: qc.reason || 'Let’s keep it a genuine, uplifting message for a stranger.' });

  // A real-feeling but partial handle: first few letters of first + last name
  // joined (e.g. "Pareen Vatani" -> "Parvat"). Keeps a human feel without full identity.
  let authorLabel = 'Friend';
  try {
    const pr = await sb(`profiles?select=name&id=eq.${uid}`);
    const name = pr.ok ? (await pr.json())[0]?.name : '';
    const h = handleFromName(String(name ?? ''), uid);
    if (h) authorLabel = h;
  } catch { /* keep default */ }

  const nowIso = new Date().toISOString();
  const ins = await sb('posts', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ user_id: uid, text, status: 'published', quality_score: qc.score, published_at: nowIso, author_label: authorLabel }) });
  if (!ins.ok) { logErr('insert', new Error(`insert ${ins.status}`), { status: ins.status }); return json({ error: `insert ${ins.status}` }, 502); }
  const row = (await ins.json())[0];
  await sb(`profiles?id=eq.${uid}`, { method: 'PATCH', body: JSON.stringify({ last_post_on: nowIso.slice(0, 10) }) });

  return json({ status: 'published', id: row.id, score: qc.score });
});
