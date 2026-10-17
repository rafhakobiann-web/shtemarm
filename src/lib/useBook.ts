import { useQuery } from "@tanstack/react-query";
import { loadBook } from "./books";

export function useBook(id: number) {
  return useQuery({ queryKey: ["book", id], queryFn: () => loadBook(id), staleTime: Infinity });
}
