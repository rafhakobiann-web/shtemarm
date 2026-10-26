import { HistoryWorkspace } from "@/components/HistoryWorkspace";

/** Retains the sample-exam entry point with configurable settings. */
export function HistoryExam({ testId }: { testId: number }) {
  return <HistoryWorkspace key={testId} initialTest={testId} />;
}
