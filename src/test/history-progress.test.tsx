import { afterEach, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useHistoryProgress } from "@/lib/history-progress";
afterEach(cleanup);
it("updates the dashboard immediately and retains previous results",()=>{
  localStorage.setItem("history-progress-v1",JSON.stringify({answers:{old:"2"},exams:[{date:"2026-01-01",correct:3,total:5}]}));
  const dashboard=renderHook(()=>useHistoryProgress());
  const session=renderHook(()=>useHistoryProgress());
  act(()=>session.result.current.addExam(8,10));
  expect(dashboard.result.current.progress.exams).toHaveLength(2);
  expect(dashboard.result.current.progress.exams[0]?.correct).toBe(8);
  expect(dashboard.result.current.progress.answers.old).toBe("2");
  act(()=>session.result.current.addExam(9,10));
  expect(dashboard.result.current.progress.exams).toHaveLength(3);
});
