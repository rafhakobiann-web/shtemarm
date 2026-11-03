export const ONBOARDING_KEY = "shtemarm:onboarding:v1";
export const ONBOARDING_CHANGED = "shtemarm:onboarding-changed";
export const ONBOARDING_SUBJECTS = ["english","math","armenian","history","biology","physics","chemistry","geography","russian"] as const;
export type OnboardingSubject = typeof ONBOARDING_SUBJECTS[number];
export type OnboardingProfile = { subjects: OnboardingSubject[]; goal: "exam" | "practice" | "review"; completedAt: string };
export function readOnboarding(userId: string): OnboardingProfile | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY + ":" + userId);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Partial<OnboardingProfile>;
    if (!Array.isArray(p.subjects) || !p.subjects.every(s => ONBOARDING_SUBJECTS.includes(s)) || !["exam","practice","review"].includes(p.goal ?? "") || typeof p.completedAt !== "string") return null;
    return p as OnboardingProfile;
  } catch { return null; }
}
export function saveOnboarding(userId: string, value: OnboardingProfile): boolean {
  if (!userId || typeof window === "undefined") return false;
  try {
    localStorage.setItem(ONBOARDING_KEY + ":" + userId, JSON.stringify(value));
    window.dispatchEvent(new Event(ONBOARDING_CHANGED));
    return true;
  } catch { return false; }
}
