# Biology III–IV — final 500 source-referenced tasks

**Status: numbered source inventory complete; transcription and grading NOT complete.**

The last 500 unassigned **printed task identities** are recorded in `docs/biology-final-500-source-queue.json`. This inventory is stacked on Draft PR #185, which is stacked on #184 and #183. These source-reference queues contain **no playable question text or answers** and do not affect production.

| Biology source | Final queue | Chapters |
| --- | ---: | --- |
| III | 415 | III: 50; IV: 88; V: 43; VI: 234 |
| IV | 85 | VI: 85 |
| **Total** | **500** | No duplicates with any prior review batch |

## Coverage reconciliation

| Category | Numbered source tasks |
| --- | ---: |
| Original III + IV source inventories | **3,525** |
| Playable banks in unmerged Draft PR #183 (original core + 500 supplement) | **2,257** |
| Source references awaiting full verification in Draft PR #184 | 268 |
| Further source references awaiting verification in Draft PR #185 | 500 |
| Final source references awaiting verification in this PR | 500 |
| **All non-playable review references** | **1,268** |
| Source question numbers that remain unassigned | **0** |

**Zero unassigned source numbers is NOT zero missing playable questions.** All 1,268 tasks in the three review batches still require source-text, answer-format and answer-key review before they can be represented as completed question banks. A zero playable backlog can be claimed only after all 1,268 have been reviewed and safely imported, with all build and scoring checks passing. Biology I and II are separate and are not declared complete by this inventory.

The final 500 entries are all currently excluded as `answer-type-pending`, so they **must not** be converted mechanically into four-option questions. Preserve original subquestion groupings, separate scoring for numeric/multipart tasks, printed IDs and unchanged student routes.

## Source verification

The original supplied Biology IV PDF matches the repository's locked SHA-256. Its chapter-VI pages (312–373) contain a unique printed marker for each of the 303 indexed task numbers, including all 85 tasks in this final batch. No mismatched or missing markers were found in that chapter. This is structural source-location evidence, not complete textual or answer-key verification.

Biology III still needs its matching original PDF to verify the 415 final references independently. No copyrighted source pages, book text, or guessed answer keys are stored in this audit.

Local checks:

```sh
node scripts/verify-biology-all-source-coverage.mjs
python3 scripts/verify-biology-final-500-source.py --volume4 /path/to/kensab-4.pdf
# Add --volume3 /path/to/kensab-3.pdf once available.
```

## Remaining acceptance criteria

1. Verify complete original text and any continuations/figures for each pending printed task, along with permission to publish source material.
2. Confirm the correct response type and the printed answer key for each item; no fabricated options or guesses.
3. Build the appropriate interface/answer scoring for statement sets, ordering, matching, and especially chapter-VI multipart/numeric tasks.
4. Confirm correct source page, section and printed numbering; preserve existing progress IDs and the established student routes.
5. Update playable JSON and effective coverage counts only after successful validation. Retain Draft PRs until all required tests and device checks have passed.

**No merge, release or Production modification is authorized by completing this source inventory.**
