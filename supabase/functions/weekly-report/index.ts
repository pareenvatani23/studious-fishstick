/**
 * weekly-report — builds a graphical weekly PDF and stores it in Supabase
 * Storage (bucket `reports`, path <uid>/week-<date>.pdf) with a metadata row in
 * public.reports, so the app can list + download reports any time.
 *
 * Invocation:
 *   - cron (x-cron-secret): process ALL users with activity, store + push
 *     (deep-links to Insights).
 *   - user JWT (from the app "Generate now" button): process just that user,
 *     store, no push.
 *   - debug (x-cron-secret + {debug:true,userId}): return the PDF base64, no store.
 */
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const TEAL = rgb(0.455, 0.780, 0.722);
const LAV = rgb(0.663, 0.608, 0.831);
const INK = rgb(0.09, 0.12, 0.13);
const MUTED = rgb(0.45, 0.5, 0.52);
const LINE = rgb(0.88, 0.9, 0.9);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
async function sb(path: string, init?: RequestInit) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
}
function jwtUid(req: Request): string | null {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return null;
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (p.role !== 'authenticated' || !p.sub) return null;
    if (p.exp && p.exp * 1000 < Date.now()) return null;
    return p.sub as string;
  } catch {
    return null;
  }
}

const SITUATION_LABELS: Record<string, string> = {
  unanswered: 'Someone didn’t reply', avoiding: 'Dreading a task', snapped: 'Snapped at someone',
  compared: 'Compared myself', overwhelmed: 'Too much at once', cantSwitchOff: 'Can’t switch off', somethingElse: 'Something else',
};

function aggregate(resets: any[]) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const perDay = [0, 0, 0, 0, 0, 0, 0];
  const situations: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const distortions: Record<string, number> = {};
  const keywords: Record<string, number> = {};
  let actionsDone = 0;
  for (const r of resets) {
    const d = new Date(r.occurred_at || r.created_at);
    perDay[d.getUTCDay()] += 1;
    const label = (r.custom_situation && String(r.custom_situation).trim()) || SITUATION_LABELS[r.situation_id] || r.situation_id || 'A moment';
    if (label) situations[label] = (situations[label] || 0) + 1;
    if (r.emotion) emotions[r.emotion] = (emotions[r.emotion] || 0) + 1;
    if (r.distortion) distortions[r.distortion] = (distortions[r.distortion] || 0) + 1;
    (r.keywords || []).forEach((k: string) => { const key = String(k).toLowerCase().trim(); if (key) keywords[key] = (keywords[key] || 0) + 1; });
    if (r.outcome === 'done') actionsDone += 1;
  }
  const top = (o: Record<string, number>, n: number) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  return {
    total: resets.length, actionsDone,
    weekly: dayLabels.map((label, i) => ({ label, value: perDay[i] })),
    situations: top(situations, 5), emotions: top(emotions, 6), distortions: top(distortions, 5), keywords: top(keywords, 14),
  };
}

async function aiSummary(name: string, agg: any): Promise<string> {
  const fallback = `This week you took ${agg.total} reset${agg.total === 1 ? '' : 's'} and followed through on ${agg.actionsDone} small step${agg.actionsDone === 1 ? '' : 's'}. Noticing your patterns is real progress — keep going gently.`;
  if (!OPENAI_API_KEY) return fallback;
  try {
    const prompt = [
      `Write a warm, 3-4 sentence weekly reflection summary for a CBT self-help app user named ${name}.`,
      `This week: ${agg.total} resets, ${agg.actionsDone} small steps done.`,
      agg.situations.length ? `Recurring situations: ${JSON.stringify(agg.situations.map((s: any) => s[0]))}.` : '',
      agg.emotions.length ? `Feelings: ${JSON.stringify(agg.emotions.map((s: any) => s[0]))}.` : '',
      agg.distortions.length ? `Thinking patterns: ${JSON.stringify(agg.distortions.map((s: any) => s[0]))}.` : '',
      `Encouraging, specific, non-clinical, no toxic positivity, no emojis. Return minified JSON {"summary":""}.`,
    ].filter(Boolean).join('\n');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.7, max_tokens: 220, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Warm CBT reflection writer. Output ONLY minified JSON.' }, { role: 'user', content: prompt }] }),
    });
    if (!res.ok) return fallback;
    const s = JSON.parse((await res.json()).choices[0].message.content).summary;
    return (typeof s === 'string' && s.trim()) ? s.trim() : fallback;
  } catch {
    return fallback;
  }
}

