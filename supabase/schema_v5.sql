-- TrueShift schema v5 — Community "Daily Drop".
-- Anonymous positive/affirmation posts, AI-gated, 1/day, "This helped me".
-- Idempotent.

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  text          text not null,
  status        text not null default 'published',  -- published | rejected | flagged
  quality_score int not null default 0,
  helped_count  int not null default 0,
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);
create index if not exists posts_feed_idx on public.posts (status, published_at desc);
create index if not exists posts_author_idx on public.posts (user_id, created_at desc);

alter table public.posts enable row level security;
-- Read published posts (anonymous — clients never select user_id), or one's own.
drop policy if exists "posts_select_published_or_own" on public.posts;
create policy "posts_select_published_or_own" on public.posts
  for select using ((auth.role() = 'authenticated' and status = 'published') or auth.uid() = user_id);
-- Inserts happen via the community-post edge function (service role) after the AI
-- gate; no direct client insert/update.

-- ── "This helped me" reactions ───────────────────────────────────────────────
create table if not exists public.post_reactions (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_reactions enable row level security;
drop policy if exists "reactions_select_own" on public.post_reactions;
create policy "reactions_select_own" on public.post_reactions for select using (auth.uid() = user_id);
drop policy if exists "reactions_insert_own" on public.post_reactions;
create policy "reactions_insert_own" on public.post_reactions for insert with check (auth.uid() = user_id);
drop policy if exists "reactions_delete_own" on public.post_reactions;
create policy "reactions_delete_own" on public.post_reactions for delete using (auth.uid() = user_id);

-- keep posts.helped_count in sync
create or replace function public.bump_helped_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set helped_count = helped_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set helped_count = greatest(0, helped_count - 1) where id = old.post_id;
  end if;
  return null;
end; $$;
drop trigger if exists reactions_count_trg on public.post_reactions;
create trigger reactions_count_trg after insert or delete on public.post_reactions
  for each row execute function public.bump_helped_count();

-- ── Saves ────────────────────────────────────────────────────────────────────
create table if not exists public.post_saves (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_saves enable row level security;
drop policy if exists "saves_select_own" on public.post_saves;
create policy "saves_select_own" on public.post_saves for select using (auth.uid() = user_id);
drop policy if exists "saves_insert_own" on public.post_saves;
create policy "saves_insert_own" on public.post_saves for insert with check (auth.uid() = user_id);
drop policy if exists "saves_delete_own" on public.post_saves;
create policy "saves_delete_own" on public.post_saves for delete using (auth.uid() = user_id);

-- one post per day (enforced in the edge function via this column too)
alter table public.profiles add column if not exists last_post_on date;
