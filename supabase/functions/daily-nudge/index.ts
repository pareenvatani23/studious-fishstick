/**
 * daily-nudge — cron every 30 min. Runs a per-user, per-day AI PLAN that decides
 * (from the user's recent difficulty + patterns + engagement) whether today
 * warrants a reset reminder and/or a lesson suggestion, and how tough the week
 * has been. Hard cap: at most 2 notifications/day (one reset + one lesson),
 * staggered — reset at the user's reminder hour, lesson at local midday. Calm
 * weeks default to sparse (e.g. weekend mornings); tough weeks get daily support.
 *
 * Also writes plan.note (a consistency message shown in-app). x-cron-secret only.
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const LESSON_HOUR = 13; // local hour to send a lesson suggestion (staggered from reset)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
async function sb(path: string, init?: RequestInit) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
}
function localParts(now: Date, tz: string) {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short' });
    const p: Record<string, string> = {};
    for (const part of fmt.formatToParts(now)) if (part.type !== 'literal') p[part.type] = part.value;
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second, wd: p.weekday };
  } catch {
    return { y: now.getUTCFullYear(), mo: now.getUTCMonth() + 1, d: now.getUTCDate(), h: now.getUTCHours(), mi: now.getUTCMinutes(), s: now.getUTCSeconds(), wd: '' };
  }
}
const dateStr = (p: { y: number; mo: number; d: number }) => `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;

async function buildPlan(p: any, lp: any, resets7: any[], resetToday: boolean): Promise<any> {
  const total = resets7.length;
  const heavies = resets7.filter((r) => (r.heaviness ?? 0) >= 4).length;
  const avgHeavy = total ? resets7.reduce((s, r) => s + (r.heaviness ?? 0), 0) / total : 0;
  const hardWeek = heavies >= 2 || avgHeavy >= 3.5;
  const emotions = [...new Set(resets7.map((r) => r.emotion).filter(Boolean))].slice(0, 6);
  const distortions = [...new Set(resets7.map((r) => r.distortion).filter(Boolean))].slice(0, 5);
  const isWeekend = lp.wd === 'Sat' || lp.wd === 'Sun';
  const lessonsWatched = Array.isArray(p.lessons_watched) ? p.lessons_watched.length : 0;

  const fallback = {
    toughness: heavies >= 2 || avgHeavy >= 3.5 ? 'high' : total >= 3 ? 'medium' : 'low',
    sendReset: heavies >= 2 || avgHeavy >= 3.5 ? !resetToday : isWeekend ? true : total < 2 && !resetToday,
    sendLesson: heavies >= 2 || total >= 4,
    sendCommunity: isWeekend, // sparse invite to share a kind thought
    note: total >= 8
      ? 'You’ve shown up often — that regularity is where change compounds. Keep the rhythm.'
      : total >= 3
      ? 'You’re building a rhythm. A reset most days and the odd lesson is how it sticks.'
      : 'Little and often works best — a short reset on most days, a lesson when you can.',
  };
  if (!OPENAI_API_KEY) return fallback;
  try {
    const prompt = [
      `You are planning today's gentle notifications for a CBT self-help app user, and a short in-app consistency note.`,
      `Their last 7 days: ${total} resets, ${heavies} high-heaviness days, avg heaviness ${avgHeavy.toFixed(1)}/5.`,
      emotions.length ? `Feelings: ${JSON.stringify(emotions)}.` : '',
      distortions.length ? `Thinking patterns: ${JSON.stringify(distortions)}.` : '',
      `Lessons learned so far: ${lessonsWatched}. Today is ${lp.wd}${isWeekend ? ' (weekend)' : ''}. Already did a reset today: ${resetToday}.`,
      `RULES:`,
      `- Non-annoying. At most ONE reset reminder and ONE lesson suggestion today (never more).`,
      `- If the week looks TOUGH (high heaviness / many hard days), offer more support: a reset reminder and often a lesson.`,
      `- If the week looks CALM and they're consistent, be sparse — prefer only a gentle weekend-morning reset, few or no lessons.`,
      `- Don't send a reset reminder if they've already reset today.`,
      `- "sendCommunity": a few times a week, gently invite them to share one positive thought to the community (never combined so total stays small).`,
      `- The "note" is a short, warm in-app message about staying regular with resets AND lessons for best results (1-2 sentences, plain, no emojis).`,
      `Return minified JSON: {"toughness":"low|medium|high","sendReset":true|false,"sendLesson":true|false,"sendCommunity":true|false,"note":"..."}`,
    ].filter(Boolean).join('\n');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.5, max_tokens: 200, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You plan kind, sparse notifications and a consistency note. Output ONLY minified JSON.' }, { role: 'user', content: prompt }] }),
    });
    if (!res.ok) return fallback;
    const d = JSON.parse((await res.json()).choices[0].message.content);
    return {
      toughness: ['low', 'medium', 'high'].includes(d.toughness) ? d.toughness : fallback.toughness,
      // guarantee support on genuinely hard weeks; never nudge if already reset today
      sendReset: (!!d.sendReset || hardWeek) && !resetToday,
      sendLesson: !!d.sendLesson || hardWeek,
      sendCommunity: !!d.sendCommunity,
      note: (typeof d.note === 'string' && d.note.trim()) ? d.note.trim().slice(0, 240) : fallback.note,
    };
  } catch {
    return fallback;
  }
}

async function resetMessage(name: string, recentSituations: string[]): Promise<{ title: string; body: string }> {
  const fallback = { title: 'A quiet minute for you', body: name && name !== 'there' ? `${name}, a two-minute reset can steady the day.` : 'A two-minute reset can steady the day.' };
  if (!OPENAI_API_KEY) return fallback;
  try {
    const prompt = `Write ONE short, warm push nudging a CBT user to do their 2-minute reset today (not done yet).${recentSituations.length ? ' Recent themes: ' + JSON.stringify(recentSituations.slice(0, 4)) + '.' : ''} Non-nagging, no guilt, plain, no emojis.${name && name !== 'there' ? ' You may use "' + name + '" sparingly.' : ''} title<=40, body<=110. JSON {"title":"","body":""}.`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.9, max_tokens: 120, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Brief kind reminders. Output ONLY minified JSON.' }, { role: 'user', content: prompt }] }) });
    if (!res.ok) return fallback;
    const d = JSON.parse((await res.json()).choices[0].message.content);
    const title = String(d.title ?? '').slice(0, 50).trim(); const body = String(d.body ?? '').slice(0, 140).trim();
    return title && body ? { title, body } : fallback;
  } catch { return fallback; }
}

async function pickLesson(watched: string[]): Promise<{ id: string; title: string } | null> {
  const r = await sb(`lessons?select=id,title,created_at&published=eq.true&order=created_at.desc&limit=40`);
  if (!r.ok) return null;
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows.length) return null;
  const unwatched = rows.filter((l: any) => !watched.includes(l.id));
  const pick = (unwatched[0] || rows[0]);
  return pick ? { id: pick.id, title: pick.title } : null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) return json({ error: 'Forbidden' }, 403);
  if (!SVC) return json({ error: 'Not configured' }, 500);

  let reqBody: any = {};
  try { reqBody = await req.json(); } catch {}
  const force = !!reqBody?.force; // test-only: bypass time-of-day gates

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const res = await sb(`profiles?select=id,name,expo_push_token,reminder_hour,timezone,plan,plan_date,push_last_sent_on,last_lesson_push_on,last_post_on,lessons_watched&reminder_enabled=eq.true&expo_push_token=not.is.null`);
  if (!res.ok) return json({ error: `profiles ${res.status}` }, 502);
  const profiles: any[] = await res.json();

  // Cheap in-memory pass: only users DUE in this window get any DB/AI work.
  // (Everyone else costs nothing but an Intl call.)
  const due = profiles.map((p) => {
    const lp = localParts(now, p.timezone || 'UTC');
    return { p, lp, localDate: dateStr(lp), resetDue: force || (lp.h === p.reminder_hour && lp.mi < 30), lessonDue: force || (lp.h === LESSON_HOUR && lp.mi < 30) };
  }).filter((d) => d.resetDue || d.lessonDue);

  let planned = 0;
  const pushes: any[] = [];
  const patchMap: Record<string, any> = {};
  const addPatch = (id: string, body: any) => { patchMap[id] = { ...(patchMap[id] || {}), ...body }; };

  async function processOne(d: any) {
    const { p, lp, localDate, resetDue, lessonDue } = d;
    const secs = lp.h * 3600 + lp.mi * 60 + lp.s;
    const localMidnight = new Date(now.getTime() - secs * 1000).toISOString();
    const rr = await sb(`resets?select=id,heaviness,emotion,distortion,situation_id,custom_situation,occurred_at&user_id=eq.${p.id}&occurred_at=gte.${weekAgo}&order=occurred_at.desc`);
    const resets7 = rr.ok ? await rr.json() : [];
    const resetToday = Array.isArray(resets7) && resets7.some((r: any) => r.occurred_at >= localMidnight);

    let plan = p.plan;
    if (p.plan_date !== localDate || !plan) {
      plan = await buildPlan(p, lp, Array.isArray(resets7) ? resets7 : [], resetToday);
      planned += 1;
      addPatch(p.id, { plan, plan_date: localDate });
    }
    if (resetDue && plan.sendReset && !resetToday && p.push_last_sent_on !== localDate) {
      const recentSituations: string[] = (Array.isArray(resets7) ? resets7 : []).map((x: any) => x.custom_situation || x.situation_id).filter(Boolean);
      const msg = await resetMessage(p.name ?? 'there', recentSituations);
      pushes.push({ to: p.expo_push_token, title: msg.title, body: msg.body, sound: 'default', channelId: 'reminders', data: { type: 'reset' } });
      addPatch(p.id, { push_last_sent_on: localDate });
    }
    // Midday slot: at most ONE of {community, lesson} per day (keeps total <=2/day).
    if (lessonDue && p.last_lesson_push_on !== localDate) {
      if (plan.sendCommunity && p.last_post_on !== localDate) {
        pushes.push({ to: p.expo_push_token, title: 'Change someone’s day', body: 'You can help, save or change a life with one beautiful thought or affirmation. Share one?', sound: 'default', channelId: 'reminders', data: { type: 'community' } });
        addPatch(p.id, { last_lesson_push_on: localDate });
      } else if (plan.sendLesson) {
        const lesson = await pickLesson(Array.isArray(p.lessons_watched) ? p.lessons_watched : []);
        if (lesson) {
          pushes.push({ to: p.expo_push_token, title: 'A lesson that might help', body: lesson.title, sound: 'default', channelId: 'reminders', data: { type: 'lesson', lessonId: lesson.id } });
          addPatch(p.id, { last_lesson_push_on: localDate });
        }
      }
    }
  }

  // bounded concurrency
  const CONC = 8;
  for (let i = 0; i < due.length; i += CONC) {
    await Promise.all(due.slice(i, i + CONC).map(processOne));
  }

  // batch Expo push (max 100/request)
  let sent = 0;
  for (let i = 0; i < pushes.length; i += 100) {
    const batch = pushes.slice(i, i + 100);
    try {
      const pr = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(batch) });
      if (pr.ok) sent += batch.length;
    } catch {}
  }
  // one merged PATCH per user
  await Promise.all(Object.entries(patchMap).map(([id, body]) => sb(`profiles?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(body) })));

  return json({ ok: true, candidates: profiles.length, due: due.length, planned, sent });
});