function wrap(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) > maxWidth && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

async function buildPdf(name: string, range: string, agg: any, summary: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const M = 48;
  const W = 595 - M * 2;
  let y = 842 - 56;
  const text = (t: string, x: number, yy: number, size: number, f = font, color = INK) => page.drawText(t, { x, y: yy, size, font: f, color });
  const sectionLabel = (t: string, yy: number) => text(t.toUpperCase(), M, yy, 10, bold, TEAL);

  text('Your week on TrueShift', M, y, 24, bold);
  y -= 22; text(range, M, y, 11, font, MUTED); y -= 30;
  const tiles = [['Resets', String(agg.total)], ['Steps taken', String(agg.actionsDone)], ['Active days', String(agg.weekly.filter((d: any) => d.value > 0).length)]];
  const tw = (W - 20) / 3;
  tiles.forEach((t, i) => {
    const x = M + i * (tw + 10);
    page.drawRectangle({ x, y: y - 46, width: tw, height: 46, borderColor: LINE, borderWidth: 1, color: rgb(0.98, 0.99, 0.99) });
    text(t[1], x + 12, y - 24, 22, bold, i === 0 ? TEAL : i === 1 ? rgb(0.4, 0.72, 0.5) : LAV);
    text(t[0], x + 12, y - 40, 9, font, MUTED);
  });
  y -= 74;

  sectionLabel('This week', y); y -= 16;
  const chartH = 70, baseY = y - chartH;
  const maxV = Math.max(1, ...agg.weekly.map((d: any) => d.value));
  const bw = W / 7;
  agg.weekly.forEach((d: any, i: number) => {
    const bh = (d.value / maxV) * chartH;
    const x = M + i * bw + 6;
    page.drawRectangle({ x, y: baseY, width: bw - 12, height: Math.max(2, bh), color: d.value ? TEAL : rgb(0.9, 0.92, 0.92) });
    text(d.label, x + (bw - 12) / 2 - 8, baseY - 12, 8, font, MUTED);
    if (d.value) text(String(d.value), x + (bw - 12) / 2 - 3, baseY + Math.max(2, bh) + 3, 8, bold, MUTED);
  });
  y = baseY - 28;

  const colW = (W - 20) / 2;
  const startY = y;
  const barList = (title: string, items: [string, number][], x: number, yTop: number, color: any) => {
    let yy = yTop;
    sectionLabel(title, yy); yy -= 16;
    if (!items.length) { text('—', x, yy, 11, font, MUTED); return yy - 16; }
    const maxN = Math.max(...items.map((i) => i[1]));
    for (const [label, n] of items) {
      const bw2 = Math.max(6, (n / maxN) * colW);
      page.drawRectangle({ x, y: yy - 10, width: bw2, height: 10, color });
      const short = label.length > 26 ? label.slice(0, 25) + '…' : label;
      text(short, x, yy - 22, 9.5, font, INK);
      text(String(n), x + colW - 12, yy - 9, 9, bold, MUTED);
      yy -= 30;
    }
    return yy;
  };
  const endL = barList('What came up', agg.situations, M, startY, rgb(0.85, 0.9, 0.88));
  const endR = barList('Feelings', agg.emotions, M + colW + 20, startY, rgb(0.9, 0.88, 0.95));
  y = Math.min(endL, endR) - 10;

  sectionLabel('Thinking patterns that recurred', y); y -= 16;
  if (agg.distortions.length) { for (const [n2, n] of agg.distortions) { text(`•  ${n2}`, M, y, 11, font, INK); text(`${n}×`, M + W - 24, y, 10, bold, MUTED); y -= 16; } }
  else { text('—', M, y, 11, font, MUTED); y -= 16; }
  y -= 10;

  sectionLabel('Your thoughts this week', y); y -= 18;
  if (agg.keywords.length) {
    const maxK = agg.keywords[0][1];
    let x = M; let rowY = y;
    for (const [word, n] of agg.keywords) {
      const size = 10 + Math.round((n / maxK) * 10);
      const w = font.widthOfTextAtSize(word, size) + 14;
      if (x + w > M + W) { x = M; rowY -= 26; }
      page.drawRectangle({ x, y: rowY - 6, width: w, height: size + 8, color: rgb(0.95, 0.93, 0.98), borderColor: rgb(0.85, 0.82, 0.92), borderWidth: 0.5 });
      text(word, x + 7, rowY, size, font, rgb(0.42, 0.36, 0.6));
      x += w + 8;
    }
    y = rowY - 30;
  } else { text('—', M, y, 11, font, MUTED); y -= 20; }

  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 1, color: LINE }); y -= 20;
  sectionLabel('Your reflection', y); y -= 16;
  for (const ln of wrap(summary, font, 11.5, W)) { text(ln, M, y, 11.5, font, INK); y -= 16; }
  text('TrueShift · a self-help reflection, not therapy or a crisis service.', M, 40, 8, font, MUTED);
  return await doc.save();
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

