import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, supabaseEnabled } from '../supabase/client';
import { useAuth } from '../supabase/auth';

/**
 * App state — DB is the source of truth. Everything (profile, preferences,
 * resets, lessons watched) is stored in Supabase against the user id and loaded
 * on sign-in. No app data lives on the device; only the Supabase auth session
 * is persisted locally (that's how auth works). Mutations write through to the
 * DB and update in-memory state.
 */

export type Outcome = 'done' | 'notyet';
export type TextSizeName = 'Normal' | 'Large' | 'Largest';

export interface ResetRecord {
  id: string; // == client_id
  date: string; // ISO
  heaviness?: number;
  emotion?: string;
  situationId?: string;
  customSituation?: string;
  note?: string;
  reframe?: string;
  actionText?: string;
  keywords?: string[];
  distortion?: string;
  outcome?: Outcome;
}

export interface DisplayPrefs {
  theme: string;
  textSize: TextSizeName;
  reduceMotion: boolean;
  readAloud: boolean;
}

interface AppData {
  name: string;
  dob?: string;
  onboardingComplete: boolean;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  expoPushToken?: string;
  timezone?: string;
  theme: string;
  textSize: TextSizeName;
  reduceMotion: boolean;
  readAloud: boolean;
  lessonsWatched: string[];
  /** today's AI notification/consistency plan (server-written), if any */
  plan?: { toughness?: string; note?: string; sendReset?: boolean; sendLesson?: boolean } | null;
  resets: ResetRecord[];
}

const DEFAULTS: AppData = {
  name: 'there',
  dob: undefined,
  onboardingComplete: false,
  reminderEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
  expoPushToken: undefined,
  theme: 'calmDark',
  textSize: 'Normal',
  reduceMotion: false,
  readAloud: false,
  lessonsWatched: [],
  plan: null,
  resets: [],
};

export interface Stats {
  currentStreak: number;
  totalResets: number;
  actionsDone: number;
  mostCommonSituationId: string | null;
  weekly: { label: string; value: number }[];
}

