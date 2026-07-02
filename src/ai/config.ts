/**
 * AI config.
 *
 * Keys now live SERVER-SIDE in Supabase Edge Functions (functions: `ai`, `tts`).
 * The client no longer carries any OpenAI/ElevenLabs key — it calls the edge
 * functions with the signed-in user's token. AI/voice are available whenever
 * Supabase is configured (works on native and web; the functions send CORS).
 */
import { supabaseEnabled } from '../supabase/client';

export const aiEnabled = supabaseEnabled;
export const voiceEnabled = supabaseEnabled;

/** Abort client→edge calls that hang. Edge functions have their own inner timeouts. */
export const AI_TIMEOUT_MS = 25000;
