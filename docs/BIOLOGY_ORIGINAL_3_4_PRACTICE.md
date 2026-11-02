# Original Biology volumes III and IV — page-linked practice

## Actual changes in this branch (2026-11-02)
Uploaded by the Shtemarm owner: **kensab-3.pdf** and **kensab-4.pdf**, both 2018, 384 and 392 pages. PDFs **are not committed**. Their locked SHA-256 fingerprints are recorded in `public/data/biology-original-volume{3,4}-index.json`.

| Metric | Part III | Part IV | Total |
| --- | ---: | ---: | ---: |
| Original printed question/problem IDs mapped to their source page | 1,837 | 1,688 | 3,525 |
| Initial single-choice keys (answer option 1–4) indexed from printed tables | 945 | 812 | 1,757 |
| Chapters (including complex numbered exercises/problems) | 6 | 6 | 12 |
| Full original question texts copied into repository | 0 | 0 | 0 |
| Automatic grading for complex tasks | No | No | No |

**Source and numbering validation**
- The source files' contents were inspected with PyMuPDF and sample pages visually rendered.
- Part III printed question chapters start on pages **5, 62, 125, 192, 263, 296** and answers on **362**.
- Part IV chapters start on pages **5, 44, 116, 184, 269, 312** and answers on **374**.
- A continuous ID range 1..N is obtained for each chapter (individual count, not the number of task subparts).
- Two unusual printed-number punctuation positions need explicit review but are individually page-anchored: III chapter 5 #128 (p.284); IV chapter 4 #50 (p.191).
- The 1–4 answer tables were parsed by continuous printed numbered rows and limited to the initial simple-choice section. More complex answers shown as grids, lists, true/false, orderings or numeric calculations were deliberately **not guessed or flattened** into four-choice answers.
- Browser/device verification and manual inspection of every answer remain necessary.

## Student experience
`/biology/original` lets the student choose part III or IV and a chapter/question number, then opens the exact **local source PDF page**. If an answer belongs to the initial simple-choice set, student chooses 1–4 and scores against that volume's published answer key. More complex question types remain source-page navigable and can display the printed answer section, but do not claim automatic scoring.

The PDF is selected from the student's device; **SHA-256** must match that specific edition/part, or grading is disabled. Verified files may be stored locally in browser IndexedDB for a future visit. They are never sent to Shtemarm servers.

## Distinction from existing book banks
`bio-book3.json` still contains **36 clearly identified authored study problems**, not original PDF transcriptions. `bio-book4.json` is not fabricated. The new original-PDF reader is separate from the normal study/test question repository. It does not mark these original books as fully text-transcribed or add them to ordinary exam generation.

## Follow-up review
1. Verify content usage rights before redistributing the full texts or book scans.
2. Manually review answer table options for the 1,757 indexed multiple-choice tasks and test local PDFs on Android, iOS and desktop.
3. Source-check multi-answer, ordering, matching, true/false and numerical answer tables; add their response schemas one type at a time.
4. If authorized, progressively transcribe question text/diagrams with exact page and question identifiers; do not replace source questions with invented ones.

## Verification
```sh
bunx vitest run src/test/biology-original-index.test.ts src/test/biology-volume-three.test.ts
bun run build
```
