import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { selectHistoryUnits, type HistoryEntry } from "@/lib/history";
import { HistorySession } from "@/components/HistorySession";
import type { Unit } from "@/lib/books";

const { addExam } = vi.hoisted(() => ({ addExam: vi.fn() }));
vi.mock("@/lib/history-progress", () => ({ useHistoryProgress: () => ({ addExam }) }));
vi.mock("@/lib/lang", () => ({
  useTx:
    () =>
    (s: string, vars: Record<string, string | number> = {}) =>
      s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? k)),
}));
vi.mock("@/components/UnitCard", () => ({
  isAnswered: (_u: any, a: any) => !!a?.mc?.["1"],
  scoreUnit: (u: any, a: any) => ({
    got: a?.mc?.["1"] === u.questions[0].answer ? 1 : 0,
    total: 1,
  }),
  UnitCard: ({ value, onChange, revealed }: any) => (
    <div>
      <span>{revealed() ? "revealed" : "hidden"}</span>
      <span data-testid="choice">{value?.mc?.["1"] ?? "none"}</span>
      {["1", "2"].map((k) => (
        <button key={k} onClick={() => onChange({ mc: { "1": k } })}>{`pick ${k}`}</button>
      ))}
    </div>
  ),
}));
const unit: Unit = {
  id: "one",
  label: "One",
  kind: "mc",
  passage: "",
  questions: [{ n: "1", stem: "Question", options: { "1": "A", "2": "B" }, answer: "2" }],
};
const entry: HistoryEntry = { unit, source: "bank", section: "a" };
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  addExam.mockClear();
});
describe("History selection", () => {
  it("uses exact unique counts and leaves the source intact", () => {
    const entries = [entry, entry, { ...entry, unit: { ...unit, id: "two" } }];
    expect(selectHistoryUnits(entries, 2, true)).toHaveLength(2);
    expect(selectHistoryUnits(entries, 2, false).map((u) => u.id)).toEqual(["one", "two"]);
    expect(entries).toHaveLength(3);
  });
  it("rejects empty, fractional and oversized exams", () => {
    for (const n of [0, -1, 1.5, 2, NaN])
      expect(() => selectHistoryUnits([entry], n, false)).toThrow();
  });
});
describe("History session", () => {
  it("keeps answers hidden and editable until confirmed submission, then records once", () => {
    render(
      <HistorySession
        units={[unit]}
        title="History"
        minutes={0}
        practice={false}
        onExit={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("pick 1"));
    expect(screen.getByText("hidden")).toBeTruthy();
    fireEvent.click(screen.getByText("pick 2"));
    expect(screen.getByTestId("choice").textContent).toBe("2");
    fireEvent.click(screen.getByText("Ավարտել և տեսնել արդյունքը"));
    expect(addExam).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Այո, ավարտել"));
    expect(addExam).toHaveBeenCalledExactlyOnceWith(1, 1);
    fireEvent.click(screen.getByText("Վերանայել պատասխանները"));
    expect(screen.getByText("revealed")).toBeTruthy();
    fireEvent.click(screen.getByText("pick 1"));
    expect(screen.getByTestId("choice").textContent).toBe("2");
  });
  it("checks practice answers only when requested", () => {
    render(
      <HistorySession units={[unit]} title="History" minutes={0} practice onExit={() => {}} />,
    );
    fireEvent.click(screen.getByText("pick 1"));
    expect(screen.getByText("hidden")).toBeTruthy();
    fireEvent.click(screen.getByText("Ստուգել պատասխանը"));
    expect(screen.getByText("revealed")).toBeTruthy();
    fireEvent.click(screen.getByText("pick 2"));
    expect(screen.getByTestId("choice").textContent).toBe("1");
  });
  it("automatically finishes at the deadline with the latest answers", () => {
    vi.useFakeTimers();
    render(
      <HistorySession
        units={[unit]}
        title="History"
        minutes={1}
        practice={false}
        onExit={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("pick 2"));
    act(() => vi.advanceTimersByTime(60000));
    expect(addExam).toHaveBeenCalledExactlyOnceWith(1, 1);
    act(() => vi.advanceTimersByTime(10000));
    expect(addExam).toHaveBeenCalledTimes(1);
  });
});
