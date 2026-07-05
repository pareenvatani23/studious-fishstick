import { supabase } from './client';

/** A stored weekly report (PDF in Storage + this metadata row). */
export interface WeeklyReport {
  id: string;
  period_start: string | null;
  period_end: string | null;
  path: string;
  summary: string | null;
  created_at: string;
}

/** List the signed-in user's stored weekly reports, newest first. */
export async function listReports(): Promise<WeeklyReport[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as WeeklyReport[];
}

/** Build this week's report now (edge function stores it). Returns true on success. */
export async function generateReport(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.functions.invoke('weekly-report', { body: {} });
    if (error) return false;
    return !!(data && !data.error);
  } catch {
    return false;
  }
}

/** A short-lived signed URL to download/open a report PDF. */
export async function reportDownloadUrl(path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from('reports').createSignedUrl(path, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
