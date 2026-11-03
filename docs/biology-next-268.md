# Biology: next 268 source-referenced tasks (Book IV)

**Status: source-marker verification completed; question import NOT completed.**

This follow-up builds on Draft PR #183, which has 2,257 playable tasks from Books III–IV and 1,268 outstanding. The target is to restore 268 **whole printed tasks**, leaving 1,000 outstanding. The new entries are **not yet playable** and do not change the current counts.

The 268 candidates are enumerated by original chapter and printed task number in `docs/biology-next-268-source-review.json`. They are excluded from the current core and extended playable banks, with no duplicate IDs.

| Volume IV chapter | Selected |
| --- | ---: |
| I | 22 |
| II | 85 |
| III | 60 |
| IV | 73 |
| V | 28 |
| **Total** | **268** |

The owner-provided `kensab-4(1).pdf` matches the locked SHA-256 in the source index (`9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e`). A PyMuPDF structural check found **268 unique numbered question markers** and **zero differences** between their physical PDF pages and the indexed source pages. This does **not** establish exact wording, correct extraction of statements, answer keys or grading types.

## Remaining verification before playable restoration

1. For each task, compare the complete printed problem (including continuations, formulas and diagrams) against its prospective digital representation. Reject incomplete text.
2. Inspect the **printed answer table** and classify the actual response type (single choice / multiple selection / sequence / matching / numerical or multipart). Never coerce a complex problem into a fabricated four-choice question.
3. Verify correct grading and test navigation, avoid altering existing progress identifiers, confirm rights to publish any original text, and then update the supplement, tests, and effective coverage counts.
4. Preserve `/book/33`, `/book/34`, `/study/$bookId/$sectionId` and `/biology?book=34`.

To validate the metadata without a PDF:

```sh
node scripts/verify-biology-next-268.mjs
```

To verify the original PDF and the 268 numbered source locations locally (without uploading or committing the PDF):

```sh
python3 scripts/verify-biology-next-268-source.py /path/to/kensab-4.pdf
```

**Count integrity:** Current playable total remains 2,257; current remaining total remains 1,268. A future successfully imported and checked 268 would yield 2,525 playable and 1,000 remaining. Do not describe the target as achieved before import and review.
