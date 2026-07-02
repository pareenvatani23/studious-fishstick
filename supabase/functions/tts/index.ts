/**
 * TrueShift TTS edge function — ElevenLabs proxy.
 *
 * Holds the ElevenLabs key as a Supabase secret. Requires a valid user JWT.
 * Takes { text, voiceId? } and returns audio/mpeg bytes for the client to play.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') ?? '';
const DEFAULT_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') ?? 'pFZP5JQG7iQjIQuC4Bku';
const MODEL = Deno.env.get('ELEVENLABS_MODEL') ?? 'eleven_multilingual_v2';
const MAX_CHARS = 2500; // guard against runaway usage

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Require a genuine authenticated-user token (see ai/index.ts for rationale). */
function isAuthedUser(req: Request): boolean {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'authenticated' && !!payload.sub && (!payload.exp || payload.exp * 1000 >= Date.now());
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return err('Method not allowed', 405);
  if (!ELEVENLABS_API_KEY) return err('Voice not configured', 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON', 400);
  }
  const text = String(body?.text ?? '').slice(0, MAX_CHARS).trim();
  const voiceId = String(body?.voiceId ?? DEFAULT_VOICE_ID);
  if (!text) return err('Missing text', 400);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return err(`ElevenLabs ${res.status}: ${detail.slice(0, 200)}`, 502);
    }
    const audio = await res.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return err(String((e as Error)?.message ?? e), 502);
  } finally {
    clearTimeout(timer);
  }
});
