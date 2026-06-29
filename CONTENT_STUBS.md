# Content stubs — supply real copy before release

This is a mental-health app. Per the brief, **no clinical/therapeutic copy was
invented**. Where the design showed one example it is reproduced verbatim and
marked `copyFinal: true`; everything else is a clearly-marked placeholder
(`copyFinal: false`, text contains `[PLACEHOLDER …]`). The UI never presents a
placeholder as real guidance — e.g. the Reframe screen shows a "coming soon"
state and invites the user to write their own when no final reframe exists.

Replace the items below with reviewed content (clinician-authored where noted).

## `src/data/reframes.ts` — balanced reframes  ⚠ clinician-authored
| Pull | Status |
|---|---|
| `approval` | ✅ final (verbatim from design) |
| `fear`, `comparison`, `avoidance`, `peoplePleasing`, `perfectionism`, `selfDoubt`, `control`, `numbness`, `proving` | ❌ placeholder |
| `default` (Easy mode / no pull) | ❌ placeholder |

## `src/data/actions.ts` — small actions
| Action | Status |
|---|---|
| `delayChecking`, `twoMinuteStart`, `sendHonestMessage` | ✅ final (verbatim from design) |
| `privateWin`, `walkFirst`, `closeLoop`, `sayNo`, `balancedThought` | ❌ placeholder descriptions (titles from brief) |

> Also review every action's `relatedResponse` mapping — placeholder mappings are guesses.

## `src/data/pulls.ts` — emotional-pull sublines
| Pull | Status |
|---|---|
| `approval`, `fear`, `comparison`, `avoidance`, `peoplePleasing` | ✅ final (verbatim from design) |
| `perfectionism`, `selfDoubt`, `control`, `numbness`, `proving` | ❌ placeholder descriptions (labels from brief) |

## `src/data/lessons.ts` — Explore library
| Lesson | Status |
|---|---|
| `namingTheStory` (summary + action prompt) | ✅ final (verbatim from design) |
| `firstShift`, `approvalTrap`, `twoMinuteStart` (summaries + action prompts) | ❌ placeholder |
| **All video media** | ❌ none bundled — `videoUri: null`, player shows a placeholder |

## Other placeholders
- `src/screens/profile/InfoScreen.tsx` — **Terms** and **Privacy Policy** are boilerplate placeholders; **reminder settings** are not implemented (noted in About).
- `src/data/feelings.ts`, `src/data/responses.ts`, `src/data/emotions.ts` — labels only (value/emotion words from the brief), no therapeutic prose, safe as-is.

## `// TODO:` defaults chosen where behaviour was unspecified
- **Easy loop** = feeling → reframe → action → proof (skips pull/journaling/response).
- **Progress counts**: "Actions done" = shifts with outcome `done`; streak counts consecutive days with ≥1 shift (1-day grace).
- **Read-aloud scope** = the screen's heading + key body/guidance text.
- **Recommended lesson** on Full Home = `lessons[1]`.
