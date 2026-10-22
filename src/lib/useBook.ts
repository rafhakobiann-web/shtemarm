import { useQuery } from "@tanstack/react-query";
import { loadAny } from "./books";

export function useBook(id: number) {
  return useQuery({ queryKey: ["book", id], queryFn: () => loadAny(id), staleTime: Infinity, retry: 2 });
}
