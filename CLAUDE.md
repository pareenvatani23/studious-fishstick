# CLAUDE.md — TrueShift

> **TrueShift** — "Your daily reset for a steadier mind." A privacy-first,
> CBT-**informed** (not therapy, not a medical device, not crisis care)
> mobile app: React Native + Expo SDK 51 + Supabase, shipped via EAS Update
> (OTA) and periodic Android APK builds.

This file is the **map**, not the territory. It is loaded into every session,
so it is kept short. Deep detail lives in `docs/` — **read the one file that
matches your task**, don't load everything:

| If your task is about… | Read |
|---|---|
| What the app is / the product rules / safety guardrails | `docs/CONCEPT.md` |
| What features exist and which files own them | `docs/FEATURES.md` |
| Supabase, edge functions, cron, deploy, OTA, scale, secrets | `docs/INFRA.md` |
| Past bugs, gotchas, "don't do this again" | `docs/BUGS.md` |
| How we verify changes / testing strategy / CI | `docs/TESTS.md` |
| How we evaluate the AI (quality gate, moderation, reframe) | `docs/EVALS.md` |

## Ground rules for anyone (human or AI) touching this repo

1. **Verify before you claim.** This codebase has a backend, cron, and edge
   functions — do not assume behaviour from the README (it still says
   "local-only, no backend"; that is **stale**). Read the actual file. If you
   state that something works, you must have run it or read the code path.
2. **Never invent APIs, env vars, table names, or edge-function names.** The
   authoritative lists are in `docs/INFRA.md` and `docs/FEATURES.md`. If it's
   not there, grep for it — don't guess.
3. **Secrets never enter the repo.** The Supabase PAT and cron secret live in
   the session scratchpad (`deployfn.py`, `cron_secret.txt`), **not** in git.
   `EXPO_PUBLIC_*` client keys are the only keys in the bundle and are anon/RLS-safe.
4. **Native modules must be loaded defensively.** OTA updates reach older
   binaries that may lack a native module. Guard `require()` in try/catch
   (see `App.tsx` / `AnimatedSplash.tsx` for `expo-splash-screen`). A bare
   `import` of a native module can crash the OTA. See `docs/BUGS.md`.
5. **Before shipping any change:** `npm run typecheck` **and**
   `npx expo export --platform android` must both pass. Then commit → push
   `main` → OTA → (rebuild only if native/config changed). See `docs/TESTS.md`.
6. **Ship to `main`.** Work is committed to `main` and delivered OTA on the
   `preview` channel. `main` is the source of truth.
7. **Respect the ≤2 notifications/day cap** and the anonymity/crisis rules in
   `docs/CONCEPT.md` — these are product-safety invariants, not preferences.

## One-liners you'll reach for

```bash
npm run typecheck                                   # tsc --noEmit
npx expo export --platform android --output-dir /tmp/x   # bundle sanity
export EXPO_TOKEN="$(cat <scratchpad>/.expo_token)" # auth for eas (token is in scratchpad)
npx eas-cli update --branch preview -m "…"          # OTA (reaches current build)
npx eas-cli build -p android --profile preview --no-wait   # new APK (native/config changes)
python3 <scratchpad>/deployfn.py deploy <slug>      # deploy a Supabase edge function
```

## Layout at a glance

```
App.tsx                providers: SafeArea→Auth→AppState→Theme→Lessons→ResetFlow→Nav
src/
  ai/        openai.ts (types+prompts), edge.ts (calls edge fns)
  components/ primitives (AppText, Button, Screen, SelectableCard, icons, splash…)
  data/      static clinical content (feelings, situations, lessons) — see CONTENT_STUBS.md
  navigation/ RootNavigator + TabNavigator (6 tabs) + types
  notifications/ push registration, reminder sync, deep-link routing
  screens/   auth, onboarding, home, reset, explore, progress, profile, community, tools
  store/     AppState, ResetFlow, Lessons (context providers, DB-backed)
  supabase/  client, auth, sync, community
  theme/     tokens, themes (6), ThemeContext
supabase/
  functions/ ai, community-post, daily-nudge, generate-lesson, rank-lessons, tts, weekly-report
  schema*.sql  v1→v5 (apply in order; v5 = community)
```
