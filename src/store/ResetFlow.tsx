import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useApp } from './AppState';

/**
 * Holds the in-progress "Reset" while the user moves through the 3-tap loop:
 * mood (optional) → situation → support (reframe + action) → done.
 * Committed to history on the Done step; reset when a new Reset starts.
 */
interface Draft {
  heaviness?: number;
  situationId?: string;
  customSituation?: string;
  note?: string;
  actionText?: string;
  outcome?: 'done' | 'notyet';
}

const EMPTY: Draft = {};

interface ResetFlowValue {
  draft: Draft;
  start: () => void;
  update: (patch: Partial<Draft>) => void;
  commit: () => void;
}

const Ctx = createContext<ResetFlowValue | undefined>(undefined);

export function ResetFlowProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const { recordReset } = useApp();

  const start = useCallback(() => setDraft(EMPTY), []);
  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const commit = useCallback(() => {
    recordReset({
      heaviness: draft.heaviness,
      situationId: draft.situationId,
      customSituation: draft.customSituation,
      note: draft.note,
      actionText: draft.actionText,
      outcome: draft.outcome,
    });
  }, [draft, recordReset]);

  const value = useMemo(() => ({ draft, start, update, commit }), [draft, start, update, commit]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useResetFlow(): ResetFlowValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useResetFlow must be used inside <ResetFlowProvider>');
  return ctx;
}
