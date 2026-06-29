import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Story, Outcome, useApp } from './AppState';

/**
 * Holds the in-progress ("draft") shift while the user moves through the daily
 * loop. Committed to history on the Proof step. Reset when a new shift starts.
 */
interface Draft {
  feelingId?: string;
  pullId?: string;
  story: Story;
  responseId?: string;
  actionId?: string;
  customAction?: string;
  reframeText?: string;
  outcome?: Outcome;
}

const EMPTY: Draft = { story: {} };

interface ShiftFlowValue {
  draft: Draft;
  start: () => void;
  update: (patch: Partial<Draft>) => void;
  updateStory: (patch: Partial<Story>) => void;
  commit: (mode: 'easy' | 'full') => void;
}

const Ctx = createContext<ShiftFlowValue | undefined>(undefined);

export function ShiftFlowProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const { recordShift } = useApp();

  const start = useCallback(() => setDraft(EMPTY), []);
  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const updateStory = useCallback((patch: Partial<Story>) => setDraft((d) => ({ ...d, story: { ...d.story, ...patch } })), []);

  const commit = useCallback(
    (mode: 'easy' | 'full') => {
      recordShift({
        mode,
        feelingId: draft.feelingId,
        pullId: draft.pullId,
        story: mode === 'full' ? draft.story : undefined,
        responseId: draft.responseId,
        actionId: draft.actionId,
        customAction: draft.customAction,
        outcome: draft.outcome,
      });
    },
    [draft, recordShift]
  );

  const value = useMemo(() => ({ draft, start, update, updateStory, commit }), [draft, start, update, updateStory, commit]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShiftFlow(): ShiftFlowValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShiftFlow must be used inside <ShiftFlowProvider>');
  return ctx;
}
