# Content stubs — supply real copy before release

This is a mental-health app. The simplified "Reset" flow needs real copy to be
*testable*, so `src/data/situations.ts` contains **plausible DRAFT copy** written
to clinical guardrails — but it is **not clinician-vetted**. Every entry is
`copyFinal: false`. A CBT clinician must review/replace it before release.

## Clinical guardrails already encoded (keep these when editing)
- **Validate before reframing.** Each situation leads with a `validate` line. Never skip it; never use toxic positivity.
- **Reframe = hypothesis, not verdict.** Each `reframe` opens with "Another way to look at it…" and is **editable in-app** ("Put it in my own words"). Never assert it as "the truth".
- **Actions = implementation intentions.** Each action is a concrete when/where step (Gollwitzer), not vague advice.
- **Severity routing.** The Situation screen surfaces crisis support when heaviness ≥ 4; crisis resources stay one tap away. The app states it isn't therapy.

## `src/data/situations.ts` — DRAFT, needs clinician review
Each of the 7 situations needs its `validate` / `reframe` / `actions` reviewed:
`unanswered`, `avoiding`, `snapped`, `compared`, `overwhelmed`, `cantSwitchOff`, `somethingElse`. Set `copyFinal: true` per item once approved.

## `src/data/lessons.ts` — Explore library (unchanged, still stubbed)
- `namingTheStory` summary + action prompt = verbatim from the design (final).
- `firstShift`, `approvalTrap`, `twoMinuteStart` summaries/prompts = placeholders.
- **No video media bundled** — `videoUri: null`, player shows a placeholder.

## Legal / settings placeholders
- `src/screens/profile/InfoScreen.tsx` — **Terms** & **Privacy Policy** are boilerplate; **reminder settings** not implemented (noted in About).

## Design defaults chosen where unspecified
- **Flow** = 3 taps: situation (+ optional heaviness) → support (validate + reframe + one action) → "how'd it go".
- **Removed from the original brief** (clinically the weakest + worst for retention): the 10 abstract "pulls", the virtue/"steadier response" step, the 4-field journaling, and the Easy/Full mode split. Rationale + citations are in the chat history / commit messages.
- **Progress counts:** "Steps taken" = resets with outcome `done`; streak = consecutive days with ≥1 reset (1-day grace). No shame framing.
- **Read-aloud scope** = the screen's validate + reframe + action text.
