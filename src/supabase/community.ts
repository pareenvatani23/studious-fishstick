import { supabase } from './client';

export interface Post {
  id: string;
  text: string;
  helped_count: number;
  quality_score: number;
  published_at: string | null;
  created_at: string;
  author_label?: string | null;
  reacted?: boolean;
  saved?: boolean;
}

export type SubmitResult =
  | { status: 'published'; id: string }
  | { status: 'rejected'; reason: string }
  | { status: 'limit'; reason: string }
  | { status: 'crisis' }
  | { status: 'error'; reason: string };

/** Submit a post through the AI gate (moderation + quality + 1/day). */
export async function submitPost(text: string): Promise<SubmitResult> {
  if (!supabase) return { status: 'error', reason: 'Not connected.' };
  try {
    const { data, error } = await supabase.functions.invoke('community-post', { body: { text } });
    if (error) {
      // functions.invoke surfaces non-2xx as an error; try to read the body
      try { const ctx = await (error as any).context?.json?.(); if (ctx?.status) return ctx; } catch {}
      return { status: 'error', reason: 'Could not post right now.' };
    }
    return data as SubmitResult;
  } catch {
    return { status: 'error', reason: 'Could not post right now.' };
  }
}

async function ownSets(): Promise<{ reacted: Set<string>; saved: Set<string> }> {
  const reacted = new Set<string>();
  const saved = new Set<string>();
  if (!supabase) return { reacted, saved };
  const [{ data: r }, { data: s }] = await Promise.all([
    supabase.from('post_reactions').select('post_id'),
    supabase.from('post_saves').select('post_id'),
  ]);
  (r ?? []).forEach((x: any) => reacted.add(x.post_id));
  (s ?? []).forEach((x: any) => saved.add(x.post_id));
  return { reacted, saved };
}

function rank(posts: Post[]): Post[] {
  const now = Date.now();
  const seen = new Set<string>();
  return posts
    .filter((p) => {
      const key = p.text.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => {
      const ageDays = (now - new Date(p.published_at || p.created_at).getTime()) / 86400000;
      const freshness = Math.max(0, 8 - ageDays); // gentle recency boost
      return { p, score: p.quality_score + p.helped_count * 3 + freshness };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/** The finite "Daily Drop": a hero + a small curated set (never endless). */
export async function fetchFeed(): Promise<{ hero: Post | null; drop: Post[] }> {
  if (!supabase) return { hero: null, drop: [] };
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data, error } = await supabase
    .from('posts')
    .select('id,text,helped_count,quality_score,published_at,created_at,author_label')
    .eq('status', 'published')
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(60);
  if (error || !data) return { hero: null, drop: [] };
  const { reacted, saved } = await ownSets();
  const ranked = rank(data as Post[]).map((p) => ({ ...p, reacted: reacted.has(p.id), saved: saved.has(p.id) }));
  return { hero: ranked[0] ?? null, drop: ranked.slice(1, 13) };
}

/** Posts the user saved, newest first. */
export async function fetchSaved(): Promise<Post[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('post_saves')
    .select('created_at, posts(id,text,helped_count,quality_score,published_at,created_at,author_label)')
    .order('created_at', { ascending: false });
  const posts = (data ?? []).map((r: any) => r.posts).filter(Boolean);
  return posts.map((p: any) => ({ ...p, saved: true }));
}

/** The community messages that most recently resonated (saved or reacted-to). */
export async function fetchRecentResonant(limit = 2): Promise<string[]> {
  if (!supabase) return [];
  try {
    const [{ data: sv }, { data: rc }] = await Promise.all([
      supabase.from('post_saves').select('created_at, posts(text)').order('created_at', { ascending: false }).limit(limit + 2),
      supabase.from('post_reactions').select('created_at, posts(text)').order('created_at', { ascending: false }).limit(limit + 2),
    ]);
    const items = [...(sv ?? []), ...(rc ?? [])]
      .map((r: any) => ({ t: r.posts?.text as string, at: r.created_at as string }))
      .filter((x) => x.t)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    const seen = new Set<string>();
    const out: string[] = [];
    for (const i of items) { if (!seen.has(i.t)) { seen.add(i.t); out.push(i.t); } if (out.length >= limit) break; }
    return out;
  } catch {
    return [];
  }
}

export async function setReaction(postId: string, on: boolean): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return;
  if (on) await supabase.from('post_reactions').upsert({ post_id: postId, user_id: uid });
  else await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', uid);
}

export async function setSaved(postId: string, on: boolean): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return;
  if (on) await supabase.from('post_saves').upsert({ post_id: postId, user_id: uid });
  else await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', uid);
}
