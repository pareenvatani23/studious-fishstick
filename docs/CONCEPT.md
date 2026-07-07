# CONCEPT — What TrueShift is (and is not)

## The one-sentence product
A daily **Reset**: pause, name the story your mind is telling, choose a steadier
response, take one small action — CBT-**informed** self-reflection, delivered
warmly, in under a few minutes a day.

## What it is NOT (hard invariants — do not drift)
- **Not therapy, not a medical device, not a crisis service.** Copy must never
  claim to diagnose, treat, or replace professional care.
- **Not a doomscroll / social network.** No follower counts, no DMs, no endless
  feed. See "Community" below for the deliberately finite design.
- **Not a data-harvesting product.** Privacy-first; minimal PII (name + DOB at
  signup). Community posts are **anonymous** to other users.

## The CBT frame (why the flow is shaped the way it is)
The Reset mirrors a cognitive-behavioural loop, kept to "3 taps":
1. **Name it** — heaviness/intensity + up to 3 feelings + up to 2 situations.
2. **Reframe** — an AI-generated, research-backed, *gentle* cognitive reframe
   (the "core"), history- and adherence-aware, optionally offering ONE tool
   (breathing / grounding / journal).
3. **Act & close** — one small action, then a supportive peak-end close
   ("You did it") — never a score, never pressure.

**Clinical guardrails for AI output** (enforced in `supabase/functions/ai`):
- Warm, plain, non-clinical language; no diagnosis; no toxic positivity.
- Crisis language → surface crisis resources, do **not** attempt to counsel.
- Any personalization (history, resonated community messages) is applied
  **only if clinically appropriate** — never forced, never quoted verbatim.

## Community — the "Daily Drop" concept
The community is **not** one-on-one posting. It is: *anyone can post ONE
beautiful/positive/affirming thought that might help another person.*

Deliberate design so it can never become a doomscroll or a spam channel:
- **Finite feed:** a hero post + ~12 ranked posts, then it *ends* ("come back
  tomorrow"). Never infinite scroll.
- **AI quality gate:** every post is moderated + quality-scored; only genuinely
  helpful, on-context, non-spam posts publish (threshold in `docs/EVALS.md`).
- **1 post per user per day.**
- **Anonymous:** authors shown as a truncated first name (e.g. "Sar…") or
  "A friend" — never full identity.
- **"This helped me"** is the only reaction (plus private Save). No likes race,
  no comments.
- **Resonance loop:** what a user saves/reacts to can (clinically-gated) inform
  their Insights, weekly PDF, and future reset reframes.

## Notification philosophy (hard cap)
**≤ 2 pushes per user per day**, timezone-correct, and only when useful:
- Daily nudge (if no reset yet), or a new-lesson / community invite in the
  midday slot (community takes priority if the user hasn't posted today).
- Weekly insights PDF notification.
Never spam. The planner in `daily-nudge` enforces the cap — see `docs/INFRA.md`.

## Tone & copy rules
Second person, warm, brief, lower-case-friendly, emoji sparingly. Every "failure"
path (skipped, "not yet") is reframed as still-okay. This tone is a product
feature — keep it consistent across screens, notifications, and AI prompts.
