# TESTS — how we verify changes

## The non-negotiable gate (run before every ship)
1. `npm run typecheck` — `tsc --noEmit`, strict. Must be clean.
2. `npx expo export --platform android --output-dir /tmp/x` — catches native
   import regressions, broken requires, and bundler errors the typechecker misses.
   **This is what would have caught the splash-screen native-import crash.**

Only after both pass: commit → push `main` → `eas update --branch preview`
→ rebuild APK **only if** native modules or `app.json`/config changed.

## Current verification harness (manual/scripted)
- **Web walk-throughs + screenshots** via Playwright scripts in the session
  scratchpad (`walk*.js`, `vidshot*.js`, screenshots in `shots*/`). These drive
  the app in `expo start --web` and capture each screen. Good for visual/UI
  regressions during development; not yet wired into CI.
- **Edge-function self-tests:** ad-hoc scripts invoke each function with a test
  JWT / cron secret and assert the response shape (e.g. TTS MISS→HIT,
  community-post accept/reject cases, weekly-report `pdfBase64`).

## CI today
- `.github/workflows/ci.yml` runs typecheck and, if `EXPO_TOKEN` secret is set,
  an EAS Update on push. It **warns and skips** the deploy if the secret is
  absent. (Note: the repo secret may differ from the scratchpad token.)

## Planned — e2e UI tests in CI (task 54, "once all done")
Goal (user's words): *write e2e UI tests and run them every build/deploy so we
don't break things on the next deploy.* Intended coverage:
- **Critical flows:** signup → onboarding (theme pick) → full Reset (name →
  reframe → tool → done) → history; Explore lesson play; Community compose
  (accept + reject) + react + save; Progress/Insights + PDF; theme switch.
- **Approach:** Detox or Maestro for RN e2e (Maestro is lighter to wire into CI
  against a preview build); plus keep the typecheck + `expo export` gate.
- **Wire into** `.github/workflows/ci.yml` to run on PR + on the `main` deploy
  path, blocking OTA/build if a critical flow breaks.
- Sequence per the user: **load test → pen test → e2e UI tests in CI**.

## Conventions for new tests
- Prefer testing a **flow** end-to-end over unit-testing a component in isolation
  (this app's risk is broken flows across screens + backend, not pure functions).
- Any new edge function ships with a self-test script that asserts the happy path
  **and** the guardrail path (rejection/crisis/cap).
