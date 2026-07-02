import { supabase } from './client';
import type { ResetRecord } from '../store/AppState';

/**
 * Cloud sync helpers. Local AsyncStorage stays the source of truth for a
 * responsive, offline-first feel; these mirror data to Supabase, scoped to the
 * signed-in user by row-level security. All functions no-op safely if Supabase
 * isn't configured or the user isn't signed in.
 */

export interface CloudProfile {
  name?: string | null;
  dob?: string | null; // YYYY-MM-DD
  avatar_url?: string | null;
}

/** Map a local ResetRecord → the resets table row for this user. */
function toRow(userId: string, r: ResetRecord) {
  return {
    user_id: userId,
    client_id: r.id,
    occurred_at: r.date,
    heaviness: r.heaviness ?? null,
    emotion: r.emotion ?? null,
    situation_id: r.situationId ?? null,
    custom_situation: r.customSituation ?? null,
    note: r.note ?? null,
    reframe: r.reframe ?? null,
    action_text: r.actionText ?? null,
    keywords: r.keywords ?? null,
    distortion: r.distortion ?? null,
    outcome: r.outcome ?? null,
  };
}

/** Map a cloud row → local ResetRecord. */
function fromRow(row: any): ResetRecord {
  return {
    id: row.client_id || row.id,
    date: row.occurred_at || row.created_at,
    heaviness: row.heaviness ?? undefined,
    emotion: row.emotion ?? undefined,
    situationId: row.situation_id ?? undefined,
    customSituation: row.custom_situation ?? undefined,
    note: row.note ?? undefined,
    reframe: row.reframe ?? undefined,
    actionText: row.action_text ?? undefined,
    keywords: Array.isArray(row.keywords) ? row.keywords : undefined,
    distortion: row.distortion ?? undefined,
    outcome: row.outcome ?? undefined,
  };
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Create/update the user's profile row (name, DOB, avatar). */
export async function upsertProfile(patch: CloudProfile): Promise<void> {
  const uid = await currentUserId();
  if (!supabase || !uid) return;
  await supabase
    .from('profiles')
    .upsert({ id: uid, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'id' });
}

export async function fetchProfile(): Promise<CloudProfile | null> {
  const uid = await currentUserId();
  if (!supabase || !uid) return null;
  const { data, error } = await supabase.from('profiles').select('name,dob,avatar_url').eq('id', uid).single();
  if (error) return null;
  return data as CloudProfile;
}

/** Upsert local resets to the cloud (idempotent on user_id + client_id). */
export async function pushResets(resets: ResetRecord[]): Promise<void> {
  const uid = await currentUserId();
  if (!supabase || !uid || resets.length === 0) return;
  const rows = resets.map((r) => toRow(uid, r));
  await supabase.from('resets').upsert(rows, { onConflict: 'user_id,client_id' });
}

/** Fetch all of the user's cloud resets, newest first. */
export async function fetchResets(): Promise<ResetRecord[]> {
  const uid = await currentUserId();
  if (!supabase || !uid) return [];
  const { data, error } = await supabase
    .from('resets')
    .select('*')
    .eq('user_id', uid)
    .order('occurred_at', { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

/** Delete all of the user's cloud data (resets + profile fields). */
export async function deleteAllCloud(): Promise<void> {
  const uid = await currentUserId();
  if (!supabase || !uid) return;
  await supabase.from('resets').delete().eq('user_id', uid);
  await supabase.from('profiles').update({ dob: null, avatar_url: null }).eq('id', uid);
}
