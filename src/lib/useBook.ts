import { useQuery } from "@tanstack/react-query";
import { loadAny } from "./books";

/** Do not repeat a missing/invalid asset request three times when the server
 * already returned a definitive response. Transient network/5xx errors may
 * still recover on a bounded retry.
 */
export function shouldRetryBookLoad(failures: number, error: unknown): boolean {
  if (failures >= 2) return false;
  if (!(error instanceof Error)) return true;
  const message = error.message;
  if (/^Book \d+ HTTP (?:400|401|403|404|410)\b/.test(message)) return false;
  if (/^Book \d+ (?:has an invalid question-bank format|returned .* not JSON)$/.test(message)) return false;
  return true;
}

export function useBook(id: number) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => loadAny(id),
    staleTime: Infinity,
    retry: shouldRetryBookLoad,
  });
}
