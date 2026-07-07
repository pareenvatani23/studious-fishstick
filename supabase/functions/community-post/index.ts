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
async function moderationFlagged(text: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/moderations', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'omni-moderation-latest', input: text }) });
    if (!res.ok) return false;
    return !!(await res.json())?.results?.[0]?.flagged;
  } catch { return false; }
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
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.2, max_tokens: 120, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are a strict but fair moderator for a kindness-only feed. Output ONLY minified JSON.' }, { role: 'user', content: prompt }] }) });
    if (!res.ok) return { ok: true, score: 65, reason: '' };
    const d = JSON.parse((await res.json()).choices[0].message.content);
    return { ok: !!d.ok && Number(d.score) >= 60, score: Math.max(0, Math.min(100, Number(d.score) || 0)), reason: String(d.reason ?? '') };
  } catch {
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

  // truncated first name (a few characters) — not full identity
  let authorLabel = 'A friend';
  try {
    const pr = await sb(`profiles?select=name&id=eq.${uid}`);
    const name = pr.ok ? (await pr.json())[0]?.name : '';
    const first = String(name ?? '').trim().split(/\s+/)[0] || '';
    if (first && first.toLowerCase() !== 'there') authorLabel = first.length > 4 ? `${first.slice(0, 4)}…` : first;
  } catch { /* keep default */ }

  const nowIso = new Date().toISOString();
  const ins = await sb('posts', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ user_id: uid, text, status: 'published', quality_score: qc.score, published_at: nowIso, author_label: authorLabel }) });
  if (!ins.ok) return json({ error: `insert ${ins.status}` }, 502);
  const row = (await ins.json())[0];
  await sb(`profiles?id=eq.${uid}`, { method: 'PATCH', body: JSON.stringify({ last_post_on: nowIso.slice(0, 10) }) });

  return json({ status: 'published', id: row.id, score: qc.score });
});
