# Biology III & IV — next 500 source-review candidates

**This is a verified, non-overlapping *source-reference queue*, not an addition of 500 playable questions.** Nothing in this change modifies questions, answer choices, answer keys, book loading, student routes or published question counts.

This follow-up is stacked on PR #184 (268 source locations), which is stacked on PR #183 (569 restored tasks). The branch remains Draft; none of these changes are merged into Production.

| Book | Selected | Chapter distribution |
| --- | ---: | --- |
| III | **200** | Chapter I: 69, II: 82, III: 49 |
| IV | **300** | Chapter I: 11, II: 45, III: 32, IV: 38, V: 14, VI: 160 |
| **Total** | **500** | No overlap with the earlier 268 or existing playable tasks |

The explicit 500-entry manifest is in `docs/biology-next-500-source-queue.json`. Each record stores only the volume, printed chapter/question number, source page, printed answer-page range and original exclusion reason. No original source question text, diagrams, PDF pages or guessed answers are included.

The user-provided Biology IV PDF has been independently verified against its repository SHA-256. A marker scan found one unique question-number marker for **all 1,688** Biology IV indexed questions, including the 300 selected here. This verifies **locations only**, not transcriptions or answer keys. Biology III's original PDF is needed to repeat the independent scan for its selected 200 questions; only their existing source-page index is available for this branch.

```sh
node scripts/verify-biology-next-500.mjs
python3 scripts/verify-biology-next-500-source.py --volume4 /path/to/kensab-4.pdf
# Add --volume3 /path/to/kensab-3.pdf when the other original PDF is available.
```

## Actual coverage vs proposed target

- Current in the baseline Draft PR #183: **2,257 playable, 1,268 missing**.
- The earlier 268 tasks and these new 500 tasks are separate **review queues**, not imported banks.
- After full verification, permission to republish, grading implementation, and successful import of **both** queues, the **target** would become **3,025 playable and 500 missing**.
- Until then, the real count remains **2,257 playable and 1,268 missing**.

## Acceptance requirements for making each item playable

For each source task, verify full wording/continuations, format (multi-choice, multiple selection, sequence, matching, numeric or multipart), all printed responses and answer keys. Complex chapter-VI tasks should keep subquestions separate and reject uncertain numeric answers. Only publish original content where rights are established. Avoid invented questions and changing existing routes, numbering, or progress keys.

No production deployment or browser/device verification is claimed by this source audit.
