# FEATURES — inventory & file ownership

Each feature maps to the files that own it. When changing a feature, start here
so you touch the right files and don't recreate logic that already exists.

## Onboarding & auth
- **Sign up / sign in** (email; name + DOB): `src/screens/auth/SignUpScreen.tsx`,
  `src/supabase/auth.tsx` (AuthProvider, requires sign-in).
- **First-run onboarding:** HowItWorks → **ChooseTheme** → TextSize → Reminders.
  `src/screens/onboarding/*`. Theme is selectable at first run
  (`ChooseThemeScreen.tsx`).

## The Reset (core flow)
- **Flow state:** `src/store/ResetFlow.tsx` (draft, commit).
- **Input steps:** heaviness required + up to 3 feelings + up to 2 situations —
  `src/screens/reset/SituationScreen.tsx`; static content in
  `src/data/feelings.*` / `src/data/situations.ts`.
- **AI reframe ("core") + narration:** `src/screens/reset/NarrationScreen.tsx`
  → calls edge `ai` via `src/ai/edge.ts`; prompts/types in `src/ai/openai.ts`.
  Voice is **play-on-tap** (not auto-synth), OpenAI TTS, cached.
- **Tools (9, inline from a step OR standalone):** breathing (box/4-7-8/paced),
  grounding (5-4-3-2-1), journal, worry postponement, behavioural activation,
  self-compassion, gratitude (three good things), urge surfing, progressive
  muscle relaxation. Screens in `src/screens/tools/*`; shared `src/tools/catalog.ts`
  drives the reset "Do it now" launcher, labels, and the Tools hub
  (`ToolsHubScreen`, Home → "See all"); completion recorded via
  `src/tools/toolFinish.ts`. The AI `tool` field (edge `ai`) routes each small
  step to the most specific tool.
- **Close:** `src/screens/reset/DoneScreen.tsx` — animated check + rotating
  celebratory message ("You did it"), reduce-motion aware.

## Home / Progress / Insights
- **Home:** `src/screens/home/HomeScreen.tsx` (today's reset entry point).
- **Progress / Insights:** `src/screens/progress/ProgressScreen.tsx` —
  consistency (active days/14, lessons learned, tools used), thought/keyword
  mapping, **"What resonated with you"** (community resonance),
  **Weekly report** card (PDF download) + reminder banner.
- **Reset history + detail:** `ResetDetailScreen.tsx`, history in `AppState.tsx`.

## Explore (CBT lessons)
- **Library + video/voice lessons:** `src/screens/explore/VideoLessonScreen.tsx`,
  static seed in `src/data/lessons.ts`, live state in `src/store/Lessons.tsx`.
- **Generated daily** by edge `generate-lesson` (24h cron); **personalized sort**
  by edge `rank-lessons`.

## Community ("Daily Drop")
- **UI:** `src/screens/community/CommunityScreen.tsx` (compose w/ AI feedback,
  Today/Saved toggle, hero + PostCard, "This helped me" + Save).
- **Client data:** `src/supabase/community.ts` — `submitPost`, `fetchFeed`
  (hero + 12 ranked via `rank()`), `fetchSaved`, `setReaction`, `setSaved`,
  `fetchRecentResonant`.
- **Server gate:** edge `community-post` (moderation + quality + 1/day + truncated
  `author_label`). Schema: `posts`, `post_reactions`, `post_saves` (`schema_v5.sql`).

## Notifications
- **Push registration:** `src/notifications/usePushRegistration.ts` (Expo push token).
- **Local reminders (offline fallback):** `useReminderSync.ts`, `reminders.ts`.
- **Deep-link taps:** `useNotificationRouting.ts` (reset / lesson / insights / community).
- **Server push planner:** edge `daily-nudge` (≤2/day, timezone-correct).

## Weekly insights PDF
- Edge `weekly-report`: builds a paginated PDF (pdf-lib), stores it, notifies +
  emails. Includes "What resonated with you". Download surfaced in Progress.

## Themes & accessibility
- **6 themes** in `src/theme/themes.ts` (Calm Dark default, Warm Sand, Soft Light,
  + Low-Stim / High-Contrast / Warm Night). Swapped via `ThemeContext.tsx`.
- Text-size steps, reduce-motion, read-aloud all flow through ThemeContext.
- Change themes from Profile (`ThemePickerScreen.tsx`) or first-run.

## Navigation
- 6 bottom tabs incl. **Community** — `src/navigation/TabNavigator.tsx`;
  routes/types in `src/navigation/{RootNavigator,types}.ts`.
