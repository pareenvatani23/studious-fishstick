import { useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useResetFlow, type ToolUse } from '../store/ResetFlow';
import { useRootNav } from '../navigation/hooks';

export type ToolMode = 'action' | 'standalone';

export interface ToolFinishInput {
  tool: string; // 'breathing' | 'grounding' | 'journal'
  variant?: string;
  seconds?: number;
  completed?: boolean;
  payload?: unknown; // e.g. journal text (kept private)
}

/** Persist a standalone tool session to tool_events (scoped to the user by RLS). */
async function saveToolEvent(evt: ToolFinishInput) {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    await supabase.from('tool_events').insert({
      user_id: uid,
      tool: evt.tool,
      variant: evt.variant ?? null,
      seconds: evt.seconds ?? null,
      completed: evt.completed !== false,
      payload: evt.payload ?? null,
    });
  } catch {
    // best-effort
  }
}

/**
 * Finish a tool session. In "action" mode (launched from the reset's small
 * step) it records the tool use onto the in-progress reset draft (so it commits
 * with the reset + marks the step done); in "standalone" mode it saves a
 * tool_events row. Then it returns the user back.
 */
export function useToolFinish() {
  const { update, draft } = useResetFlow();
  const nav = useRootNav();
  return useCallback(
    async (mode: ToolMode, evt: ToolFinishInput) => {
      const rec: ToolUse = {
        tool: evt.tool,
        variant: evt.variant,
        seconds: evt.seconds,
        completed: evt.completed !== false,
        at: new Date().toISOString(),
      };
      if (mode === 'action') {
        update({ toolsUsed: [...(draft.toolsUsed ?? []), rec] });
      } else {
        await saveToolEvent(evt);
      }
      nav.goBack();
    },
    [update, draft, nav]
  );
}
