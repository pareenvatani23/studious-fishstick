# TrueShift

**Your daily reset for a steadier mind.**

> Pause. Name the story. Choose a steadier response. Take one small action.

TrueShift is a privacy-first, **CBT-informed** self-reflection app built in React
Native + Expo. It is **not** therapy, not a medical device, and not a crisis
service.

It centres on a short daily **Reset** — name what you're feeling, get a gentle
research-backed reframe, take one small action — plus a curated CBT lesson
library, a weekly insights PDF, and an anonymous, AI-gated community of
one-a-day affirmations.

> **Note:** earlier versions of this app were local-only with no backend. That is
> **no longer true.** TrueShift now runs on Supabase (auth, Postgres, edge
> functions, cron) with AI features via OpenAI, and ships over-the-air via EAS
> Update. For anything architectural, trust the code and the docs below — not
> older prose.

---

## Documentation map

Deep detail lives in [`CLAUDE.md`](./CLAUDE.md) + [`docs/`](./docs) (kept short
and task-scoped so you load only what you need):

| Topic | File |
|---|---|
| What the app is / product rules / safety guardrails | [`docs/CONCEPT.md`](./docs/CONCEPT.md) |
| Features and which files own them | [`docs/FEATURES.md`](./docs/FEATURES.md) |
| Supabase, edge functions, cron, deploy, OTA, scale, secrets | [`docs/INFRA.md`](./docs/INFRA.md) |
| Known bugs / gotchas / "don't do this again" | [`docs/BUGS.md`](./docs/BUGS.md) |
| Verification & testing strategy | [`docs/TESTS.md`](./docs/TESTS.md) |
| AI evaluation (quality gate, moderation, reframe safety) | [`docs/EVALS.md`](./docs/EVALS.md) |

---

## Run it

```bash
npm install
npx expo start          # press a (Android) / i (iOS), or scan with a dev build
```

Requires the Expo SDK 51 toolchain (RN 0.74, React 18). Client env vars live in
`.env` (see `.env.example`) — only the anon/RLS-safe `EXPO_PUBLIC_SUPABASE_*`
keys ship in the bundle; all AI provider keys stay server-side in edge functions.

**Before shipping any change** (the non-negotiable gate — see `docs/TESTS.md`):

```bash
npm run typecheck                                     # tsc --noEmit
npx expo export --platform android --output-dir /tmp/x   # bundle sanity
```

Then commit → push `main` → OTA (`eas update --branch preview`) → rebuild an APK
**only if** native modules or `app.json`/config changed.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (SDK 51) |
| Navigation | `@react-navigation` native-stack + bottom-tabs (6 tabs, BlurView bar) |
| Backend | **Supabase** — Postgres + RLS, Edge Functions (Deno), Storage, Auth, pg_cron |
| AI | **OpenAI** — `gpt-4o-mini` (reframe/lessons/quality), moderation, `tts-1` voice |
| Delivery | EAS Update (OTA, `preview` channel) + periodic Android APK builds |
| Voice | OpenAI TTS, cached in Storage, played on tap |
| Icons / mark | `react-native-svg` (custom line-icon set + "settling tide" mark) |

---

## Project structure

```
App.tsx                providers: SafeArea → Auth → AppState → Theme → Lessons → ResetFlow → Nav
src/
  ai/          openai.ts (types + prompts), edge.ts (calls edge functions)
  components/  primitives — AppText · Button · Screen · SelectableCard · icons · AnimatedSplash …
  data/        static clinical content (feelings · situations · lessons) — see CONTENT_STUBS.md
  navigation/  RootNavigator (onboarding + auth gate) · TabNavigator (6 tabs) · types · hooks
  notifications/ push registration · reminder sync · deep-link routing
  screens/     auth · onboarding · home · reset · explore · progress · profile · community · tools
  store/       AppState · ResetFlow · Lessons (Context providers, DB-backed)
  supabase/    client · auth · sync · community
  theme/       tokens · themes (6) · ThemeContext
supabase/
  functions/   ai · community-post · daily-nudge · generate-lesson · rank-lessons · tts · weekly-report
  schema*.sql  v1 → v5 (apply in order; v5 = community)
```

## The daily Reset

The product is built around one repeatable loop — the app does the formulation,
the user just taps and reads:

1. **Name it** — how heavy it feels + up to 3 feelings + up to 2 situations.
2. **Reframe** — an AI-generated, gentle, research-backed cognitive reframe (the
   "core"), history- and adherence-aware, optionally offering ONE tool
   (breathing / grounding / journal). Narrated on tap.
3. **Act & close** — one small action, then a supportive peak-end close
   ("You did it" — animated, rotating messages). No score, no shame.

See [`docs/CONCEPT.md`](./docs/CONCEPT.md) for the clinical rationale and the
non-negotiable safety guardrails (crisis handling, ≤2 notifications/day,
anonymity).

## Beyond the Reset

- **Explore** — CBT lesson library; lessons are AI-generated daily (cron) and
  personalized in sort order.
- **Progress / Insights** — consistency, thought/keyword mapping, "what
  resonated with you" from community, and a downloadable **weekly PDF**.
- **Community ("Daily Drop")** — post ONE affirmation a day; anonymous;
  AI-moderated + quality-gated; a finite hero + ~12 ranked feed (never endless);
  "This helped me" + Save.

## Themes & accessibility

Six switchable themes in `src/theme/themes.ts` (Calm Dark default, Warm Sand,
Soft Light, + Low-Stim / High-Contrast / Warm Night), selectable at first run or
from Profile. No component hard-codes a hex — all read `useTheme().theme.colors`.
Accessibility: ≥44px targets, selected = border + ✓ (never colour alone),
in-app + OS text scaling, Reduce Motion honoured, read-aloud on text-heavy
screens, high-contrast theme, explicit `accessibilityLabel`/`Role`.

---

## ⚠ Content is draft, pending clinician review

The clinical copy in `src/data/*` is written to CBT guardrails so the UX is
testable, but is **not clinician-vetted**. Lesson summaries and legal text are
likewise placeholders. See [`CONTENT_STUBS.md`](./CONTENT_STUBS.md).
