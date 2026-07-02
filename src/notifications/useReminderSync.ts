import { useEffect, useRef } from 'react';
import { AppState as RNAppState } from 'react-native';
import { useApp } from '../store/AppState';
import { situationById } from '../data/situations';
import { generateReminders, fallbackReminders, type ReminderHistory } from '../ai/openai';
import { reschedule, notificationsAvailable } from './reminders';

/** How many days of reminders we pre-generate + schedule at a time. */
const WINDOW_DAYS = 4;

/** Build the AI history payload from the local reset log + stats. */
function buildHistory(app: ReturnType<typeof useApp>): ReminderHistory {
  const labelFor = (r: { situationId?: string; customSituation?: string }) =>
    r.customSituation?.trim() || (r.situationId ? situationById(r.situationId)?.label : undefined) || '';

  const recentSituations = app.resets.map(labelFor).filter(Boolean).slice(0, 6);
  const recentEmotions = app.resets.map((r) => r.emotion).filter(Boolean).slice(0, 6) as string[];
  const last = app.resets[0];
  return {
    recentSituations,
    recentEmotions,
    topSituation: app.stats.mostCommonSituationId ? situationById(app.stats.mostCommonSituationId)?.label ?? null : null,
    lastActionText: last?.actionText ?? null,
    lastActionDone: last ? last.outcome === 'done' : null,
    streak: app.stats.currentStreak,
    total: app.stats.totalResets,
    name: app.name,
  };
}

/**
 * Keeps scheduled reminders fresh + personalised. Reschedules whenever:
 *  - the app becomes active (open / foreground),
 *  - the user's reset history or reminder preferences change.
 *
 * Generation is best-effort (AI → fallback) and never blocks the UI. A short
 * throttle prevents redundant regeneration on rapid state churn.
 */
export function useReminderSync() {
  const app = useApp();
  const { hydrated, reminderEnabled, reminderHour, reminderMinute, resets } = app;
  const busy = useRef(false);
  const lastRun = useRef(0);

  // stable-ish signature so we only regenerate on meaningful changes
  const sig = `${reminderEnabled}|${reminderHour}|${reminderMinute}|${resets.length}|${resets[0]?.id ?? ''}|${resets[0]?.outcome ?? ''}`;

  useEffect(() => {
    if (!hydrated || !notificationsAvailable) return;

    const run = async () => {
      if (busy.current) return;
      // throttle: at most once per 30s (except the very first run)
      const nowTs = Date.now();
      if (lastRun.current && nowTs - lastRun.current < 30_000) return;
      busy.current = true;
      lastRun.current = nowTs;
      try {
        if (!reminderEnabled) {
          await reschedule({ enabled: false, hour: reminderHour, minute: reminderMinute, messages: [] });
          return;
        }
        const history = buildHistory(app);
        let messages;
        try {
          messages = await generateReminders(history, WINDOW_DAYS);
        } catch {
          messages = fallbackReminders(history, WINDOW_DAYS);
        }
        await reschedule({ enabled: true, hour: reminderHour, minute: reminderMinute, messages });
      } finally {
        busy.current = false;
      }
    };

    run();

    const sub = RNAppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sig]);
}
