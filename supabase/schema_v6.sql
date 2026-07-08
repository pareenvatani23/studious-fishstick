-- TrueShift schema v6 — community polish.
-- 1) Formalize posts.author_label (was added ad-hoc in prod).
-- 2) Allow system/seed posts (user_id null) so the feed feels alive from day one.
-- 3) Relabel any legacy 'A friend'/truncated labels to a real-feeling handle
--    derived from the profile name (e.g. "Pareen Vatani" -> "Parvat").
-- 4) Seed a small set of genuinely uplifting posts with realistic joined handles.
-- Idempotent — safe to re-run.

alter table public.posts add column if not exists author_label text;
alter table public.posts alter column user_id drop not null;

-- Handle = Cap(first 3 of first name) + lower(first 3 of last name); single name -> first 6.
update public.posts p
set author_label = (
  case when position(' ' in btrim(pr.name)) > 0
    then upper(substr(split_part(btrim(pr.name), ' ', 1), 1, 1))
         || lower(substr(split_part(btrim(pr.name), ' ', 1), 2, 2))
         || lower(substr(split_part(btrim(pr.name), ' ', -1), 1, 3))
    else upper(substr(btrim(pr.name), 1, 1)) || lower(substr(btrim(pr.name), 2, 5))
  end)
from public.profiles pr
where p.user_id = pr.id
  and pr.name is not null and btrim(pr.name) <> '' and lower(btrim(pr.name)) <> 'there'
  and (p.author_label is null or p.author_label in ('A friend', 'Friend') or p.author_label like '%…');

-- Seed system posts (user_id null). Only inserts rows that don't already exist.
insert into public.posts (user_id, text, status, quality_score, helped_count, author_label, created_at, published_at)
select null, v.text, 'published', v.q, v.helped, v.label,
       now() - (v.age * interval '1 hour'), now() - (v.age * interval '1 hour')
from (values
  ('You are allowed to take up space. Your voice matters, even when it shakes.', 92, 9, 'Emmwil', 5),
  ('Whatever today asked of you, you showed up. That is quietly brave.', 90, 7, 'Liache', 14),
  ('The hardest part is often just beginning. You have already done harder things.', 89, 6, 'Sarpat', 22),
  ('Rest is not falling behind. A softer mind sees clearer roads.', 91, 8, 'Noakim', 30),
  ('You do not have to earn kindness from yourself. It is already yours.', 93, 11, 'Ariddas', 41),
  ('One steady breath is a small act of hope. Take one now, just for you.', 88, 5, 'Jonber', 53),
  ('Your worth is not a number, a job, or a good day. It simply is.', 90, 8, 'Miator', 66),
  ('Progress can be quiet. Sometimes it just looks like trying again.', 89, 6, 'Kofmen', 78),
  ('Be as gentle with yourself as you would be with a good friend today.', 92, 10, 'Ivynak', 92),
  ('The story in your head is not the whole truth. You are still writing it.', 90, 7, 'Rubdia', 110),
  ('You have survived every hard day so far. That is a perfect record.', 91, 9, 'Lenvog', 132),
  ('Small and honest beats big and forced. Do the next kind thing.', 87, 4, 'Thepar', 156),
  ('Feelings are visitors, not residents. This heavy one will move on too.', 90, 7, 'Ninroy', 180),
  ('You are not behind. You are exactly where your own path has room for you.', 92, 8, 'Samoka', 205)
) as v(text, q, helped, label, age)
where not exists (
  select 1 from public.posts p2 where p2.user_id is null and p2.text = v.text
);
