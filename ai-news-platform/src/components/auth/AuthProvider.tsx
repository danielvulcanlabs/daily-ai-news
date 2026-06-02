'use client';

import { createContext, useContext, useSyncExternalStore, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '@/lib/firebase/auth';
import type { UserProfile } from '@/types/user';
import { getUserProfile } from '@/lib/firebase/firestore';

// ── Singleton auth store ──

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

let authState: AuthState = { user: null, profile: null, loading: true };
let listeners: Set<() => void> = new Set();
let initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

function initAuthListener() {
  if (initialized) return;
  initialized = true;

  console.log('[Auth] initializing listener');

  try {
    onAuthStateChanged(async (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged:', firebaseUser ? firebaseUser.uid : 'null');

      if (firebaseUser) {
        let profile: UserProfile | null = null;
        try {
          profile = await getUserProfile(firebaseUser.uid);
          console.log('[Auth] profile loaded:', !!profile);
        } catch (err) {
          console.warn('[Auth] profile fetch failed:', err);
        }
        authState = { user: firebaseUser, profile, loading: false };
      } else {
        authState = { user: null, profile: null, loading: false };
      }

      console.log('[Auth] state:', { user: !!authState.user, loading: authState.loading });
      notify();
    });
  } catch (err) {
    console.warn('[Auth] Firebase not available:', err);
    authState = { user: null, profile: null, loading: false };
    notify();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initAuthListener();
  return () => { listeners.delete(listener); };
}

function getSnapshot(): AuthState {
  return authState;
}

// Must be a cached/stable reference — returning a new object each call triggers infinite loop
const SERVER_SNAPSHOT: AuthState = { user: null, profile: null, loading: true };

function getServerSnapshot(): AuthState {
  return SERVER_SNAPSHOT;
}

// ── Context ──

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
