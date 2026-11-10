# Armenian language / literature books I–IV — source audit (2026-11-06)

Source: four user-supplied 2018 exam-preparation PDFs, 256 pages each. Do not commit source PDFs to the repository.

## Verified source structure

All four volumes use these eight main headings in this order:

1. Հնչյունաբանություն
2. Բառագիտություն
3. Ձևաբանություն
4. Շարահյուսություն
5. Կապակցված խոսք
6. Ընդհանուր գիտելիքներ հայոց լեզվի մասին
7. Ոճագիտություն
8. Գրականություն

They also have a «Պնդումների փունջ» section and an answer key. The printed starting pages are:

| Volume | Eight main sections | Assertions | Answers |
| --- | --- | --- | --- |
| I | 5, 27, 49, 98, 173, 187, 189, 194 | 240 | 249 |
| II | 5, 30, 52, 74, 170, 184, 188, 202 | 243 | 250 |
| III | 5, 35, 61, 97, 169, 176, 182, 190 | 241 | 249 |
| IV | 6, 38, 69, 111, 186, 198, 203, 210 | 242 | 251 |

## Actual repository status (main at audit time)

- Volume I has dedicated official transcription files, a loader, and automated integrity tests. Its provenance is distinct from authored practice.
- `public/data/armenian-book2.json`: **10 authored practice questions** in one section; not an official transcription.
- `public/data/armenian-book3.json`: **10 authored practice questions** in one section; not an official transcription.
- `public/data/armenian-book4.json`: **10 authored practice questions** in one section; not an official transcription.
- The sample sections in II–IV do not match the official eight-section structure; they must not be described as complete.
- A full verified transcription of II–IV, and an end-to-end interactive verification of all four books, remain outstanding.

## Release gates

1. Keep authored practice visibly labeled as authored; never count it as verified official questions.
2. Build official content as separate, source-attributed section records, with stable volume/section/question IDs and printed page references.
3. Review each question and its official answer key against the provided source before publishing as verified.
4. Validate section order, duplicate IDs, missing stems/options, answer references, and missing/ambiguous OCR text.
5. Run the full test suite and check mobile question interaction before merging to production.

This audit does not claim the question banks are finished or that CI passed.
