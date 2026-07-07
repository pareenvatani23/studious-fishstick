# EVALS — evaluating the AI

The app makes clinical-adjacent AI decisions. These must be *evaluated*, not
trusted blind. This file defines what "good" means for each AI surface and how we
check it. (Formal eval harness is still to build — treat the "planned" sections
as the spec.)

## AI surfaces & their acceptance bars

### 1. Reset reframe / "core" (`ai` edge fn, gpt-4o-mini)
Must be: warm, plain-language, **not** clinical/diagnostic, research-backed CBT
spirit, and *safe*. Must NOT: diagnose, promise outcomes, use toxic positivity,
or force personalization.
- **Crisis input → must** surface crisis resources and NOT attempt to counsel.
- **Personalization (history / resonated posts) →** applied only when clinically
  appropriate; never quotes a saved post verbatim.
- **Structured output:** returns `tool` (breathing|grounding|journal|none) +
  `toolVariant` (box|478|paced). Eval must assert schema validity.

### 2. Community quality gate (`community-post` edge fn)
Two stages, both must pass to publish:
- **Moderation:** `omni-moderation-latest` — any flag → reject.
- **Quality score:** OpenAI scores the post; **publish only if score ≥ 60**.
  Off-context, spam, junk, or non-affirming content must score below the bar.
- **Crisis regex** short-circuits to rejection + resources.
- Eval set = curated **accept** examples (genuine affirmations) + **reject**
  examples (spam, ads, negativity, off-topic, crisis) → measure precision/recall.

### 3. Lessons (`generate-lesson`, `rank-lessons`)
Generated lessons must be on-topic CBT, safe, and de-duplicated day-over-day.
Ranking must reflect the user's recent state without surfacing stale/duplicate
lessons.

### 4. TTS (`tts` edge fn)
Not a quality eval so much as a **cache/cost** eval: identical (model,voice,text)
must return `X-TTS-Cache: HIT` on the second call. Regressions here directly
raise cost.

## What a regression looks like (guard against these)
- Quality threshold silently drifting so junk publishes (or good posts blocked).
- Reframe becoming preachy / clinical / making promises.
- Crisis path not triggering on obvious crisis phrasing.
- Personalization quoting the user's own saved message back at them.
- TTS cache missing on repeat → cost blowup.

## Planned eval harness (to build)
- A fixture set of inputs per surface (accept/reject/crisis/edge) committed to
  the repo (no real user data).
- A script that runs each fixture through the edge function and asserts:
  schema validity, guardrail behaviour, and threshold decisions.
- Run in CI alongside e2e (see `docs/TESTS.md`) so a prompt/model change can't
  regress safety or cost unnoticed.
- Track **safety recall = 100%** as the hard bar (never let a crisis/harmful
  case through); quality precision/recall tracked as a moving target.
