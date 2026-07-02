import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for auth + cloud sync.
 *
 * The publishable/anon key is safe to ship client-side: it only works together
 * with the row-level-security rules in supabase/schema.sql, which scope every
 * row to auth.uid(). Sessions persist in AsyncStorage and auto-refresh.
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True only when both env values are present — lets the app degrade gracefully. */
export const supabaseEnabled = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // no URL-based sessions in RN
      },
      // realtime not used; keep the socket idle
      realtime: { params: { eventsPerSecond: 1 } },
    })
  : null;
