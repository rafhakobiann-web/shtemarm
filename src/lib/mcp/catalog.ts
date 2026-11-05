import catalog from "./catalog.json";

export type CatalogSection = { n: number; title: string; units: number; questions: number };
export type CatalogBook = {
  id: number;
  subject: string;
  title: string;
  sub: string;
  dataFile: string;
  sections: CatalogSection[];
};

/** Static snapshot of every playable question book, generated from public/data. */
export const CATALOG = catalog as CatalogBook[];

export function findBook(id: number): CatalogBook | undefined {
  return CATALOG.find((book) => book.id === id);
}
