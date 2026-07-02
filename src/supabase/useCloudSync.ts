import { useEffect, useRef } from 'react';
import { AppState as RNAppState } from 'react-native';
import { useApp } from '../store/AppState';
import { useAuth } from './auth';
import { supabaseEnabled } from './client';
import { pushResets, fetchResets, fetchProfile } from './sync';

/**
 * Keeps the local reset log mirrored to the signed-in user's cloud account.
 * Local AsyncStorage stays the source of truth (offline-first); this pushes
 * local rows up (idempotent upsert) and pulls any cloud-only rows down, on
 * sign-in, on app foreground, and whenever the local log changes.
 *
 * Also pulls the profile name so the UI greets the user correctly.
 */
export function useCloudSync() {
  const app = useApp();
  const { session, ready } = useAuth();
  const { hydrated, resets, mergeRemoteResets, setName, name } = app;
  const busy = useRef(false);
  const lastRun = useRef(0);
  const nameSynced = useRef(false);

  const uid = session?.user?.id ?? null;
  const sig = `${uid ?? ''}|${resets.length}|${resets[0]?.id ?? ''}|${resets[0]?.outcome ?? ''}`;

  useEffect(() => {
    if (!supabaseEnabled || !ready || !hydrated || !uid) return;

    const run = async () => {
      if (busy.current) return;
      const now = Date.now();
      if (lastRun.current && now - lastRun.current < 10_000) return;
      busy.current = true;
      lastRun.current = now;
      try {
        // pull the profile name once per session
        if (!nameSynced.current) {
          const profile = await fetchProfile();
          if (profile?.name && profile.name !== name) setName(profile.name);
          nameSynced.current = true;
        }
        // push local → cloud, then pull cloud → local
        await pushResets(resets);
        const cloud = await fetchResets();
        mergeRemoteResets(cloud);
      } catch {
        // best-effort; will retry on next trigger
      } finally {
        busy.current = false;
      }
    };

    run();
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') run();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hydrated, sig]);

  // reset the once-per-session name pull when the user changes
  useEffect(() => {
    nameSynced.current = false;
  }, [uid]);
}
