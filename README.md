# TrueShift

**Your daily reset for a steadier mind.**

> Pause. Name the story. Choose a steadier response. Take one small action.

TrueShift is a privacy-first, CBT-informed self-reflection app, built in React
Native + Expo from the attached design system (`TrueShift.dc.html`). It is
**not** therapy, not a medical device, and not a crisis service. Local-only MVP:
no account, no network, no ads, no social feed.

This repo implements the design pixel-faithfully: the 5-theme token system, the
reusable component primitives, the navigation shell, the onboarding flow, the
daily Shift loop, Explore, Progress, Profile/settings, theme picker, crisis
resources, delete-data, and the empty / first-run states.

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
    AppState.tsx             onboarding, Easy/Full mode, shift history, derived stats (AsyncStorage)
    ShiftFlow.tsx            in-progress "draft" shift for the daily loop
  components/                Button · Chip · Input · SelectableCard · VideoLessonCard · ProgressBar ·
                             Screen/Card · Header · Settings · EmptyState · ReadAloud · AppText · WaveMark · icons
  navigation/               RootNavigator (onboarding gate) · TabNavigator · types · hooks
  screens/
    onboarding/  01–07 + Pattern Selection
    home/        Easy Home (08) + Home Full (10)
    shift/       Start Shift (11) · Easy Feeling (09) · Emotional Pull (12) · Name the Story (13) ·
                 Reframe (14) · Steadier Response (15) · Action Selection (16) · Proof Collected (17)
    explore/     Explore (18) · Video Lesson (19)
    progress/    Progress (20)
    profile/     Profile (21) · Theme Picker (22) · Crisis (23) · Info (about/terms/privacy) · Delete Data (24)
```

### Design screen → implementation map (all 24)

| # | Design | File |
|---|---|---|
| 01 | Splash | `onboarding/SplashScreen` |
| 02 | Welcome | `onboarding/WelcomeScreen` |
| 03 | How it works | `onboarding/HowItWorksScreen` |
| 04 | Text size | `onboarding/TextSizeScreen` |
| 05 | Read aloud | `onboarding/ReadAloudScreen` |
| 06 | Safety & Privacy | `onboarding/PrivacyScreen` |
| 07 | Ready | `onboarding/ReadyScreen` |
| 08 | Easy Home | `home/HomeScreen` (Easy branch) |
| 09 | Easy Shift step | `shift/EasyFeelingScreen` |
| 10 | Home (Full) | `home/HomeScreen` (Full branch) |
| 11 | Start Shift | `shift/StartShiftScreen` (also the Shift tab) |
| 12 | Emotional Pull | `shift/EmotionalPullScreen` |
| 13 | Name the Story | `shift/NameStoryScreen` |
| 14 | Reframe | `shift/ReframeScreen` |
| 15 | Steadier Response | `shift/SteadierResponseScreen` |
| 16 | Choose Small Action | `shift/ActionSelectionScreen` |
| 17 | Proof Collected | `shift/ProofCollectedScreen` |
| 18 | Explore Library | `explore/ExploreScreen` |
| 19 | Video Lesson Detail | `explore/VideoLessonScreen` |
| 20 | Progress | `progress/ProgressScreen` |
| 21 | Profile / Settings | `profile/ProfileScreen` |
| 22 | Display & Comfort (themes) | `profile/ThemePickerScreen` |
| 23 | Crisis Resources | `profile/CrisisResourcesScreen` |
| 24 | Delete Data | `profile/DeleteDataScreen` |
| + | Pattern Selection | `onboarding/PatternSelectionScreen` |

---

## Themes

Five switchable themes live in `src/theme/themes.ts`, each a complete
`ThemeColors` token object. `ThemeProvider` swaps the active object; **no
component hard-codes a hex** — they read `useTheme().theme.colors`. Teal =
shift/action, lavender = reflection. No pure black/white. Accent tints are
derived at runtime via `tint(hex, alpha)`.

## Easy vs Full mode

Easy mode is the **default**; Full mode is opt-in from Profile (which routes
through Pattern Selection). Same loop, more depth:

- **Easy:** Start → tap a feeling → reframe → pick one small action → done.
- **Full:** Start → emotional pull → name the story → reframe (with detected
  CBT pattern chips) → steadier response → small action → proof.

## Accessibility

- ≥44px tap targets; CTAs 56px (Full) / 64px (Easy).
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

## ⚠ Content is stubbed

No clinical copy was invented. Reframes, action descriptions, lesson
summaries, and legal text are placeholders pending real (clinician-reviewed)
content. **See [`CONTENT_STUBS.md`](./CONTENT_STUBS.md)** for the full list.
