# TrueShift

**Your daily reset for a steadier mind.**

> Pause. Name the story. Choose a steadier response. Take one small action.

TrueShift is a privacy-first, CBT-informed self-reflection app, built in React
Native + Expo from the attached design system (`TrueShift.dc.html`). It is
**not** therapy, not a medical device, and not a crisis service. Local-only MVP:
no account, no network, no ads, no social feed.

It keeps the design system's 5-theme token system, component primitives,
navigation shell, onboarding, Explore, Progress, Profile/settings, theme picker,
crisis resources, delete-data and empty states — but the daily experience has
been simplified to a clinically-grounded **3-tap Reset** (see below).

---

## Run it

```bash
npm install
npx expo start          # press i (iOS) / a (Android), or scan with Expo Go
```

- Typecheck: `npm run typecheck`
- Bundle check: `npx expo export --platform ios`

Requires the Expo SDK 51 toolchain (RN 0.74, React 18). No backend to run.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (SDK 51) |
| Navigation | `@react-navigation` native-stack + bottom-tabs (BlurView tab bar) |
| Gradients | `expo-linear-gradient` |
| Read-aloud | `expo-speech` |
| Storage | `@react-native-async-storage/async-storage` (local-only) |
| Icons / mark | `react-native-svg` (custom line-icon set + "settling tide" mark) |

No backend, no account, no network calls in MVP.

---

## Project structure

```
App.tsx                      Providers: SafeArea → Theme → AppState → ShiftFlow → Navigation
src/
  theme/
    tokens.ts                spacing 4·8·12·16·20·24·32 · radius 8·12·16·20·24·full · type scale · text-size steps
    themes.ts                the 5 themes (Calm Dark default, Low Stimulation, Warm Night, High Contrast, Soft Light)
    ThemeContext.tsx         Context provider that swaps the token object + text size + reduce motion + read-aloud
  data/                      ⚠ stubbed clinical content (see CONTENT_STUBS.md)
    pulls · feelings · responses · actions · reframes · lessons · emotions
  store/
    AppState.tsx             onboarding, reset history, derived stats (AsyncStorage)
    ResetFlow.tsx            in-progress "draft" reset for the daily loop
  components/                Button · Chip · Input · SelectableCard · VideoLessonCard · ProgressBar ·
                             Screen/Card · Header · Settings · EmptyState · ReadAloud · AppText · WaveMark · icons
  navigation/               RootNavigator (onboarding gate) · TabNavigator · types · hooks
  screens/
    onboarding/  Splash · Welcome · How it works · Text size · Read aloud · Privacy · Ready
    home/        Home (one clear action)
    reset/       StartReset (Reset tab) · Situation · Support · Done   ← the 3-tap loop
    explore/     Explore · Video Lesson
    progress/    Progress
    profile/     Profile · Theme Picker · Crisis · Info (about/terms/privacy) · Delete Data
```

## The daily Reset (3 taps)

The product is built around one simple, repeatable loop. Plain words, no
framework to learn — the app does the formulation, the user just taps and reads:

1. **Situation** — "What happened?" → pick a concrete everyday situation
   (+ an optional "how heavy does it feel?" check that gently surfaces support
   when high).
2. **Support** — one screen, in clinically-safe order: **validate first** → a
   reframe shown as *"another way to look at it"* (editable) → **one small step**
   (a concrete implementation intention, swappable). Optional "add the thought".
3. **Done** — "How'd it go?" → *I did it / Not yet*. No score, no shame.

> Earlier abstract machinery from the original brief — the 10 "emotional pulls",
> the virtue/"steadier response" step, multi-field journaling, and the Easy/Full
> split — was removed after a clinical + UX review: it was the weakest part both
> for evidence-fidelity (real CBT anchors on a *specific situation*, not trait
> self-labels) and for retention. See `CONTENT_STUBS.md` and commit history.

## Themes

Five switchable themes live in `src/theme/themes.ts`, each a complete
`ThemeColors` token object. `ThemeProvider` swaps the active object; **no
component hard-codes a hex** — they read `useTheme().theme.colors`. Teal =
action, lavender = reflection. No pure black/white. Accent tints are
derived at runtime via `tint(hex, alpha)`.

## Accessibility

- ≥44px tap targets; CTAs 56–60px.
- Selected state is **border + ✓**, never colour alone (chips, cards, toggles).
- In-app text size (Normal / Large / Largest) **and** OS Dynamic Type
  (`allowFontScaling`) both scale text via `AppText`.
- Reduce Motion honoured (splash glow, start-shift pulse).
- Read-aloud (`expo-speech`) on text-heavy screens + onboarding.
- High-contrast theme available; contrast targets ≥4.5:1.
- Buttons/cards carry explicit `accessibilityLabel` / `accessibilityRole`.

## React Native implementation notes

- `SafeAreaView` + 20px horizontal padding via the `Screen` shell; bottom CTAs
  respect the home-indicator inset; inputs are keyboard-safe (`KeyboardAvoidingView`).
- Gradients via `expo-linear-gradient`; the weekly chart is plain Views (no chart lib).
- Bottom tabs via `@react-navigation/bottom-tabs` with a `BlurView` background.
- Themes via a Context provider swapping a token object; storage is local-only.
- App icon & splash = the "settling tide" mark (`assets/`, generated; see
  `WaveMark`), splash glow honours Reduce Motion.

---

## ⚠ Content is draft, pending clinician review

The situation/validate/reframe/action copy in `src/data/situations.ts` is
**draft** — written to clinical guardrails (validate-first, reframe-as-editable-
hypothesis, implementation-intention actions) so the UX is testable, but **not
clinician-vetted**. Every entry is `copyFinal: false`. Lesson summaries and legal
text are likewise placeholders. **See [`CONTENT_STUBS.md`](./CONTENT_STUBS.md).**
