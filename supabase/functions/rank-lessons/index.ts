/**
 * rank-lessons — orders the lesson library for THIS user based on their
 * responses, thinking patterns, and insights. Requires a user JWT.
 * Input: { history: {recentSituations,recentEmotions,distortions,keywords,topSituation},
 *          lessons: [{id,title,category,summary}] }
 * Output: { order: [lessonId, ...] }  (most relevant first)
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function isAuthedUser(req: Request): boolean {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return false;
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.role === 'authenticated' && !!p.sub && (!p.exp || p.exp * 1000 >= Date.now());
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!isAuthedUser(req)) return json({ error: 'Sign in required' }, 401);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const history = payload?.history ?? {};
  const lessons: { id: string; title: string; category: string; summary?: string }[] = Array.isArray(payload?.lessons) ? payload.lessons : [];
  if (lessons.length === 0) return json({ order: [] });

  const ids = lessons.map((l) => l.id);
  // No history or no AI key → keep given order.
  const noHistory = !history?.recentSituations?.length && !history?.recentEmotions?.length && !history?.distortions?.length;
  if (!OPENAI_API_KEY || noHistory) return json({ order: ids });

  const prompt = [
    `A user of a CBT app has these patterns from their own reflections:`,
    history.recentSituations?.length ? `- Recent situations: ${JSON.stringify(history.recentSituations.slice(0, 8))}` : '',
    history.recentEmotions?.length ? `- Recent feelings: ${JSON.stringify(history.recentEmotions.slice(0, 8))}` : '',
    history.distortions?.length ? `- Recurring thinking patterns: ${JSON.stringify(history.distortions.slice(0, 6))}` : '',
    history.keywords?.length ? `- Thought tags: ${JSON.stringify(history.keywords.slice(0, 12))}` : '',
    history.topSituation ? `- Most common theme: "${history.topSituation}"` : '',
    `Here are the available lessons (id — title — category — summary):`,
    ...lessons.map((l) => `- ${l.id} — ${l.title} — ${l.category} — ${l.summary ?? ''}`),
    `Rank ALL lesson ids from MOST to LEAST relevant/helpful for THIS user right now, based on their patterns. Include every id exactly once.`,
    `Return minified JSON: {"order":["id1","id2", ...]}`,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You order CBT lessons by relevance to a user. Output ONLY minified JSON.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) return json({ order: ids });
    const data = JSON.parse((await res.json()).choices[0].message.content);
    const ordered: string[] = Array.isArray(data.order) ? data.order.filter((x: any) => typeof x === 'string' && ids.includes(x)) : [];
    // ensure completeness: append any missing ids in original order
    const seen = new Set(ordered);
    for (const id of ids) if (!seen.has(id)) ordered.push(id);
    return json({ order: ordered });
  } catch {
    return json({ order: ids });
  }
});
