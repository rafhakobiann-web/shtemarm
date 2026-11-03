# Armenian language and literature — four-volume verification

Sources inspected: user-provided `hayoc-1.pdf`, `hayoc-2.pdf`, `hayoc-3.pdf`, `hayoc-4.pdf` (256 PDF pages each). The section index is in `public/data/armenian-source-index.json`. Page numbers are PDF pages, starting at 1.

## Confirmed structure

All four volumes have eight main sections:
1. Հնչյունաբանություն
2. Բառագիտություն
3. Ձևաբանություն
4. Շարահյուսություն
5. Կապակցված խոսք
6. Ընդհանուր գիտելիքներ հայոց լեզվի մասին
7. Ոճագիտություն
8. Գրականություն

The last pages of each book contain answer keys. Source page ranges were checked using PDF headings, not inferred from the site's existing practice banks.

## Current online question-bank coverage (2026-10-30)

| Volume | Authored practice questions | Online practice sections | Verified original PDF questions |
|---|---:|---:|---:|
| I | 96 | 8 | 0 |
| II | 31 | 8 | 0 |
| III | 31 | 8 | 0 |
| IV | 31 | 8 | 0 |
| **Total** | **189** | **32** | **0** |

**Important:** These are original practice exercises, not transcriptions or answer-key checks of the official PDFs. Online practice sections now have eight topic headings per volume, but the first-volume question content and the first section of volumes II–IV still need subject-level review. Volumes II–IV reuse some practice prompts; more varied, verified items are needed. Never treat matching numbers as proof of a verified source mapping.

## Next implementation tasks

- Design source-aligned practice modules for all eight topics in each volume; author new questions and independently verify each answer.
- Add per-question provenance fields such as `origin: "original-practice"`, `topic`, `verifiedBy`, `verifiedAt`, and explanation, rather than suggesting the question came from a particular official PDF page.
- For official questions, obtain appropriate distribution permission first. Do not upload substantial copyrighted PDF question text or answer keys to a public repository without authorization.
- Check exam blueprint separately against current official GTC documentation; the PDF books' historic format does not prove current exam length or structure.
- Keep `src/test/armenian-source-integrity.test.ts` and `src/test/armenian-volumes.test.ts` passing after every bank update.
