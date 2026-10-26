# Mathematics book task instruction verification · 26 October 2026

This audit checks the two original PDFs tracked at:

- `public/math/books/matem-1.pdf`
- `public/math/books/matem-2.pdf`

The PDF SHA-256 hashes are pinned in `public/data/math-transcriptions/audit.json`. The audit runs `node scripts/verify-math-demands.mjs`, comparing these original bytes against the fixed fingerprints. Results have been verified in [GitHub Actions run 40392483186](https://github.com/rafhakobiann-web/shtemarm/actions/runs/40392483186).

## Results

| Measure | Book 1 | Book 2 | Total |
| --- | ---: | ---: | ---: |
| Sections | 22 | 24 | 46 |
| Source tasks | 626 | 703 | 1,329 |
| Subquestions | 2,640 | 3,036 | 5,676 |
| Native PDF-aligned subquestions | 1,544 | 1,988 | 3,532 |
| Older plain-text subquestions | 1,096 | 1,048 | 2,144 |
| Tasks with source-extracted native instruction stems | 352 | 441 | 793 |
| Tasks still requiring exact manual wording review | 274 | 262 | 536 |
| Choice answers | 1,076 | 1,136 | 2,212 |
| Typed numeric answers | 856 | 988 | 1,844 |
| True/false answers | 708 | 912 | 1,620 |

**Automated errors: 0.** The original PDF hashes, number of indexed tasks, per-question answer type, subquestion positions, answer array lengths, source-page ranges, native-task references, shared task stems and native question bodies passed the source-integrity checks.

These checks **do not prove** that the simplified wording in all 536 older source tasks exactly matches the printed PDFs, or that every answer is mathematically correct. Source wording must be compared visually with the original pages before claiming a complete line-by-line proofreading pass.

## Correct task types

- **Chapter 1 — multiple choice:** exactly four indexed options, numeric answer codes `1`–`4`.
- **Chapter 2 — typed numeric answer:** a number such as `1`, `2`, `3` or `4` must **not** turn into a choice button merely because of its value.
- **Chapter 3 — true or false:** answers `T` or `F`, never treated as typed numbers.

The underlying books, text bank, and answer keys are unmodified by this review. In the UI, every math task now offers **«Համեմատել առաջադրանքի պահանջը գրքի բնօրինակի հետ»**, showing the exact source-book area in place only when expanded. The existing 3,532 native PDF-aligned questions continue to display their original instruction and mathematics layout.

## Verify again

```sh
bun install --frozen-lockfile
node scripts/verify-math-demands.mjs --output=/tmp/math-source-demand-audit.json
bun run validate:math
bun run validate:math:text
bunx vitest run src/test/math-demands.test.tsx src/test/math-transcriptions.test.tsx
bun run build
```

An unscheduled, PR-triggered [math demand workflow](../.github/workflows/verify-math-demands.yml) runs source integrity, unit tests and production build and attaches the full JSON warnings and error report.

## Remaining work

The **536 older task instructions** require a separate source-by-source wording review to establish exact textual equivalence; automatically passing the integrity audit must never be represented as that manual proof. New factual corrections must cite the book, chapter, section, task, subquestion and PDF page, without guessing or replacing verified source details.
