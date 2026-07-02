import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseEnabled } from './client';
import { upsertProfile } from './sync';

/**
 * Auth state for the required-sign-in flow (email/password now, Google later).
 * Sessions persist + auto-refresh via the Supabase client. Profile details
 * (name, DOB) captured at sign-up are written once a session exists — which
 * also covers the "confirm your email first" case.
 */

const PENDING_PROFILE_KEY = '@trueshift/pendingProfile';

interface PendingProfile {
  name?: string;
  dob?: string; // YYYY-MM-DD
}

interface AuthResult {
  ok: boolean;
  error?: string;
  needsConfirmation?: boolean;
}

interface AuthValue {
  ready: boolean; // finished restoring any saved session
  session: Session | null;
  user: User | null;
  configured: boolean; // supabase env present
  signUp: (email: string, password: string, profile: PendingProfile) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

function friendly(msg?: string): string {
  const m = (msg ?? '').toLowerCase();
  if (m.includes('invalid login')) return 'That email or password doesn’t look right.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'That email already has an account. Try signing in.';
  if (m.includes('password')) return 'Password must be at least 6 characters.';
  if (m.includes('email')) return 'Please enter a valid email address.';
  if (m.includes('network') || m.includes('fetch')) return 'Network problem — check your connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!supabaseEnabled); // if not configured, nothing to restore
  const [session, setSession] = useState<Session | null>(null);
  const flushing = useRef(false);

  // Write any pending sign-up profile (name/DOB) once we have a session.
  const flushPendingProfile = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      const raw = await AsyncStorage.getItem(PENDING_PROFILE_KEY);
      if (!raw) return;
      const pending: PendingProfile = JSON.parse(raw);
      await upsertProfile({ name: pending.name ?? null, dob: pending.dob ?? null });
      await AsyncStorage.removeItem(PENDING_PROFILE_KEY);
    } catch {
      // leave pending in place; we'll retry on next session event
    } finally {
      flushing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) flushPendingProfile();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) flushPendingProfile();
    });
    return () => sub.subscription.unsubscribe();
  }, [flushPendingProfile]);

  const signUp = useCallback(async (email: string, password: string, profile: PendingProfile): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: 'Accounts aren’t configured in this build.' };
    // stash profile so it's written once a session exists (covers email-confirm)
    await AsyncStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile));
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: profile.name ?? null } },
    });
    if (error) return { ok: false, error: friendly(error.message) };
    if (!data.session) {
      // email confirmation required — no session yet
      return { ok: true, needsConfirmation: true };
    }
    await flushPendingProfile();
    return { ok: true };
  }, [flushPendingProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: 'Accounts aren’t configured in this build.' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: friendly(error.message) };
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ ready, session, user: session?.user ?? null, configured: supabaseEnabled, signUp, signIn, signOut }),
    [ready, session, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
