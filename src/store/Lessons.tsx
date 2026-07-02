import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabase/client';
import { useApp } from './AppState';
import { situationById } from '../data/situations';
import { rankLessons } from '../ai/edge';
import { lessons as bundledLessons, lessonById as bundledById, type Lesson } from '../data/lessons';

/**
 * Lessons store — the DB is the source of truth. Fetches the shared lesson
 * library from Supabase, falls back to the bundled seeds if offline, AI-ranks
 * them for this user (by their responses / patterns), and listens for newly
 * generated lessons via Realtime.
 */
interface LessonsValue {
  lessons: Lesson[]; // all, natural order (start-here first, then newest)
  ranked: Lesson[]; // AI-personalised order for Explore
  getById: (id: string) => Lesson | undefined;
  loading: boolean;
  newCount: number; // lessons arrived via realtime this session
  refresh: () => Promise<void>;
}

const LessonsContext = createContext<LessonsValue | undefined>(undefined);

function rowToLesson(r: any): Lesson {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    gradient: (Array.isArray(r.gradient) && r.gradient.length === 2 ? r.gradient : ['#A99BD4', '#74C7B8']) as [string, string],
    summary: r.summary ?? '',
    actionPreview: r.action_preview ?? undefined,
    intro: r.intro ?? '',
    sections: Array.isArray(r.sections) ? r.sections : [],
    actions: Array.isArray(r.actions) ? r.actions : [],
    keyIdea: r.key_idea ?? '',
    voiceScript: r.voice_script ?? undefined,
    durationLabel: r.duration_label ?? '4 min',
    startHere: !!r.start_here,
    copyFinal: false,
  };
}

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const { hydrated, signedIn, resets, stats } = app;
  const [lessons, setLessons] = useState<Lesson[]>(bundledLessons);
  const [order, setOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const rankedForRef = useRef<string>('');

  const refresh = useCallback(async () => {
    if (!supabase) { setLessons(bundledLessons); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('published', true)
        .order('start_here', { ascending: false })
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) {
        setLessons(bundledLessons);
      } else {
        setLessons(data.map(rowToLesson));
      }
    } catch {
      setLessons(bundledLessons);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated, refresh]);

  // Realtime: new AI-generated lessons appear without a reload.
  useEffect(() => {
    if (!supabase || !signedIn) return;
    const channel = supabase
      .channel('lessons-inserts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lessons' }, (payload: any) => {
        const row = payload?.new;
        if (!row?.id) return;
        setLessons((prev) => (prev.some((l) => l.id === row.id) ? prev : [rowToLesson(row), ...prev]));
        setNewCount((n) => n + 1);
      })
      .subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, [signedIn]);

  // AI-rank whenever the library or the user's history meaningfully changes.
  useEffect(() => {
    if (!signedIn || lessons.length === 0) { setOrder(lessons.map((l) => l.id)); return; }
    const sig = `${lessons.length}|${resets.length}|${stats.mostCommonSituationId ?? ''}`;
    if (rankedForRef.current === sig) return;
    rankedForRef.current = sig;
    const history = {
      recentSituations: resets.map((r) => r.customSituation || (r.situationId ? situationById(r.situationId)?.label : '')).filter(Boolean).slice(0, 8),
      recentEmotions: resets.map((r) => r.emotion).filter(Boolean).slice(0, 8),
      distortions: resets.map((r) => r.distortion).filter(Boolean).slice(0, 8),
      keywords: resets.flatMap((r) => r.keywords ?? []).slice(0, 12),
      topSituation: stats.mostCommonSituationId ? situationById(stats.mostCommonSituationId)?.label : null,
    };
    const meta = lessons.map((l) => ({ id: l.id, title: l.title, category: l.category, summary: l.summary }));
    rankLessons(history, meta).then((ids) => setOrder(ids)).catch(() => setOrder(lessons.map((l) => l.id)));
  }, [signedIn, lessons, resets, stats.mostCommonSituationId]);

  const getById = useCallback(
    (id: string) => lessons.find((l) => l.id === id) ?? bundledById(id),
    [lessons]
  );

  const ranked = useMemo(() => {
    if (!order.length) return lessons;
    const byId = new Map(lessons.map((l) => [l.id, l]));
    const out: Lesson[] = [];
    order.forEach((id) => { const l = byId.get(id); if (l) { out.push(l); byId.delete(id); } });
    byId.forEach((l) => out.push(l)); // any not in order
    return out;
  }, [order, lessons]);

  const value = useMemo<LessonsValue>(
    () => ({ lessons, ranked, getById, loading, newCount, refresh }),
    [lessons, ranked, getById, loading, newCount, refresh]
  );
  return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
}

export function useLessons(): LessonsValue {
  const ctx = useContext(LessonsContext);
  if (!ctx) throw new Error('useLessons must be used inside <LessonsProvider>');
  return ctx;
}
