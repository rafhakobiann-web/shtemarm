# Biology III and IV — current source-text coverage

**Status (November 11, 2026): every indexed printed exercise has an associated
source-numbered, playable text task in Shtemarm. Manual editorial verification
of all wording, answer keys, diagrams and subparts is NOT complete.**

| Volume | Indexed original tasks | Playable tasks | Missing imported IDs |
| --- | ---: | ---: | ---: |
| III, 2018 | 1,837 | 1,837 | 0 |
| IV, 2018 | 1,688 | 1,688 | 0 |
| **Total** | **3,525** | **3,525** | **0** |

The final group comprises 28 tasks in Biology III and 33 in Biology IV.
These tasks were already stored as `biology-last61-book3.json` and
`biology-last61-book4.json` and are loaded by `src/lib/books.ts` alongside
the base, extended and pending import stages. They cover multiple-choice,
matching, numbered selection and ordered-sequence exercises. Some sequences
legitimately repeat a numbered element: preserve the full printed sequence.

**Historical counts:** Earlier snapshots describing 911 questions in III,
777 in IV, or 61 remaining relate to earlier import stages, not the current
combined book. The base-file audit and `biology-pending-books.json` describe
those stages and must not be mistaken for the current catalogue total.

## Verification and source integrity

- Each exercise retains its stable `bio{volume}-s{chapter}-q{printedNumber}`
  identity so existing saved progress is not renumbered.
- The import audit checks all 3,525 unique IDs in six chapters per book, the
  original source-page mapping, the source fingerprint of the last-61 batch,
  and that the keyed answer is compatible with its response format.
- The user-supplied Biology IV PDF with SHA-256
  `9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e`
  was inspected again. Part IV, chapter I, exercise 188 was confirmed
  against its original printed answer table (page 374): the correct sequence
  contains a repeated selection, and the app's sequence control supports it.
- This is a structural and source-location audit, **not a claim of 3,525
  individually proofread answers**. The third-volume source PDF was not
  available in this session for another independent manual visual pass.
- The book page must keep its visible notice inviting reports of
  transcription errors until full editorial proofreading is done.

To audit both the initial import stage and all four merged stages:

```sh
node scripts/validate-biology-transcriptions.mjs
bunx vitest run src/test/biology-last61-originals.test.ts src/test/biology-pending-originals.test.ts
bun run build
```

The original PDFs are not distributed through this repository. No
source-book question text, answer choices or answers were fabricated as part
of this status update. Confirm redistribution rights and complete the manual
source-versus-text comparison before describing the banks as fully
source-verified.
