-- TrueShift schema v4 — multi feelings/situations + interactive tools.
-- Idempotent. Existing single columns (emotion, situation_id, custom_situation)
-- are kept as the "primary" value for backward compatibility with charts.

alter table public.resets
  add column if not exists emotions   text[],   -- up to 3 named feelings
  add column if not exists situations text[],   -- up to 2 situation labels
  add column if not exists tools_used jsonb not null default '[]'::jsonb; -- [{tool,seconds,completed,at}]

-- Standalone tool sessions (breathing/grounding/journal used outside a reset).
create table if not exists public.tool_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  reset_client_id text,            -- optional link to a reset (client id)
  tool       text not null,        -- 'breathing' | 'grounding' | 'journal'
  variant    text,                 -- e.g. 'box' | '478' | 'paced'
  seconds    int,
  completed  boolean not null default true,
  payload    jsonb,                -- e.g. journal text (private)
  created_at timestamptz not null default now()
);
create index if not exists tool_events_user_created_idx on public.tool_events (user_id, created_at desc);

alter table public.tool_events enable row level security;
drop policy if exists "tool_events_select_own" on public.tool_events;
create policy "tool_events_select_own" on public.tool_events for select using (auth.uid() = user_id);
drop policy if exists "tool_events_insert_own" on public.tool_events;
create policy "tool_events_insert_own" on public.tool_events for insert with check (auth.uid() = user_id);
drop policy if exists "tool_events_delete_own" on public.tool_events;
create policy "tool_events_delete_own" on public.tool_events for delete using (auth.uid() = user_id);
