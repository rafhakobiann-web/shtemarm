import { useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { recordGuestAnswer, sanitizeGuestTrial } from "@/lib/guest-trial-core";

export {
  GUEST_TRIAL_LIMIT,
  isGuestTrialExhausted,
  recordGuestAnswer,
  sanitizeGuestTrial,
  sectionTrialKey,
  type GuestTrialCounts,
} from "@/lib/guest-trial-core";

const STORAGE_KEY = "shtemarm:guest-trial:v1";
export const GUEST_TRIAL_CHANGED = "shtemarm:guest-trial-changed";

export function readGuestTrial() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return sanitizeGuestTrial(raw ? JSON.parse(raw) : {});
  } catch {
    // Storage blocked or corrupt: the trial cannot persist, so treat it as unused.
    return {};
  }
}

export function bumpGuestTrial(key: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recordGuestAnswer(readGuestTrial(), key)));
    window.dispatchEvent(new Event(GUEST_TRIAL_CHANGED));
  } catch {
    // Blocked storage: the answer still counts on screen for this visit only.
  }
}

/** Answers checked for one section by a signed-out visitor, kept in sync across tabs. */
export function useGuestTrialCount(key: string): number {
  const [count, setCount] = useState(() => readGuestTrial()[key] ?? 0);
  useEffect(() => {
    const refresh = () => setCount(readGuestTrial()[key] ?? 0);
    refresh();
    window.addEventListener(GUEST_TRIAL_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(GUEST_TRIAL_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [key]);
  return count;
}

/**
 * true = signed in, false = signed out, null = unknown or sign-in unavailable.
 * Only an explicit `false` should trigger the sign-up prompt, so a slow or
 * failed auth check never locks a signed-in student out.
 */
export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    try {
      // Supabase emits INITIAL_SESSION on load, with a null session when signed out.
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setSignedIn(Boolean(session?.user));
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch {
      return undefined;
    }
  }, []);
  return signedIn;
}
