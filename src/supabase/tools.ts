import { supabase } from './client';

/** Count of standalone tool sessions the user has completed (breathing/grounding/journal). */
export async function countStandaloneToolSessions(): Promise<number> {
  if (!supabase) return 0;
  try {
    const { count, error } = await supabase
      .from('tool_events')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
