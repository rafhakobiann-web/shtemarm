import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { isOpenTask, isOptionAnswer, isRight, useMathProgress } from "@/lib/math-progress";

describe("math answer handling", () => {\n  beforeEach(() => localStorage.clear());
  it("normalizes numeric formatting without changing the value", () => {
    expect(isRight("1 200", "1200")).toBe(true);
    expect(isRight("1,5", "1.5")).toBe(true);
    expect(isRight("−3", "-3")).toBe(true);
    expect(isRight("1,5", "1.6")).toBe(false);
  });

  it("accepts statement selections in any order", () => {
    expect(isRight("1,3,5", "5, 3, 1")).toBe(true);
    expect(isRight("1,2,3,6", "6,3,2,1")).toBe(true);
  });

  it("rejects missing or repeated statement selections", () => {
    expect(isRight("1,3,5", "1,3")).toBe(false);
    expect(isRight("1,3,5", "1,3,3,5")).toBe(false);
    expect(isRight("1,3,5", "1,3,4")).toBe(false);
  });

  it("keeps option labels distinct from typed-answer tasks", () => {
    expect(isOptionAnswer("2")).toBe(true);
    expect(isOptionAnswer("T")).toBe(true);
    expect(isOptionAnswer("45")).toBe(false);
    expect(isOpenTask({ answers: ["1", "2", "3"] })).toBe(false);
    expect(isOpenTask({ answers: ["1", "45", "3"] })).toBe(true);
    expect(isOpenTask({ answers: null })).toBe(false);
  });

  it("clears saved answers when replaying a math section", async () => {
    const { result } = renderHook(() => useMathProgress());
    await waitFor(() => expect(result.current.progress.answers).toEqual({}));
    act(() => result.current.setAnswer("matem-1:1:1:1:1", "2"));
    expect(result.current.progress.answers["matem-1:1:1:1:1"]).toBe("2");
    act(() => result.current.clearAnswers(["matem-1:1:1:1:1"]));
    expect(result.current.progress.answers["matem-1:1:1:1:1"]).toBeUndefined();
    expect(JSON.parse(localStorage.getItem("math-progress-v1") ?? "{}").answers).toEqual({});
  });
});
