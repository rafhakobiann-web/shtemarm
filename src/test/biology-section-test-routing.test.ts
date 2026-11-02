import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { historyBookEntries } from "@/lib/history";
import type { Book } from "@/lib/books";

const source = (path: string) => readFileSync(path, "utf8");
const bookPage = source("src/routes/book.$bookId.tsx");
const biologyRoute = source("src/routes/biology.tsx");
const biologyBuilder = source("src/components/BiologyWorkspace.tsx");

describe("Biology section test routing regression (wrong Physics page)", () => {
  it("opens the Biology exam builder with the selected book and section from all four book parts", () => {
    const card = bookPage.split('className="mt-auto grid grid-cols-3 gap-2">')[1] ?? "";
    expect(card).toContain('id >= 31 && id <= 34 ? (');
    expect(card).toContain('to="/biology" search={{ book: id, section: s.n }}');
    expect(card.indexOf('id >= 31 && id <= 34 ? (')).toBeLessThan(
      card.indexOf('params={{ subject: "physics" }} search={{ section: s.n }}'),
    );
    expect(bookPage).toContain('to="/biology" search={{ book: id }}');
  });

  it("never falls back to Physics for other unrelated textbooks", () => {
    const card = bookPage.split('className="mt-auto grid grid-cols-3 gap-2">')[1] ?? "";
    expect(card).toContain('id >= 21 && id <= 23 ? (');
    expect(card).toContain('to="/history"');
    expect(card).toContain('id === 63 || id === 64 ? (');
    expect(card).toContain('to="/physics/original"');
    expect(card).toContain('id === 61 || id === 62 ? (');
    expect(card).toContain('to="/study/$bookId/$sectionId"');
    // The last branch must be a subject-neutral learning screen, not Physics.
    expect(card).not.toMatch(/\) : \(\s*<Link to="\/subject\/\$subject" params=\{\{ subject: "physics" \}\}/);
  });

  it("accepts only real Biology books and positive numbered sections in URL search", () => {
    expect(biologyRoute).toContain('validateSearch: z.object({');
    expect(biologyRoute).toContain('book: z.coerce.number().int().min(31).max(34).optional().catch(undefined)');
    expect(biologyRoute).toContain('section: z.coerce.number().int().positive().optional().catch(undefined)');
    expect(biologyRoute).toContain('initialBook={book} initialSection={section}');
    const schema = z.object({
      book: z.coerce.number().int().min(31).max(34).optional().catch(undefined),
      section: z.coerce.number().int().positive().optional().catch(undefined),
    });
    expect(schema.parse({book: "33", section: "1"})).toEqual({book: 33, section: 1});
    expect(schema.parse({book: "34", section: "5"})).toEqual({book: 34, section: 5});
    expect(schema.parse({book: "61", section: "-1"})).toEqual({book: undefined, section: undefined});
  });

  it("only preselects the requested book and exact section, never an unrelated book's label", () => {
    expect(biologyBuilder).toContain('initialBook && initialBook >= 31 && initialBook <= 34');
    expect(biologyBuilder).toContain('source !== `book-${initialBook - 30}`');
    expect(biologyBuilder).toContain('entry.unit.id.startsWith(idPrefix)');
    for (const id of [33,34]) {
      const data = JSON.parse(source(`public/data/bio-book${id - 30}.json`)) as Book;
      const entries = historyBookEntries(data, id - 30);
      const firstSection = data.sections[0]!;
      const prefix = `book-${id - 30}:${firstSection.n}:`;
      const selected = entries.filter(e => e.unit.id.startsWith(prefix));
      expect(selected.length, `Book ${id} must have source questions`).toBeGreaterThan(0);
      expect(selected.every(e=>e.source === `book-${id - 30}`)).toBe(true);
      expect(selected.every(e=>e.unit.id.startsWith(prefix))).toBe(true);
    }
  });
});
