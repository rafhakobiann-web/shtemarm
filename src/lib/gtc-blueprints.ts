/**
 * GTC 2026–2027 official examination formats.
 * "answerSlots" counts response cells; taskCount counts numbered tasks.
 * Never interpret question count as score, or assert practice-bank tasks are
 * GTC-compliant without validating their precise structural slot type.
 * Sources: https://escs.gov.am/guide (official GTC guide PDFs).
 */
export type ExamType = "choice" | "short" | "claims";
export type BlueprintPart = {
  name: string;
  slots: ReadonlyArray<{ type: ExamType; count: number }>;
  points: number;
};
export type ExamBlueprint = {
  name: string; year: number; guide: string;
  taskCount: number; maxPoints: number; minutes: number;
  parts: ReadonlyArray<BlueprintPart>;
  note?: string;
};

const language = "https://escs.gov.am/api/assets/68a6827e-4608-4d90-9bc5-3304a692d0c5";
const history = "https://escs.gov.am/api/assets/a74c9ba6-5891-4623-bd68-bf3a8688846d";
const biology = "https://escs.gov.am/api/assets/53efbc2e-cbb3-41ef-bd52-8d6ea8db1f21";
const chemistry = "https://escs.gov.am/api/assets/be964760-4089-44f2-ab86-d7a55fbc0eb4";
const geography = "https://escs.gov.am/api/assets/c499c5d1-b31c-4c4e-b1fe-d2592048559d";
const physics = "https://escs.gov.am/api/assets/450eea81-2913-4e3d-98ca-469db7da00ab";
const russian = "https://escs.gov.am/api/assets/771ee0db-d139-4b2b-b946-6c814d9a5964";
const slots = (type: ExamType, count: number) => ({ type, count });
export const GTC_BLUEPRINTS = {
  armenian: {
    name: "Հայոց լեզու և հայ գրականություն", year: 2027, guide: language,
    taskCount: 70, maxPoints: 80, minutes: 180,
    parts: [
      { name: "Ա մակարդակ · 1–45", points: 50, slots: [slots("choice", 34), slots("short", 10), slots("claims", 1)] },
      { name: "Բ մակարդակ · 46–70", points: 30, slots: [slots("choice", 12), slots("short", 12), slots("claims", 1)] },
    ],
    note: "70 առաջադրանք, ոչ թե 80։ Ա և Բ մակարդակներում մեկական վեց պնդում պարունակող առաջադրանք կա։",
  },
  history: {
    name: "Հայաստանի պատմություն", year: 2027, guide: history,
    taskCount: 70, maxPoints: 80, minutes: 180,
    parts: [
      { name: "Ա մակարդակ · 1–45", points: 50, slots: [slots("choice", 34), slots("short", 10), slots("claims", 1)] },
      { name: "Բ մակարդակ · 46–70", points: 30, slots: [slots("choice", 12), slots("short", 12), slots("claims", 1)] },
    ],
  },
  biology: {
    name: "Կենսաբանություն", year: 2027, guide: biology,
    taskCount: 70, maxPoints: 80, minutes: 180,
    parts: [{ name: "Քննական թեստ · 1–70", points: 80, slots: [slots("choice", 40), slots("short", 28), slots("claims", 2)] }],
  },
  chemistry: {
    name: "Քիմիա", year: 2027, guide: chemistry,
    taskCount: 70, maxPoints: 80, minutes: 180,
    parts: [{ name: "Քննական թեստ · 1–70", points: 80, slots: [slots("choice", 40), slots("short", 28), slots("claims", 2)] }],
    note: "Ուղեցույցում նշված են 57 հիմնական առաջադրանք և 70 համարակալված պատասխանային դիրք։",
  },
  geography: {
    name: "Աշխարհագրություն", year: 2027, guide: geography,
    taskCount: 70, maxPoints: 80, minutes: 180,
    parts: [{ name: "Քննական թեստ · 1–70", points: 80, slots: [slots("choice", 55), slots("short", 13), slots("claims", 2)] }],
  },
  physics: {
    name: "Ֆիզիկա", year: 2027, guide: physics,
    taskCount: 70, maxPoints: 80, minutes: 180,
    parts: [{ name: "Պատասխանների համարակալում · 1–70", points: 80, slots: [slots("choice", 40), slots("short", 28), slots("claims", 2)] }],
    note: "55 հիմնական խնդիր՝ 70 համարակալված առաջադրանքով/ենթաառաջադրանքով։",
  },
  russian: {
    name: "Ռուսաց լեզու", year: 2027, guide: russian,
    taskCount: 80, maxPoints: 80, minutes: 150,
    parts: [{ name: "Քննական թեստ · 1–80", points: 80, slots: [slots("choice", 52), slots("short", 28)] }],
  },
} as const satisfies Record<string, ExamBlueprint>;

export type GuideSubject = keyof typeof GTC_BLUEPRINTS;
export function answerSlots(blueprint: ExamBlueprint) {
  return blueprint.parts.flatMap((part) => part.slots.flatMap(({ type, count }) => Array<ExamType>(count).fill(type)));
}
export function assertBlueprint(blueprint: ExamBlueprint) {
  const types = answerSlots(blueprint);
  if (types.length !== blueprint.taskCount) throw new Error("Invalid GTC slot count");
  const earned = types.reduce((sum, type) => sum + (type === "claims" ? 6 : 1), 0);
  if (earned !== blueprint.maxPoints) throw new Error("Invalid GTC score breakdown");
  if (blueprint.parts.reduce((s, p) => s + p.points, 0) !== blueprint.maxPoints) throw new Error("Invalid GTC part score");
  return true;
}
