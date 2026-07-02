/**
 * daily-nudge — cron-invoked HOURLY. For each user whose chosen reminder hour
 * matches the current UTC hour, who has reminders on, a push token, hasn't been
 * nudged today, and hasn't done a reset today: send a personalised Expo push.
 *
 * Protected by x-cron-secret (verify_jwt=false). Uses the service role for DB
 * and reuses OpenAI for the message (templated fallback).
 *
 * NOTE: reminder_hour is treated as UTC (we don't store per-user timezone yet).
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function sb(path: string, init?: RequestInit) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  return res;
}

async function personalisedMessage(name: string, recentSituations: string[], hadResetYesterday: boolean): Promise<{ title: string; body: string }> {
  const fallback = {
    title: 'A quiet minute for you',
    body: name && name !== 'there' ? `${name}, a two-minute reset can steady the day.` : 'A two-minute reset can steady the day.',
  };
  if (!OPENAI_API_KEY) return fallback;
  try {
    const prompt = [
      `Write ONE short, warm push notification nudging a CBT app user to do their 2-minute reset today. They haven't done it yet.`,
      recentSituations.length ? `Their recent themes: ${JSON.stringify(recentSituations.slice(0, 4))}.` : `They are fairly new.`,
      `Non-nagging, no guilt, no streak pressure. Plain, calm, no emojis.`,
      name && name !== 'there' ? `You may use their name "${name}" sparingly.` : '',
      `title <= 40 chars, body <= 110 chars. Return minified JSON {"title":"","body":""}.`,
    ].filter(Boolean).join('\n');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL, temperature: 0.9, max_tokens: 120, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: 'You write brief, kind reminder notifications. Output ONLY minified JSON.' }, { role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return fallback;
    const d = JSON.parse((await res.json()).choices[0].message.content);
    const title = String(d.title ?? '').slice(0, 50).trim();
    const body = String(d.body ?? '').slice(0, 140).trim();
    return title && body ? { title, body } : fallback;
  } catch {
    return fallback;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) return json({ error: 'Forbidden' }, 403);
  if (!SVC) return json({ error: 'Not configured' }, 500);

  const now = new Date();
  const hourUTC = now.getUTCHours();
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const startOfToday = `${today}T00:00:00.000Z`;

  // candidate profiles for this hour
  const res = await sb(
    `profiles?select=id,name,expo_push_token,reminder_hour,push_last_sent_on&reminder_enabled=eq.true&reminder_hour=eq.${hourUTC}&expo_push_token=not.is.null`
  );
  if (!res.ok) return json({ error: `profiles ${res.status}` }, 502);
  const profiles: any[] = await res.json();

  const messages: { to: string; title: string; body: string; sound: string }[] = [];
  const nudgedIds: string[] = [];

  for (const p of profiles) {
    if (p.push_last_sent_on === today) continue; // already nudged today
    // did they reset today?
    const r = await sb(`resets?select=id&user_id=eq.${p.id}&occurred_at=gte.${startOfToday}&limit=1`);
    const todays = r.ok ? await r.json() : [];
    if (Array.isArray(todays) && todays.length > 0) continue; // already reset → no nudge

    // recent themes for personalisation
    const rr = await sb(`resets?select=situation_id,custom_situation&user_id=eq.${p.id}&order=occurred_at.desc&limit=5`);
    const recent = rr.ok ? await rr.json() : [];
    const recentSituations: string[] = (Array.isArray(recent) ? recent : [])
      .map((x: any) => x.custom_situation || x.situation_id)
      .filter(Boolean);

    const msg = await personalisedMessage(p.name ?? 'there', recentSituations, false);
    messages.push({ to: p.expo_push_token, title: msg.title, body: msg.body, sound: 'default' });
    nudgedIds.push(p.id);
  }

  // send via Expo push (batched)
  let sent = 0;
  if (messages.length > 0) {
    try {
      const pr = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
      if (pr.ok) sent = messages.length;
    } catch {
      // ignore send errors
    }
    // mark nudged today regardless (avoid retry storms this hour)
    if (nudgedIds.length) {
      await sb(`profiles?id=in.(${nudgedIds.join(',')})`, {
        method: 'PATCH',
        body: JSON.stringify({ push_last_sent_on: today }),
      });
    }
  }

  return json({ ok: true, hourUTC, candidates: profiles.length, nudged: nudgedIds.length, sent });
});
