/**
 * generate-lesson — cron-invoked (daily). Generates ONE new CBT lesson via
 * OpenAI in the app's house style and inserts it into public.lessons.
 *
 * Protected by a shared secret (x-cron-secret), not a user JWT (verify_jwt=false).
 * Writes with the service role so it bypasses RLS.
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CATEGORIES = ['Foundations', 'Skills', 'Emotional pulls', 'Everyday scenarios'];
const GRADIENTS: [string, string][] = [
  ['#A99BD4', '#74C7B8'], ['#74C7B8', '#4f9c8f'], ['#A99BD4', '#7b6cb0'],
  ['#6FC7A0', '#3f9e76'], ['#A99BD4', '#74C7B8'],
];

const SYSTEM = `You are a senior, evidence-backed CBT therapist writing a short self-help lesson for a wellbeing app.
Use standard, well-researched CBT (cognitive restructuring, behavioural activation, implementation intentions, worry postponement, urge surfing, self-compassion, values). Warm, calm, adult, plain grade-5 language. No emojis, no clinical jargon, not therapy. Output ONLY minified JSON.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
}

async function existingTitles(): Promise<string[]> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/lessons?select=title,id&order=created_at.desc&limit=60`, {
      headers: { apikey: SVC, Authorization: `Bearer ${SVC}` },
    });
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map((r: any) => r.title) : [];
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) return json({ error: 'Forbidden' }, 403);
  if (!OPENAI_API_KEY || !SVC) return json({ error: 'Not configured' }, 500);

  const titles = await existingTitles();
  const category = CATEGORIES[Math.floor((Date.now() / 86400000) % CATEGORIES.length)];

  const prompt = [
    `Write ONE new CBT self-help lesson in category "${category}".`,
    `It must be DISTINCT from these existing lesson titles (different topic + angle): ${JSON.stringify(titles.slice(0, 40))}.`,
    `Structure: a one-line summary, a short "Try: …" action preview, an opening intro paragraph, 3 sections each with a short heading and a substantive paragraph (2-4 sentences), 3 concrete practical actions, a one-line key idea, and a calm 3-5 sentence spoken narration script.`,
    `Grounded, practical, believable. No toxic positivity. Return minified JSON:`,
    `{"title":"<=40 chars","summary":"one line","actionPreview":"Try: …","intro":"paragraph","sections":[{"heading":"","body":""},{"heading":"","body":""},{"heading":"","body":""}],"actions":["","",""],"keyIdea":"one line","voiceScript":"3-5 sentences"}`,
  ].join('\n');

  let data: any;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.9,
        max_tokens: 1100,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return json({ error: `OpenAI ${res.status}` }, 502);
    data = JSON.parse((await res.json()).choices[0].message.content);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 502);
  }

  const title = String(data.title ?? '').slice(0, 60).trim();
  if (!title) return json({ error: 'empty title' }, 502);
  const id = `${slugify(title)}-${Math.floor((Date.now() / 1000) % 100000)}`;
  const gradient = GRADIENTS[Math.floor((Date.now() / 3600000) % GRADIENTS.length)];
  const row = {
    id,
    title,
    category,
    summary: String(data.summary ?? '').slice(0, 200),
    action_preview: String(data.actionPreview ?? '').slice(0, 60),
    intro: String(data.intro ?? ''),
    sections: Array.isArray(data.sections) ? data.sections.slice(0, 5).map((s: any) => ({ heading: String(s?.heading ?? ''), body: String(s?.body ?? '') })) : [],
    actions: Array.isArray(data.actions) ? data.actions.slice(0, 5).map((a: any) => String(a)) : [],
    key_idea: String(data.keyIdea ?? ''),
    voice_script: String(data.voiceScript ?? ''),
    gradient,
    duration_label: '4 min',
    source: 'ai',
    start_here: false,
    published: true,
  };

  try {
    const res = await fetch(`${SB_URL}/rest/v1/lessons`, {
      method: 'POST',
      headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (!res.ok) return json({ error: `insert ${res.status}: ${(await res.text()).slice(0, 200)}` }, 502);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 502);
  }

  // New lessons reach the app live via Realtime; PUSH notifications for lessons
  // are governed by the per-user daily planner (daily-nudge), capped at ≤2/day.
  return json({ ok: true, id, title, category });
});
