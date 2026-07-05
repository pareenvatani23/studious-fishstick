import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useApp } from './AppState';

/**
 * Holds the in-progress "Reset" while the user moves through the loop:
 * situation → support (reframe + action) → narration → done.
 * Committed to history on the Done step; reset when a new Reset starts.
 *
 * A ref mirrors the draft so commit() always sees the latest values even when
 * called in the same tick as update() (avoids a stale-closure save).
 */
export interface ToolUse {
  tool: string; // 'breathing' | 'grounding' | 'journal'
  variant?: string;
  seconds?: number;
  completed: boolean;
  at: string;
}

interface Draft {
  heaviness?: number;
  /** primary feeling (first of emotions) — kept for existing charts */
  emotion?: string;
  /** up to 3 named feelings */
  emotions?: string[];
  /** primary situation id — kept for existing charts */
  situationId?: string;
  situationLabel?: string;
  customSituation?: string;
  /** up to 2 situation labels */
  situations?: string[];
  situationIds?: string[];
  note?: string;
  reframe?: string;
  actionText?: string;
  narration?: string;
  keywords?: string[];
  distortion?: string;
  /** machine hint for the inline tool the small step maps to */
  tool?: string;
  aiGenerated?: boolean;
  /** tool sessions completed as part of this reset */
  toolsUsed?: ToolUse[];
  outcome?: 'done' | 'notyet';
}

const EMPTY: Draft = {};

interface ResetFlowValue {
  draft: Draft;
  start: () => void;
  update: (patch: Partial<Draft>) => void;
  commit: (finalPatch?: Partial<Draft>) => void;
}

const Ctx = createContext<ResetFlowValue | undefined>(undefined);

export function ResetFlowProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const draftRef = useRef<Draft>(EMPTY);
  const { recordReset } = useApp();

  const start = useCallback(() => {
    draftRef.current = EMPTY;
    setDraft(EMPTY);
  }, []);

  const update = useCallback((patch: Partial<Draft>) => {
    draftRef.current = { ...draftRef.current, ...patch };
    setDraft(draftRef.current);
  }, []);

  const commit = useCallback(
    (finalPatch?: Partial<Draft>) => {
      const d = { ...draftRef.current, ...(finalPatch ?? {}) };
      draftRef.current = d;
      recordReset({
        heaviness: d.heaviness,
        emotion: d.emotion ?? d.emotions?.[0],
        emotions: d.emotions,
        situationId: d.situationId ?? d.situationIds?.[0],
        customSituation: d.customSituation,
        situations: d.situations,
        note: d.note,
        reframe: d.reframe,
        actionText: d.actionText,
        keywords: d.keywords,
        distortion: d.distortion,
        toolsUsed: d.toolsUsed,
        outcome: d.outcome,
      });
    },
    [recordReset]
  );

  const value = useMemo(() => ({ draft, start, update, commit }), [draft, start, update, commit]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useResetFlow(): ResetFlowValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useResetFlow must be used inside <ResetFlowProvider>');
  return ctx;
}
