# Biology Book III — original PDF completion audit (2026-11-07)

**Scope:** Book III only, based on the exact owner-uploaded `kensab-3.pdf` (2018 edition; 384 PDF pages; SHA-256 `adc0ddf59fa1008d6dd50f8d41583e44aa7161d2e23bc83f62b4c482e0722b93`).

## Independent scan of the supplied PDF

All **1,837 printed question-number markers** were found **exactly once** in their indexed chapter ranges. There were zero missing or duplicate markers.

| Chapter | Printed tasks | Currently playable in stacked Draft PRs | Pending source review |
| --- | ---: | ---: | ---: |
| I | 305 | 236 | 69 |
| II | 310 | 228 | 82 |
| III | 347 | 248 | 99 |
| IV | 337 | 249 | 88 |
| V | 166 | 123 | 43 |
| VI (problems) | 372 | 138 | 234 |
| **Total** | **1,837** | **1,222** | **615** |

The **372 printed Chapter VI problems** correspond to **515 separately indexed answer entries** across source pages **377–379**, comprising **110 problems with grouped subanswers** and **262 problems with one answer**. All 372 problem numbers have an entry in that answer-key section; no duplicate or malformed subanswer numbering was detected in the independent PDF scan.

These are structural/source-location checks. **They are not a guarantee of accurate question transcription, answer correctness, figures, numeric grading, or copyright permission.** In particular, 615 are still review-only source references, not playable student tasks.

## Reproduce the check without publishing the PDF

```sh
python3 -m pip install pymupdf
python3 scripts/audit-biology3-completion.py /path/to/kensab-3.pdf
```

This verifies the original PDF fingerprint and every numbered source anchor, compares all indexed source pages and all 615 review-queue pages, reconciles 1,222 playable tasks with the 615 waiting, and checks Chapter VI printed answer-key structure. It exports no answer values or original book text. For source-only verification outside a repository checkout, add `--source-only`.

The existing importer now accepts both the canonical filenames `kensab-3.pdf` / `kensab-4.pdf` and earlier numbered upload filename aliases, while retaining the strict original PDF fingerprint check. It does **not** import the 615 pending tasks automatically.

## Next gates before declaring Book III finished

1. Verify the exact text and any page continuations, symbols and necessary diagrams for the **615 pending original tasks**, with appropriate publication rights.
2. For chapter VI, preserve grouped subquestions and their independently keyed answers; never flatten them into invented single-answer tasks.
3. Integrate only fully reviewed source items into the existing Book III data structures and grading without changing routes, printed IDs or user progress keys.
4. Test full coverage, answer checking, build, mobile usability and a deployed preview before any merge. Keep all stacked PRs Draft until those gates are met.

**Current status: 1,222/1,837 playable in unmerged Draft work. Not finished or deployed.**
