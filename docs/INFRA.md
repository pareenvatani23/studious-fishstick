# INFRA — backend, edge functions, cron, deploy, OTA, scale

## Platform
- **Supabase** (project ref `cghwgpqliwwjsuagdtia`): Postgres + PostgREST + RLS,
  Edge Functions (Deno), Storage, Auth (email), pg_cron + pg_net, Realtime.
- **Client:** Expo SDK 51 / RN 0.74 / React 18. `@supabase/supabase-js` with the
  **anon** key (RLS-safe, `EXPO_PUBLIC_SUPABASE_*`). No service key on device.
- **OTA + builds:** EAS Update (channel `preview`) + EAS Build (Android APK).
  `runtimeVersion` policy = `sdkVersion` (OTA only reaches same-SDK binaries).

## Edge functions (`supabase/functions/*`)
| Slug | Trigger | Auth | Purpose |
|---|---|---|---|
| `ai` | client | user JWT (in-fn) | Reset reframe/"core" + narration text (gpt-4o-mini, JSON mode) |
| `tts` | client | user JWT | OpenAI TTS (`tts-1`, voice `nova`) → cached in Storage `tts-cache` by SHA-256(model:voice:text) |
| `community-post` | client | user JWT | moderation + quality gate + 1/day + truncated author label |
| `generate-lesson` | cron | `x-cron-secret` | 24h AI-generated CBT lessons |
| `rank-lessons` | cron/client | mixed | personalized lesson sort |
| `daily-nudge` | cron | `x-cron-secret` | ≤2/day push planner, timezone-correct |
| `weekly-report` | cron | `x-cron-secret` | weekly PDF (pdf-lib), store + notify + email |

**Auth patterns:**
- **User functions** decode the JWT in-function (`isAuthedUser` / `jwtUid`,
  require `role === 'authenticated'`).
- **Cron functions** run `verify_jwt=false` and are gated by an `x-cron-secret`
  header. The secret is a **Supabase secret**, value kept in scratchpad
  `cron_secret.txt` — never in the repo.
- Admin DB writes use the auto-injected `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).

## OpenAI usage (all server-side, via edge functions)
- **Reasoning:** `gpt-4o-mini` (JSON mode) — reframe, lessons, post quality.
- **Moderation:** `omni-moderation-latest`.
- **TTS:** `tts-1`, voice `nova` — **replaced ElevenLabs** (was ~85% of variable
  cost). Audio is **cached** (shared lesson audio) and **played on tap** only.
- Cost posture: variable cost is now dominated by TTS+LLM calls, heavily cut by
  caching + on-demand synthesis. See `docs/CONCEPT.md` for the ≤2/day cap that
  bounds push/AI fan-out.

## Deploying edge functions
Deployed via the **Supabase Management API multipart endpoint** using the
scratchpad helper `deployfn.py`:
```
python3 <scratchpad>/deployfn.py deploy <slug>
```
- Requires `User-Agent: Mozilla/5.0 …` (Cloudflare returns 403/1010 without it).
- PAT (`sbp_…`) lives in `deployfn.py` in scratchpad — **secret, not in git**.
- `verify_jwt` flag is set per function (false for cron, true/in-fn for user).

## SQL / schema
- Apply `supabase/schema.sql` → `schema_v2` → … → **`schema_v5.sql`** in order.
  v5 adds community (`posts`, `post_reactions`, `post_saves`, `bump_helped_count`
  trigger, `profiles.last_post_on`, `posts.author_label`).
- Ad-hoc SQL runs via Management API:
  `POST https://api.supabase.com/v1/projects/{ref}/database/query` (PAT bearer).
- **PostgREST bulk insert requires uniform keys across all rows** (else 400).
- **Dollar-quote (`$q$…$q$`) any SQL literal containing apostrophes.**
  Both gotchas cost us before — see `docs/BUGS.md`.

## cron schedule (pg_cron + pg_net → edge functions with x-cron-secret)
- `generate-lesson` daily; `rank-lessons`; `daily-nudge` (frequent, filters to
  "due" users only); `weekly-report` weekly.

## Scale posture (target 10k users, headroom ~50–100k)
- **Cost-bound, not capacity-bound** after the fixes below.
- `daily-nudge` is O(due users), not O(all users): in-memory "due" filter
  (only users whose local time matches their reminder/lesson window do DB/AI
  work), bounded concurrency (`CONC=8`), batched Expo push (100/req), merged
  per-user PATCH.
- Supabase plan upgrade deferred until ~1000 users (user's call).
- **Load test is pending** (task 54) to prove the above before go-live.

## Client env vars (bundle-inlined, anon-safe)
`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (set in the EAS
`preview` environment). Legacy `EXPO_PUBLIC_OPENAI_API_KEY` /
`EXPO_PUBLIC_ELEVENLABS_*` in `.env.example` are **prototype-only** — real AI
calls now go through edge functions; do not ship provider keys in the client.
