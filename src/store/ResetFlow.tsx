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
interface Draft {
  heaviness?: number;
  situationId?: string;
  situationLabel?: string;
  customSituation?: string;
  note?: string;
  reframe?: string;
  actionText?: string;
  narration?: string;
  keywords?: string[];
  distortion?: string;
  aiGenerated?: boolean;
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
        situationId: d.situationId,
        customSituation: d.customSituation,
        note: d.note,
        reframe: d.reframe,
        actionText: d.actionText,
        keywords: d.keywords,
        distortion: d.distortion,
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
