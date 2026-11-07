# Biology IV — source verification and safe completion work (2026-11-07)

**Original file:** owner-provided `kensab-4.pdf`, 2018 edition, 392 pages.
**Locked SHA-256:** `9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e`.

## What was actually verified

A local independent PyMuPDF scan of the exact PDF confirmed **1,688 unique printed task-number markers**, with no missing or duplicated markers in the chapter ranges. The existing unmerged Draft PR bank and review queues also partition every original task number without overlap.

| Original chapter | Indexed tasks | Playable in stacked unmerged PRs | Still pending | Source true/false/unknown bundles |
|---|---:|---:|---:|---:|
| 1. Կենդանի օրգանիզմների բազմազանությունը | 232 | 199 | 33 | 8 |
| 2. Մարդ | 300 | 170 | 130 | 99 |
| 3. Բջջի կառուցվածք, նյութափոխանակություն և էներգիա | 301 | 209 | 92 | 50 |
| 4. Բազմացում, ժառանգականություն և փոփոխականություն | 338 | 227 | 111 | 49 |
| 5. Էվոլյուցիա, էկոլոգիա և կենսոլորտ | 214 | 172 | 42 | 17 |
| 6. Խնդիրներ | 303 | 58 | 245 | 0 |
| **Total** | **1,688** | **1,035** | **653** | **223** |

All **223** of the original six-statement *«Ճիշտ է / Սխալ է / Չգիտեմ»* tasks are currently review-only, not playable. They require the original correct/incorrect matrix to be read from the printed key tables; simply assigning multi-selection answers would be incorrect.

Chapter VI has **303 numbered original problems** and **486 printed answer entries**, including **146 problems with multiple numbered subanswers** and **157 problems with a single answer**. In the current staged bank, all 146 multipart problems are still pending; the other 99 of the 245 pending Chapter VI problems are single-answer. The already staged 58 playable problems are all single-answer.

These checks are structural: *they do not demonstrate exhaustive transcription accuracy, scientific correctness, completeness of figures, or permission to republish the book text.*

## Review workflow prepared for all remaining tasks

`docs/biology4-type-review-queue.json` now identifies every one of the **653** unimported original tasks by its existing source page and printed answer-key page range. Its non-copyrighted metadata classifications are:

| Pending category | Book IV original tasks |
|---|---:|
| Six-statement true/false/unknown grid | 223 |
| Multi-part problem with independently keyed subquestions | 146 |
| Single-answer problem | 99 |
| Other task: original form and printed key still require review | 185 |
| **Total** | **653** |

This queue is **not a playable bank**, contains no wording or answers, and is not counted as completion. The CI-safe integrity script checks that its source IDs and page references match the three earlier review batches. Tasks are only eligible for migration after human source, answer and publication-rights verification.

## Implemented on the isolated Draft branch

- Added `scripts/audit-biology4-completion.py`, run locally against the original PDF to verify page count, original SHA, every printed marker, 223 three-state task identities and the Chapter VI printed answer structure. If run from the repository (without `--source-only`), it also reconciles all 653 pending source pages and the staged question banks. The script writes no book text/answer values.
- Added `scripts/verify-biology4-completion.mjs` to guard the **1,035 + 653 = 1,688** task partition and all **223** three-state items without relying on the copyrighted PDF being in CI.
- Shared `isGtcClaimsBundle` between the quiz interface and custom-test selection; legacy six-statement tasks and explicitly tagged `grading: "gtc-claims"` retain grouped +1/−1/0 score behavior and the *Չգիտեմ* option.
- Added optional `grouping: "printed-problem"` to numeric tasks. Custom tests preserve the grouped original problem and grade its individual numeric subanswers separately.
- Added regression tests for six-statement grouping, true/false/unknown scoring, and grouped numeric problems; added these checks to the Biology source and backlog workflows.

## Local reproduction

```sh
python3 -m pip install pymupdf
python3 scripts/audit-biology4-completion.py /path/to/kensab-4.pdf --source-only
# Run in the repository, with the unmerged stacked files present:
python3 scripts/audit-biology4-completion.py /path/to/kensab-4.pdf
node scripts/verify-biology4-completion.mjs
bunx vitest run src/test/biology4-claims-bundles.test.ts
```

## Still needed before Book IV can be called complete

1. Full source text, option/table, figure and answer-key review of the **653 missing original tasks**, with suitable redistribution rights.
2. Transcribe each six-statement answer grid without guessing, preserving the printed source task number and an explicit grouped grading tag.
3. For all 146 pending multipart problems, preserve individual `n.1`/`n.2`/`n.3` subanswers; do not flatten problem prompts or fabricate numeric answers.
4. Verify the full application build, tests, preview navigation, accessibility, scoring and real-device performance.
5. Merge/deploy only after the above checks succeed. Do **not** mark Book IV complete or change published counts based only on source-index verification.

**Status: 1,035 / 1,688 staged playable, 653 not playable, Draft PR only. Production unchanged.**

## 2026-11-07 follow-up — consolidated 653-task *development-preview* bank

The three independently generated drafts (223 six-statement tasks, 185
selection/matching/ordering tasks, 245 numeric problems) have been merged into
one repository file:

`src/lib/biology4-completion-653.review.json`

The consolidated file preserves the source SHA, chapter and printed question
numbers, individual answer fields and the `complete: false` status. Six
automatically detected format inconsistencies were resolved before integration:
four ordering-task answer slot counts were aligned with their printed keyed
answer lengths, and two *«Նշել սխալ պնդումները»* tasks were reclassified as
selection questions without changing their answer keys.

The combined **development-preview** book is 1,035 previously staged tasks plus
653 auto-extracted drafts = **1,688 distinct original question IDs**. There are
no source-number collisions. The preview-only import in `src/lib/books.ts`
contains a strict 653/1688 count gate. Production still loads only the
previously staged 1,035-question bank from its unmerged branches. This is not
evidence that all 1,688 tasks have been manually checked or safely published.

The old three `public/data/biology-completion-book4-*.json` files and
redundant 223-task review file were removed on this branch. The combined draft
is deliberately stored in `src/lib`, dynamically imported only when
`import.meta.env.DEV` is true. This prevents the unreviewed textbook
transcription from being served as a public static file or bundled into the
Production app.

Validation and publication gates: `src/test/biology4-completion-653-merge.test.ts`
checks the original source ID partition, answer types, grouped scoring,
source-page references, duplicate prevention and exclusion from Production.
Actual proofreading of extracted wording, symbols, diagram continuations
and printed keys, public redistribution permission, successful CI/build and
browser/device QA are still required before changing production counts or
releasing the content.
