import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * App state — local-only (AsyncStorage), no account, no network (MVP).
 * Simplified model: the daily action is a "Reset" anchored on a concrete
 * situation. No Easy/Full modes, no pulls/virtues. Display/comfort prefs live
 * in ThemeContext.
 */

const STORAGE_KEY = '@trueshift/app';

export type Outcome = 'done' | 'notyet';

export interface ResetRecord {
  id: string;
  /** ISO timestamp */
  date: string;
  /** optional 1–5 "how heavy did it feel" */
  heaviness?: number;
  situationId?: string;
  customSituation?: string;
  /** optional free note ("add the thought") */
  note?: string;
  actionText?: string;
  outcome?: Outcome;
}

interface AppData {
  onboardingComplete: boolean;
  name: string;
  resets: ResetRecord[];
  lessonsWatched: string[];
}

const DEFAULTS: AppData = {
  onboardingComplete: false,
  name: 'there',
  resets: [],
  lessonsWatched: [],
};

export interface Stats {
  currentStreak: number;
  totalResets: number;
  actionsDone: number;
  mostCommonSituationId: string | null;
  weekly: { label: string; value: number }[]; // last 7 days, 0..1 normalized
}

interface AppStateValue extends AppData {
  hydrated: boolean;
  completeOnboarding: () => void;
  setName: (name: string) => void;
  recordReset: (reset: Omit<ResetRecord, 'id' | 'date'>) => void;
  markLessonWatched: (id: string) => void;
  deleteAllData: () => Promise<void>;
  stats: Stats;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStats(resets: ResetRecord[]): Stats {
  const totalResets = resets.length;
  const actionsDone = resets.filter((r) => r.outcome === 'done').length;

  // streak: consecutive days (ending today or yesterday) with ≥1 reset
  const days = new Set(resets.map((r) => dayKey(new Date(r.date))));
  let currentStreak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // 1-day grace
  while (days.has(dayKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const counts: Record<string, number> = {};
  resets.forEach((r) => {
    if (r.situationId) counts[r.situationId] = (counts[r.situationId] || 0) + 1;
  });
  let mostCommonSituationId: string | null = null;
  let best = 0;
  Object.entries(counts).forEach(([k, n]) => {
    if (n > best) {
      best = n;
      mostCommonSituationId = k;
    }
  });

  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    buckets.push({ label: labels[d.getDay()], count: resets.filter((r) => dayKey(new Date(r.date)) === k).length });
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const weekly = buckets.map((b) => ({ label: b.label, value: b.count / max }));

  return { currentStreak, totalResets, actionsDone, mostCommonSituationId, weekly };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setData({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        // ignore — fall back to defaults
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const completeOnboarding = useCallback(() => persist({ ...data, onboardingComplete: true }), [persist, data]);
  const setName = useCallback((name: string) => persist({ ...data, name }), [persist, data]);

  const recordReset = useCallback(
    (reset: Omit<ResetRecord, 'id' | 'date'>) => {
      const record: ResetRecord = {
        ...reset,
        id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        date: new Date().toISOString(),
      };
      persist({ ...data, resets: [record, ...data.resets] });
    },
    [persist, data]
  );

  const markLessonWatched = useCallback(
    (id: string) => {
      if (data.lessonsWatched.includes(id)) return;
      persist({ ...data, lessonsWatched: [...data.lessonsWatched, id] });
    },
    [persist, data]
  );

  const deleteAllData = useCallback(async () => {
    setData(DEFAULTS);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const stats = useMemo(() => computeStats(data.resets), [data.resets]);

  const value = useMemo<AppStateValue>(
    () => ({ ...data, hydrated, completeOnboarding, setName, recordReset, markLessonWatched, deleteAllData, stats }),
    [data, hydrated, completeOnboarding, setName, recordReset, markLessonWatched, deleteAllData, stats]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>');
  return ctx;
}
