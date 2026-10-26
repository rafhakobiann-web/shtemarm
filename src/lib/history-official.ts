export type HistoryOfficialLink = {
  title: string;
  url: string;
  kind: "paper" | "answers";
};
export type HistoryOfficialPaper = {
  id: string;
  title: string;
  date: string;
  sourceUrl: string;
  sourceLabel: string;
  status: "published" | "pending";
  links: HistoryOfficialLink[];
};
export type HistoryOfficialCatalog = {
  version: number;
  updatedAt: string;
  papers: HistoryOfficialPaper[];
};

export async function loadHistoryOfficialCatalog(subject: "history" | "biology" = "history"): Promise<HistoryOfficialCatalog> {
  const response = await fetch(`/data/${subject}-official-catalog.json`, {
    signal: AbortSignal.timeout(15000),
    cache: "no-cache",
  });
  if (!response.ok) throw new Error("Պաշտոնական նյութերի ցանկը հասանելի չէ");
  const data: HistoryOfficialCatalog = await response.json();
  if (data.version !== 1 || !Array.isArray(data.papers)) throw new Error("Անվավեր ցանկ");
  return data;
}
