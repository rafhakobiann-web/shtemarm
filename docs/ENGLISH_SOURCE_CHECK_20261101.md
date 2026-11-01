# English Section 5 — bounded source verification (2026-11-01)

**Status:** 34 imported question numbers checked against the **user-supplied** original PDF pages and the printed Section 5 answer tables. This is a limited source comparison, **not** an assertion that either whole book is complete or licensed for public redistribution.

## Source and question ranges

| Original supplied file | Printed question page | Section 5 question numbers | Printed answer table page | Verified rows |
|---|---:|---|---:|---:|
| `angl-2.pdf` | 195 | 57–61 | 329 | 5 |
| `angl-2.pdf` | 202 | 93–97 | 329 | 5 |
| `angl-3.pdf` | 172 | 102–107 | 297 | 6 |
| `angl-3.pdf` | 173 | 108–113 | 297 | 6 |
| `angl-3.pdf` | 174 | 114–119 | 297 | 6 |
| `angl-3.pdf` | 175 | 120–125 | 297 | 6 |

**Total:** 34 numbered questions. The comparisons include printed numbering, answer-letter mapping, and the question/choice texts on the indicated pages. OCR/extracted quotation marks and whitespace are not treated as meaningful differences. Source files are not checked into GitHub.

## Automated protection

`src/test/english-printed-section5-keys.test.ts` checks all 34 printed answer letters, one-to-one question numbering and presence of four non-empty choices; it also checks any existing `source_page` fields. The test does not pretend to independently compare PDFs during CI: the PDF inspection above was performed separately, and the checked-in tests preserve the examined key mapping.

The pre-existing `src/test/source-verified-book-fixes.test.ts` contains additional stricter assertions on the 11 recently restored questions from these pages.

## Remaining blockers

- English volumes I–III require page-by-page review of **all** questions, variants, numbering and answer tables; samples cannot certify full correctness.
- Confirm permission to redistribute the printed editions or extracted task content before any public publication.
- Check both website behavior and Android question rendering on actual devices, including offline, retries, accessibility and previously installed APK signatures.
- Keep the source-data change as a Draft PR until content/rights review and CI/build checks are complete.

**Do not edit unreviewed question wording or add guessed answers.**