interface AppStateValue extends AppData {
  hydrated: boolean;
  signedIn: boolean;
  completeOnboarding: () => void;
  setName: (name: string) => void;
  setReminder: (prefs: { enabled?: boolean; hour?: number; minute?: number }) => void;
  setDisplayPref: (prefs: Partial<DisplayPrefs>) => void;
  setExpoPushToken: (token: string) => void;
  setTimezone: (tz: string) => void;
  recordReset: (reset: Omit<ResetRecord, 'id' | 'date'>) => Promise<void>;
  markLessonWatched: (id: string) => void;
  deleteAllData: () => Promise<void>;
  reload: () => Promise<void>;
  stats: Stats;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function rowToReset(row: any): ResetRecord {
  return {
    id: row.client_id || row.id,
    date: row.occurred_at || row.created_at,
    heaviness: row.heaviness ?? undefined,
    emotion: row.emotion ?? undefined,
    situationId: row.situation_id ?? undefined,
    customSituation: row.custom_situation ?? undefined,
    note: row.note ?? undefined,
    reframe: row.reframe ?? undefined,
    actionText: row.action_text ?? undefined,
    keywords: Array.isArray(row.keywords) ? row.keywords : undefined,
    distortion: row.distortion ?? undefined,
    outcome: row.outcome ?? undefined,
  };
}

function profileToPrefs(p: any): Partial<AppData> {
  if (!p) return {};
  return {
    name: p.name || 'there',
    dob: p.dob ?? undefined,
    onboardingComplete: !!p.onboarding_complete,
    reminderEnabled: !!p.reminder_enabled,
    reminderHour: typeof p.reminder_hour === 'number' ? p.reminder_hour : 20,
    reminderMinute: typeof p.reminder_minute === 'number' ? p.reminder_minute : 0,
    expoPushToken: p.expo_push_token ?? undefined,
    timezone: p.timezone ?? undefined,
    theme: p.theme || 'calmDark',
    textSize: (p.text_size as TextSizeName) || 'Normal',
    reduceMotion: !!p.reduce_motion,
    readAloud: !!p.read_aloud,
    lessonsWatched: Array.isArray(p.lessons_watched) ? p.lessons_watched : [],
    plan: p.plan ?? null,
  };
}

function computeStats(resets: ResetRecord[]): Stats {
  const totalResets = resets.length;
  const actionsDone = resets.filter((r) => r.outcome === 'done').length;
  const days = new Set(resets.map((r) => dayKey(new Date(r.date))));
  let currentStreak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
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

let idSeq = 0;
function newClientId(): string {
  idSeq += 1;
  return `${Date.now()}-${idSeq}-${Math.round(Math.random() * 1e6)}`;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { session, ready: authReady } = useAuth();
  const uid = session?.user?.id ?? null;
  const [data, setData] = useState<AppData>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const load = useCallback(async () => {
    if (!supabase || !uid) {
      setData(DEFAULTS);
      setHydrated(true);
      return;
    }
    try {
      const [{ data: profile }, { data: resetRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('resets').select('*').eq('user_id', uid).order('occurred_at', { ascending: false }),
      ]);
      const resets = Array.isArray(resetRows) ? resetRows.map(rowToReset) : [];
      setData({ ...DEFAULTS, ...profileToPrefs(profile), resets });
    } catch {
      setData(DEFAULTS);
    } finally {
      setHydrated(true);
    }
  }, [uid]);

  // (re)load whenever the signed-in user changes
  useEffect(() => {
    if (!authReady) return;
    setHydrated(false);
    load();
  }, [authReady, uid, load]);

  // keep the user's timezone (IANA) current so server reminders fire at their
  // real local hour
  useEffect(() => {
    if (!hydrated || !uid) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz !== dataRef.current.timezone) {
        setData((d) => ({ ...d, timezone: tz }));
        if (supabase) supabase.from('profiles').update({ timezone: tz }).eq('id', uid).then(() => {}, () => {});
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, uid]);

  // patch the profile row in DB + local state
  const patchProfile = useCallback(
    (patch: Record<string, any>, local: Partial<AppData>) => {
      setData((d) => ({ ...d, ...local }));
      if (supabase && uid) {
        supabase
          .from('profiles')
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq('id', uid)
          .then(() => {}, () => {});
      }
    },
    [uid]
  );

  const completeOnboarding = useCallback(() => patchProfile({ onboarding_complete: true }, { onboardingComplete: true }), [patchProfile]);
  const setName = useCallback((name: string) => patchProfile({ name }, { name }), [patchProfile]);
  const setExpoPushToken = useCallback((token: string) => patchProfile({ expo_push_token: token }, { expoPushToken: token }), [patchProfile]);
  const setTimezone = useCallback((tz: string) => patchProfile({ timezone: tz }, { timezone: tz }), [patchProfile]);

  const setReminder = useCallback(
    (prefs: { enabled?: boolean; hour?: number; minute?: number }) => {
      const patch: Record<string, any> = {};
      const local: Partial<AppData> = {};
      if (prefs.enabled !== undefined) { patch.reminder_enabled = prefs.enabled; local.reminderEnabled = prefs.enabled; }
      if (prefs.hour !== undefined) { patch.reminder_hour = prefs.hour; local.reminderHour = prefs.hour; }
      if (prefs.minute !== undefined) { patch.reminder_minute = prefs.minute; local.reminderMinute = prefs.minute; }
      patchProfile(patch, local);
    },
    [patchProfile]
  );

  const setDisplayPref = useCallback(
    (prefs: Partial<DisplayPrefs>) => {
      const patch: Record<string, any> = {};
      const local: Partial<AppData> = {};
      if (prefs.theme !== undefined) { patch.theme = prefs.theme; local.theme = prefs.theme; }
      if (prefs.textSize !== undefined) { patch.text_size = prefs.textSize; local.textSize = prefs.textSize; }
      if (prefs.reduceMotion !== undefined) { patch.reduce_motion = prefs.reduceMotion; local.reduceMotion = prefs.reduceMotion; }
      if (prefs.readAloud !== undefined) { patch.read_aloud = prefs.readAloud; local.readAloud = prefs.readAloud; }
      patchProfile(patch, local);
    },
    [patchProfile]
  );

  const recordReset = useCallback(
    async (reset: Omit<ResetRecord, 'id' | 'date'>) => {
      const record: ResetRecord = { ...reset, id: newClientId(), date: new Date().toISOString() };
      setData((d) => ({ ...d, resets: [record, ...d.resets] }));
      if (supabase && uid) {
        await supabase.from('resets').insert({
          user_id: uid,
          client_id: record.id,
          occurred_at: record.date,
          heaviness: record.heaviness ?? null,
          emotion: record.emotion ?? null,
          situation_id: record.situationId ?? null,
          custom_situation: record.customSituation ?? null,
          note: record.note ?? null,
          reframe: record.reframe ?? null,
          action_text: record.actionText ?? null,
          keywords: record.keywords ?? null,
          distortion: record.distortion ?? null,
          outcome: record.outcome ?? null,
        }).then(() => {}, () => {});
      }
    },
    [uid]
  );

  const markLessonWatched = useCallback(
    (id: string) => {
      if (dataRef.current.lessonsWatched.includes(id)) return;
      const next = [...dataRef.current.lessonsWatched, id];
      patchProfile({ lessons_watched: next }, { lessonsWatched: next });
    },
    [patchProfile]
  );

  const deleteAllData = useCallback(async () => {
    if (supabase && uid) {
      await supabase.from('resets').delete().eq('user_id', uid).then(() => {}, () => {});
      await supabase
        .from('profiles')
        .update({
          onboarding_complete: false, reminder_enabled: false, reminder_hour: 20, reminder_minute: 0,
          theme: 'calmDark', text_size: 'Normal', reduce_motion: false, read_aloud: false,
          lessons_watched: [], dob: null, expo_push_token: null,
        })
        .eq('id', uid)
        .then(() => {}, () => {});
    }
    setData(DEFAULTS);
  }, [uid]);

  const stats = useMemo(() => computeStats(data.resets), [data.resets]);

  const value = useMemo<AppStateValue>(
    () => ({
      ...data,
      hydrated: hydrated && authReady,
      signedIn: !!uid,
      completeOnboarding,
      setName,
      setReminder,
      setDisplayPref,
      setExpoPushToken,
      setTimezone,
      recordReset,
      markLessonWatched,
      deleteAllData,
      reload: load,
      stats,
    }),
    [data, hydrated, authReady, uid, completeOnboarding, setName, setReminder, setDisplayPref, setExpoPushToken, setTimezone, recordReset, markLessonWatched, deleteAllData, load, stats]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>');
  return ctx;
}

// supabaseEnabled kept importable for callers that branch on config
export { supabaseEnabled };
