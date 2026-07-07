# BUGS — gotchas & past fixes ("don't do this again")

The point of this file: **stop future sessions from re-introducing bugs we
already fixed, or acting on wrong assumptions.** If you hit something surprising,
add it here with the fix.

## Standing gotchas (still true — respect these)

- **Native module in an OTA will crash old builds.** OTA (`eas update`) reaches
  binaries that may not contain a native module you just added (e.g.
  `expo-splash-screen`). A top-level `import * as X from 'native-mod'` throws at
  load → white-screen crash on the current build.
  **Fix pattern:** load defensively —
  `let X:any=null; try{ X=require('native-mod'); }catch{}` and call `X?.foo?.()`.
  Applied in `App.tsx` and `src/components/AnimatedSplash.tsx`.

- **The README is stale.** It says "local-only, no backend, no network." That is
  no longer true (Supabase + edge functions + cron + community). Trust the code
  and `docs/INFRA.md`, not the README prose.

- **PostgREST bulk insert 400.** A bulk insert requires **uniform keys across all
  rows**. Rows with differing key sets → 400. Make every row have identical keys.

- **SQL literals with apostrophes → 400.** JSON/text containing `'` breaks SQL
  string literals in Management-API `database/query` calls.
  **Fix:** dollar-quote (`$q$ … $q$`).

- **Cloudflare 403 / error 1010 on Management API.** Requests without a browser
  `User-Agent` are blocked. Send `User-Agent: Mozilla/5.0 …` (baked into
  `deployfn.py`).

- **EXPO_TOKEN is required for `eas` and is not in the container env.** It was
  provided earlier and is recoverable from the session transcript; it is saved to
  scratchpad `.expo_token`. `export EXPO_TOKEN="$(cat <scratchpad>/.expo_token)"`
  before any `eas` command. `eas whoami` → `claude (robot)` /
  `studious-fishsticks-team` confirms auth.

- **Notifications must stay ≤2/day.** Any new push source must be routed through
  the `daily-nudge` planner's budget, not added as an independent send. The
  community invite already *counts toward* the cap.

- **Community personalization must be clinically gated.** Resonated posts feed
  Insights/PDF/reset only "if it makes sense" — never force, never quote a user's
  saved post verbatim back at them. The `ai` prompt enforces this; keep it.

- **`weekly-report` debug field is `pdfBase64`, not `pdfBytes`.** Test scripts
  that reference `pdfBytes` KeyError even though the PDF wrote fine.

## Fixed-and-shipped (history, for context)
- ElevenLabs was ~85% of variable cost → switched TTS to OpenAI `tts-1`/`nova`
  with Storage cache + play-on-tap.
- `daily-nudge` was O(all users) → O(due users) with due-filter + bounded
  concurrency + batched push.
- Weekly PDF overflowed/misaligned → paginated with an `ensure(h)` helper.
- First-launch black flicker between native splash and app → hold native splash
  until `AnimatedSplash` paints, then fade out.
- Black adaptive icon → teal `#74C7B8` background (app.json).

## When you fix a new bug
Append: **symptom → root cause → the exact fix → file(s)**. One entry, terse.
