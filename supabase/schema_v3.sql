-- TrueShift schema v3 — weekly report storage + smart-notification planner.
-- Idempotent.

-- ── Reports metadata (PDF lives in Storage) ──────────────────────────────────
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  period_start date,
  period_end   date,
  path         text not null,      -- storage object path: <uid>/<file>.pdf
  summary      text,
  created_at   timestamptz not null default now()
);
create index if not exists reports_user_created_idx on public.reports (user_id, created_at desc);

alter table public.reports enable row level security;
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports for select using (auth.uid() = user_id);
-- writes happen via the service role (edge functions), which bypasses RLS.

-- ── Notification planner state on profiles ───────────────────────────────────
alter table public.profiles
  add column if not exists plan_date          date,
  add column if not exists plan               jsonb,
  add column if not exists last_lesson_push_on date;

-- ── Storage bucket policies (bucket created via API) ─────────────────────────
-- Users can read only their own report objects (folder == their uid). Uploads
-- are done by the service role, which bypasses RLS.
drop policy if exists "reports_objects_read_own" on storage.objects;
create policy "reports_objects_read_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);
