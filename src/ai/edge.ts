/**
 * Thin client for the Supabase Edge Functions that hold the AI/voice keys.
 * All requests carry the signed-in user's token (the functions reject anyone
 * who isn't a real authenticated user).
 */
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase/client';
import { AI_TIMEOUT_MS } from './config';

type AIAction = 'generateReset' | 'suggestSituations' | 'suggestEmotions' | 'generateReminders';

async function accessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Call the `ai` edge function and return its parsed JSON. Throws on failure. */
export async function invokeAI<T = any>(action: AIAction, input: unknown): Promise<T> {
  const token = await accessToken();
  if (!token) throw new Error('Not signed in');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, input }),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `ai ${res.status}`);
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Ask the `rank-lessons` function to order lessons for this user. Falls back to input order. */
export async function rankLessons(
  history: unknown,
  lessons: { id: string; title: string; category: string; summary?: string }[]
): Promise<string[]> {
  const fallback = lessons.map((l) => l.id);
  const token = await accessToken();
  if (!token) return fallback;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/rank-lessons`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ history, lessons }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return Array.isArray(data?.order) && data.order.length ? data.order : fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** Call the `tts` edge function and return raw mp3 bytes. Throws on failure. */
export async function invokeTTS(text: string): Promise<ArrayBuffer> {
  const token = await accessToken();
  if (!token) throw new Error('Not signed in');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/tts`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      let msg = `tts ${res.status}`;
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {}
      throw new Error(msg);
    }
    return await res.arrayBuffer();
  } finally {
    clearTimeout(timer);
  }
}
