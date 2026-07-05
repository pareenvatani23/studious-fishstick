/**
 * daily-nudge — cron-invoked every 30 min. For each user with reminders on and
 * a push token, whose LOCAL time (their stored IANA timezone) matches their
 * chosen reminder hour, who hasn't been nudged today and hasn't done a reset
 * today (in their local day): send a personalised Expo push that deep-links to
 * the reset screen.
 *
 * Protected by x-cron-secret (verify_jwt=false). Uses the service role.
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
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
}

/** Local Y/M/D H:M for a given instant in an IANA timezone. */
function localParts(now: Date, tz: string): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const p: Record<string, string> = {};
    for (const part of fmt.formatToParts(now)) if (part.type !== 'literal') p[part.type] = part.value;
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
  } catch {
    // fall back to UTC
    return { y: now.getUTCFullYear(), mo: now.getUTCMonth() + 1, d: now.getUTCDate(), h: now.getUTCHours(), mi: now.getUTCMinutes(), s: now.getUTCSeconds() };
  }
}
const dateStr = (p: { y: number; mo: number; d: number }) => `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;

async function personalisedMessage(name: string, recentSituations: string[]): Promise<{ title: string; body: string }> {
  const fallback = {
    title: 'A quiet minute for you',
    body: name && name !== 'there' ? `${name}, a two-minute reset can steady the day.` : 'A two-minute reset can steady the day.',
  };
  if (!OPENAI_API_KEY) return fallback;
  try {
    const prompt = [
      `Write ONE short, warm push notification nudging a CBT app user to do their 2-minute reset today (they haven't yet).`,
      recentSituations.length ? `Recent themes: ${JSON.stringify(recentSituations.slice(0, 4))}.` : `They are fairly new.`,
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
  const res = await sb(`profiles?select=id,name,expo_push_token,reminder_hour,reminder_minute,timezone,push_last_sent_on&reminder_enabled=eq.true&expo_push_token=not.is.null`);
  if (!res.ok) return json({ error: `profiles ${res.status}` }, 502);
  const profiles: any[] = await res.json();

  const messages: any[] = [];
  const nudged: { id: string; localDate: string }[] = [];

  for (const p of profiles) {
    const tz = p.timezone || 'UTC';
    const lp = localParts(now, tz);
    const localDate = dateStr(lp);
    // fire in the 30-min window at the top of the reminder hour, local time
    if (lp.h !== p.reminder_hour) continue;
    if (lp.mi >= 30) continue;
    if (p.push_last_sent_on === localDate) continue; // already nudged today (local)

    // did they reset today (local day)? local midnight instant:
    const secsSinceMidnight = lp.h * 3600 + lp.mi * 60 + lp.s;
    const localMidnight = new Date(now.getTime() - secsSinceMidnight * 1000).toISOString();
    const rr = await sb(`resets?select=id&user_id=eq.${p.id}&occurred_at=gte.${localMidnight}&limit=1`);
    const todays = rr.ok ? await rr.json() : [];
    if (Array.isArray(todays) && todays.length > 0) continue;

    const recentRes = await sb(`resets?select=situation_id,custom_situation&user_id=eq.${p.id}&order=occurred_at.desc&limit=5`);
    const recent = recentRes.ok ? await recentRes.json() : [];
    const recentSituations: string[] = (Array.isArray(recent) ? recent : []).map((x: any) => x.custom_situation || x.situation_id).filter(Boolean);

    const msg = await personalisedMessage(p.name ?? 'there', recentSituations);
    messages.push({ to: p.expo_push_token, title: msg.title, body: msg.body, sound: 'default', channelId: 'reminders', data: { type: 'reset' } });
    nudged.push({ id: p.id, localDate });
  }

  let sent = 0;
  if (messages.length > 0) {
    try {
      const pr = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(messages),
      });
      if (pr.ok) sent = messages.length;
    } catch {}
    // mark each nudged with their local date
    for (const n of nudged) {
      await sb(`profiles?id=eq.${n.id}`, { method: 'PATCH', body: JSON.stringify({ push_last_sent_on: n.localDate }) });
    }
  }

  return json({ ok: true, candidates: profiles.length, nudged: nudged.length, sent });
});
