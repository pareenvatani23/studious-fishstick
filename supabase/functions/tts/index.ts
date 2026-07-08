/**
 * TrueShift TTS edge function — OpenAI text-to-speech (natural, ~10x cheaper
 * than premium services). Holds the OpenAI key as a Supabase secret. Requires a
 * valid user JWT. Takes { text, voice? } and returns audio/mpeg bytes.
 *
 * Caching: audio is cached in Storage (bucket `tts-cache`) keyed by a hash of
 * model+voice+text. Shared text (e.g. lesson narration) is synthesised once and
 * reused across all users — the main cost lever alongside play-on-tap.
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const TTS_MODEL = Deno.env.get('OPENAI_TTS_MODEL') ?? 'tts-1';
const TTS_VOICE = Deno.env.get('OPENAI_TTS_VOICE') ?? 'nova'; // warm female
const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MAX_CHARS = 2500;
const CACHE_BUCKET = 'tts-cache';
// Models the client may request. gpt-4o-mini-tts takes a free-text `instructions`
// field to steer tone/emotion (used for the warm, human reset narration).
const ALLOWED_MODELS = new Set(['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts']);
const ALLOWED_VOICES = new Set(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'sage', 'coral', 'ballad']);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function isAuthedUser(req: Request): boolean {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return false;
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.role === 'authenticated' && !!p.sub && (!p.exp || p.exp * 1000 >= Date.now());
  } catch { return false; }
}
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function audioResponse(bytes: ArrayBuffer, cache: 'HIT' | 'MISS') {
  return new Response(bytes, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg', 'X-TTS-Cache': cache, 'Cache-Control': 'no-store' } });
}

async function cacheGet(path: string): Promise<ArrayBuffer | null> {
  if (!SVC) return null;
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/${CACHE_BUCKET}/${path}`, { headers: { apikey: SVC, Authorization: `Bearer ${SVC}` } });
    if (!r.ok) return null;
    return await r.arrayBuffer();
  } catch { return null; }
}
async function cachePut(path: string, bytes: ArrayBuffer): Promise<void> {
  if (!SVC) return;
  try {
    await fetch(`${SB_URL}/storage/v1/object/${CACHE_BUCKET}/${path}`, {
      method: 'POST',
      headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
      body: bytes,
    });
  } catch { /* best-effort */ }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return err('Method not allowed', 405);
  if (!isAuthedUser(req)) return err('Sign in required', 401);
  if (!OPENAI_API_KEY) return err('Voice not configured', 500);

  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400); }
  const text = String(body?.text ?? '').slice(0, MAX_CHARS).trim();
  const voice = ALLOWED_VOICES.has(String(body?.voice)) ? String(body.voice) : TTS_VOICE;
  const model = ALLOWED_MODELS.has(String(body?.model)) ? String(body.model) : TTS_MODEL;
  const instructions = model === 'gpt-4o-mini-tts' ? String(body?.instructions ?? '').slice(0, 600) : '';
  if (!text) return err('Missing text', 400);

  // cache key must include everything that changes the audio (model, voice, tone)
  const hash = await sha256Hex(`${model}:${voice}:${instructions}:${text}`);
  const path = `${hash}.mp3`;

  // cache hit → serve stored audio
  const cached = await cacheGet(path);
  if (cached) return audioResponse(cached, 'HIT');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const speak = (m: string, v: string, ins: string) => {
      const payload: Record<string, unknown> = { model: m, voice: v, input: text, response_format: 'mp3' };
      if (ins && m === 'gpt-4o-mini-tts') payload.instructions = ins;
      return fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        signal: ctrl.signal,
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    };

    let res = await speak(model, voice, instructions);
    // Graceful degrade: if a richer model/voice isn't available, still return a
    // warm OpenAI voice (tts-1/shimmer) rather than dropping to device speech.
    if (!res.ok && model !== 'tts-1') {
      const fallbackVoice = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voice) ? voice : 'shimmer';
      res = await speak('tts-1', fallbackVoice, '');
    }
    if (!res.ok) {
      const detail = await res.text();
      return err(`OpenAI TTS ${res.status}: ${detail.slice(0, 160)}`, 502);
    }
    const audio = await res.arrayBuffer();
    await cachePut(path, audio); // store for reuse (shared text dedupes across users)
    return audioResponse(audio, 'MISS');
  } catch (e) {
    return err(String((e as Error)?.message ?? e), 502);
  } finally {
    clearTimeout(timer);
  }
});
