import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { Book } from "@/lib/books";
import { Route } from "@/routes/study.$bookId.$sectionId";

const state = vi.hoisted(() => ({ mode: "game", answers: {} as Record<string, number> }));
vi.mock("@tanstack/react-router", async () => {
  const React = await import("react");
  return {
    createFileRoute: () => (options: unknown) => ({ options, useParams: () => ({ bookId: "1", sectionId: "3" }), useSearch: () => ({ mode: state.mode }) }),
    notFound: () => new Error("not found"),
    Link: ({ to, params: _params, search: _search, ...props }: Record<string, unknown>) => React.createElement("a", { ...props, href: to }),
  };
});
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => vi.fn() }));
vi.mock("@/lib/explain.functions", () => ({ explainAnswer: vi.fn() }));
vi.mock("@/components/EnglishText", () => ({ EnglishText: ({ text }: { text: string }) => <span>{text}</span>, PassageTranslation: () => null }));
vi.mock("@/components/StudyTutorDrawer", () => ({ StudyTutorDrawer: () => <button>Ask tutor</button> }));
vi.mock("@/lib/lang", () => ({ useLang: () => "en", useTx: () => (s: string, vars?: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => String(vars?.[k] ?? m)) }));
vi.mock("@/lib/guest-trial", () => ({ GUEST_TRIAL_LIMIT: 3, bumpGuestTrial: vi.fn(), sectionTrialKey: () => "1:3", useGuestTrialCount: () => 0, useSignedIn: () => true }));
vi.mock("@/lib/progress", () => ({
  recordAnswer: (id: string, correct: boolean) => { state.answers = { ...state.answers, [id]: correct ? 1 : 0 }; },
  update: vi.fn(), useProgress: () => ({ answers: state.answers }),
}));
vi.mock("@/lib/unitMistakes", () => ({ recordUnitMistakes: vi.fn(), subjectForBookId: () => "english" }));
const mountain = "The portion of a mountain __________ trees cannot grow is called the tree line.";
const book: Book = { id: 1, sections: [{ n: 3, instr_en: "Choose the appropriate option.", instr_hy: "Choose", units: [
  { id: "1-3-1", kind: "mc", label: "1", passage: "", questions: [{ n: "1", stem: "First question", options: { a: "they", d: "it" }, answer: "d" }] },
  { id: "1-3-2", kind: "mc", label: "2", passage: "", questions: [{ n: "2", stem: mountain, options: { a: "there", b: "that", c: "so", d: "where" }, answer: "d" }] },
] }] };
vi.mock("@/lib/useBook", () => ({ useBook: () => ({ data: book, refetch: vi.fn() }) }));
afterEach(() => { cleanup(); state.answers = {}; vi.restoreAllMocks(); });

describe("study answer interaction through the real parent state", () => {
  it("never gives the tutor and the current practice view the same React key", () => {
    const source = readFileSync("src/routes/study.$bookId.$sectionId.tsx", "utf8");
    const match = [...source.matchAll(/<(Game|Classic|StudyTutorDrawer) key=\{`([^`]+)`\}/g)];
    expect(match.map(m => m[1])).toEqual(["Game", "Classic", "StudyTutorDrawer"]);
    expect(new Set(match.map(m => m[2])).size).toBe(3);
    expect(match.every(m => m[2]?.includes("${bookId}") && m[2]?.includes("${sectionId}"))).toBe(true);
  });

  it.each(["game", "classic"])("selects text and outer row and shows Check in %s mode", (mode) => {
    state.mode = mode;
    const Component = Route.options.component as React.ComponentType;
    const { rerender } = render(<Component />);
    if (mode === "game") {
      const first = screen.getByRole("region", { name: "First question" });
      fireEvent.click(within(first).getByText("it", { exact: true }));
      fireEvent.click(within(first).getByRole("button", { name: "Ստուգել →" }));
      // Force a parent reconciliation, as the real app does when progress updates.
      // A duplicate key must not leave orphaned, non-interactive answer rows.
      rerender(<Component />);
      expect(screen.getAllByRole("article")).toHaveLength(1);
      expect(within(first).getByRole("radio", { name: /d տարբերակը/ })).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: "Շարունակել →" }));
      expect(screen.queryByRole("region", { name: "First question" })).not.toBeInTheDocument();
    }
    const question = screen.getByRole("region", { name: mountain });
    const where = within(question).getByRole("radio", { name: /d տարբերակը/ });
    fireEvent.click(within(question).getByText("where", { exact: true }));
    expect(where).toBeChecked();
    expect(within(question).getByRole("button", { name: "Ստուգել →" })).toBeVisible();
    fireEvent.click(within(question).getByText("there", { exact: true }));
    expect(where).not.toBeChecked();
    const row = where.closest("label");
    if (!row) throw new Error("Missing answer row");
    fireEvent.click(row);
    expect(where).toBeChecked();
    expect(within(question).getByRole("button", { name: "Ստուգել →" })).toBeVisible();
    fireEvent.click(within(question).getByRole("button", { name: "Ստուգել →" }));
    expect(where).toBeChecked();
    expect(where).toBeDisabled();
  });
});