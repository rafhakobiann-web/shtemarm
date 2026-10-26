import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Progress = {
  answers: Record<string, 0 | 1>; // question id -> last result
  xp: number;
  streak: number; // days in a row
  lastDay: string;
  exams: { date: string; book: number; score: number; total: number }[];
  mode: "game" | "classic";
};

const KEY = "shtemaran-progress-v1";
const empty: Progress = { answers: {}, xp: 0, streak: 0, lastDay: "", exams: [], mode: "game" };
let state: Progress = empty;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

let syncTimer: ReturnType<typeof setTimeout> | undefined;
function persist() {
  // Progress must remain usable even when storage is blocked or its quota is exhausted.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Keep the in-memory copy; storage can fail in private or restricted browser contexts.
    }
  }
  subs.forEach((f) => f());
  if (typeof window !== "undefined") {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      void pushRemote().catch(() => {
        // Local progress remains available when authentication or the network is unavailable.
      });
    }, 1500);
  }
}

export function update(fn: (p: Progress) => Progress) {
  load();
  state = fn(state);
  persist();
}

const today = () => new Date().toISOString().slice(0, 10);

export function recordAnswer(id: string, correct: boolean, xp = 10) {
  update((p) => {
    const d = today();
    let streak = p.streak;
    if (p.lastDay !== d) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      streak = p.lastDay === y ? p.streak + 1 : 1;
    }
    return { ...p, answers: { ...p.answers, [id]: correct ? 1 : 0 }, xp: p.xp + (correct ? xp : 0), streak, lastDay: d };
  });
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (f) => {
      load();
      subs.add(f);
      return () => subs.delete(f);
    },
    () => {
      load();
      return state;
    },
    () => empty,
  );
}

export const level = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;
export const levelFloor = (l: number) => (l - 1) ** 2 * 50;

// ---- online sync (when signed in) ----
function merge(a: Progress, b: Progress): Progress {
  const seen = new Set(a.exams.map((e) => e.date));
  return {
    ...a,
    answers: { ...b.answers, ...a.answers },
    xp: Math.max(a.xp, b.xp),
    streak: a.lastDay >= b.lastDay ? a.streak : b.streak,
    lastDay: a.lastDay >= b.lastDay ? a.lastDay : b.lastDay,
    exams: [...a.exams, ...b.exams.filter((e) => !seen.has(e.date))].slice(-50),
  };
}

async function pushRemote() {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  await supabase.from("user_progress").upsert({ user_id: uid, data: state as never, updated_at: new Date().toISOString() });
}

export async function pullAndMerge() {
  load();
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  const { data: row } = await supabase.from("user_progress").select("data").eq("user_id", uid).maybeSingle();
  if (row?.data) state = merge(state, { ...empty, ...(row.data as unknown as Progress) });
  persist();
}
