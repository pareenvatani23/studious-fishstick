import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * App state — local-only (AsyncStorage), no account, no network (MVP).
 * Owns: onboarding flag, Easy/Full mode, display name, the shift history, and
 * which lessons have been opened. Display/comfort prefs live in ThemeContext.
 */

const STORAGE_KEY = '@trueshift/app';

export type AppMode = 'easy' | 'full';
export type Outcome = 'done' | 'partly' | 'avoided';

export interface Story {
  whatHappened?: string;
  mindSaid?: string;
  emotions?: string[];
  wantedToDo?: string;
}

export interface ShiftRecord {
  id: string;
  /** ISO timestamp */
  date: string;
  mode: AppMode;
  feelingId?: string; // easy mode
  pullId?: string; // full mode
  story?: Story; // full mode
  responseId?: string;
  actionId?: string;
  customAction?: string;
  outcome?: Outcome;
}

interface AppData {
  onboardingComplete: boolean;
  mode: AppMode;
  name: string;
  shifts: ShiftRecord[];
  lessonsWatched: string[];
  patternsSelected: string[]; // from onboarding Pattern Selection (full)
}

const DEFAULTS: AppData = {
  onboardingComplete: false,
  mode: 'easy', // Easy mode is the default; Full is opt-in
  name: 'Sam',
  shifts: [],
  lessonsWatched: [],
  patternsSelected: [],
};

export interface Stats {
  currentStreak: number;
  totalShifts: number;
  actionsCompleted: number;
  mostCommonPullId: string | null;
  mostChosenResponseId: string | null;
  weekly: { label: string; value: number }[]; // last 7 days, 0..1 normalized
}

interface AppStateValue extends AppData {
  hydrated: boolean;
  completeOnboarding: () => void;
  setMode: (mode: AppMode) => void;
  setName: (name: string) => void;
  setPatternsSelected: (ids: string[]) => void;
  recordShift: (shift: Omit<ShiftRecord, 'id' | 'date'>) => void;
  markLessonWatched: (id: string) => void;
  deleteAllData: () => Promise<void>;
  stats: Stats;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStats(shifts: ShiftRecord[]): Stats {
  const totalShifts = shifts.length;
  const actionsCompleted = shifts.filter((s) => s.outcome === 'done').length;

  // streak: consecutive days (ending today or yesterday) with ≥1 shift
  const days = new Set(shifts.map((s) => dayKey(new Date(s.date))));
  let currentStreak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // grace: count from yesterday
  while (days.has(dayKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const mode = (getter: (s: ShiftRecord) => string | undefined): string | null => {
    const counts: Record<string, number> = {};
    shifts.forEach((s) => {
      const v = getter(s);
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    let best: string | null = null;
    let bestN = 0;
    Object.entries(counts).forEach(([k, n]) => {
      if (n > bestN) {
        best = k;
        bestN = n;
      }
    });
    return best;
  };

  // weekly: last 7 calendar days, normalized to the busiest day
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const count = shifts.filter((s) => dayKey(new Date(s.date)) === k).length;
    buckets.push({ label: labels[d.getDay()], count });
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const weekly = buckets.map((b) => ({ label: b.label, value: b.count / max }));

  return {
    currentStreak,
    totalShifts,
    actionsCompleted,
    mostCommonPullId: mode((s) => s.pullId),
    mostChosenResponseId: mode((s) => s.responseId),
    weekly,
  };
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
  const setMode = useCallback((mode: AppMode) => persist({ ...data, mode }), [persist, data]);
  const setName = useCallback((name: string) => persist({ ...data, name }), [persist, data]);
  const setPatternsSelected = useCallback((patternsSelected: string[]) => persist({ ...data, patternsSelected }), [persist, data]);

  const recordShift = useCallback(
    (shift: Omit<ShiftRecord, 'id' | 'date'>) => {
      const record: ShiftRecord = {
        ...shift,
        id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        date: new Date().toISOString(),
      };
      persist({ ...data, shifts: [record, ...data.shifts] });
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

  const stats = useMemo(() => computeStats(data.shifts), [data.shifts]);

  const value = useMemo<AppStateValue>(
    () => ({
      ...data,
      hydrated,
      completeOnboarding,
      setMode,
      setName,
      setPatternsSelected,
      recordShift,
      markLessonWatched,
      deleteAllData,
      stats,
    }),
    [data, hydrated, completeOnboarding, setMode, setName, setPatternsSelected, recordShift, markLessonWatched, deleteAllData, stats]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>');
  return ctx;
}
