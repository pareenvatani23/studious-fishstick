-- TrueShift — Supabase schema
-- Run this in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).

-- ── Profiles ───────────────────────────────────────────────────────────────
-- One row per auth user. Name/DOB collected in-app; avatar optional (Google later).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  dob         date,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Resets ─────────────────────────────────────────────────────────────────
-- Each saved "reset". Mirrors the local ResetRecord shape.
create table if not exists public.resets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  -- client-generated id so local records map 1:1 to cloud rows (offline-first)
  client_id        text,
  occurred_at      timestamptz not null default now(),
  heaviness        int,
  emotion          text,
  situation_id     text,
  custom_situation text,
  note             text,
  reframe          text,
  action_text      text,
  keywords         text[],
  distortion       text,
  outcome          text,
  created_at       timestamptz not null default now()
);

create index if not exists resets_user_id_idx on public.resets (user_id, occurred_at desc);
-- one cloud row per (user, client_id) so re-syncing the same local record upserts
create unique index if not exists resets_user_client_uidx
  on public.resets (user_id, client_id) where client_id is not null;

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.resets   enable row level security;

-- profiles: a user can see/edit only their own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- resets: a user can see/insert/update/delete only their own rows
drop policy if exists "resets_select_own" on public.resets;
create policy "resets_select_own" on public.resets
  for select using (auth.uid() = user_id);
drop policy if exists "resets_insert_own" on public.resets;
create policy "resets_insert_own" on public.resets
  for insert with check (auth.uid() = user_id);
drop policy if exists "resets_update_own" on public.resets;
create policy "resets_update_own" on public.resets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "resets_delete_own" on public.resets;
create policy "resets_delete_own" on public.resets
  for delete using (auth.uid() = user_id);

-- ── Auto-create a profile row when a user signs up ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