async function uploadPdf(uid: string, fileName: string, pdf: Uint8Array): Promise<string> {
  const path = `${uid}/${fileName}`;
  const res = await fetch(`${SB_URL}/storage/v1/object/reports/${path}`, {
    method: 'POST',
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/pdf', 'x-upsert': 'true' },
    body: pdf,
  });
  if (!res.ok) throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 150)}`);
  return path;
}

async function processUser(p: any, since: string, opts: { store: boolean; sendPush: boolean; returnPdf: boolean }) {
  const rr = await sb(`resets?select=*&user_id=eq.${p.id}&occurred_at=gte.${since}&order=occurred_at.desc`);
  const resets = rr.ok ? await rr.json() : [];
  if (!Array.isArray(resets) || resets.length === 0) return { id: p.id, skipped: 'no activity' };

  const name = p.name && p.name !== 'there' ? p.name : 'there';
  const agg = aggregate(resets);
  const summary = await aiSummary(name, agg);
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 86400000);
  const psStr = start.toISOString().slice(0, 10);
  const peStr = now.toISOString().slice(0, 10);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const pdf = await buildPdf(name, `${fmt(start)} – ${fmt(now)}`, agg, summary);

  let path: string | null = null;
  if (opts.store) {
    const fileName = `week-${peStr}.pdf`;
    path = await uploadPdf(p.id, fileName, pdf);
    // one metadata row per stored file (replace same path)
    await sb(`reports?user_id=eq.${p.id}&path=eq.${encodeURIComponent(path)}`, { method: 'DELETE' });
    await sb('reports', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: p.id, period_start: psStr, period_end: peStr, path, summary }) });
  }

  let pushed = false;
  if (opts.sendPush && p.expo_push_token) {
    try {
      const pr = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify([{ to: p.expo_push_token, title: 'Your weekly reflection is ready', body: summary.slice(0, 110), sound: 'default', channelId: 'reminders', data: { type: 'insights' } }]),
      });
      pushed = pr.ok;
    } catch {}
  }

  const out: any = { id: p.id, resets: resets.length, path, pushed, summary };
  if (opts.returnPdf) out.pdfBase64 = toBase64(pdf);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!SVC) return json({ error: 'Not configured' }, 500);

  let body: any = {};
  try { body = await req.json(); } catch {}
  const since = new Date(Date.now() - 7 * 86400000).toISOString();

  const uid = jwtUid(req);
  const isCron = CRON_SECRET && req.headers.get('x-cron-secret') === CRON_SECRET;

  // On-demand: authenticated user generates + stores their own report.
  if (uid && !isCron) {
    const r = await sb(`profiles?select=id,name,expo_push_token&id=eq.${uid}`);
    const profiles = r.ok ? await r.json() : [];
    if (!profiles.length) return json({ error: 'no profile' }, 404);
    const result = await processUser(profiles[0], since, { store: true, sendPush: false, returnPdf: false });
    return json(result);
  }

  if (!isCron) return json({ error: 'Forbidden' }, 403);

  const debug = !!body?.debug;
  let profiles: any[];
  if (debug && body.userId) {
    const r = await sb(`profiles?select=id,name,expo_push_token&id=eq.${body.userId}`);
    profiles = r.ok ? await r.json() : [];
  } else {
    const r = await sb(`profiles?select=id,name,expo_push_token`);
    profiles = r.ok ? await r.json() : [];
  }

  const results = [];
  for (const p of profiles) {
    try { results.push(await processUser(p, since, { store: !debug, sendPush: !debug, returnPdf: debug })); }
    catch (e) { results.push({ id: p.id, error: String((e as Error)?.message ?? e) }); }
  }
  return json({ ok: true, users: profiles.length, results });
});
