# Biology III and IV: source text integration

The owner-supplied 2018 PDFs now supply real text questions to the standard
book, study and configurable test pages. No PDF selection or question images
are required for these imported tasks. Saved `/biology/original?volume=3|4`
links redirect to books 33 and 34 respectively.

| Part | Text MC questions | Remaining printed tasks |
| --- | ---: | ---: |
| III | 910 | 927 |
| IV | 771 | 917 |

This is a partial transcription, not a completed book. Printed question numbers
are preserved, including gaps where tasks await review. Every imported question
has its original source page, four text options, and its existing printed answer
key. Chapters without imported tasks are omitted from the playable section list.
The authored starter bank is archived as `bio-authored-book3.json` and no longer
appears as the original third volume.

`biology-volume{3,4}-coverage.json` accounts for every indexed task as imported
or excluded. Exclusions include complex answer types, figures, subscript/formula
layout, unreadable encodings and incomplete option extraction. No guessed
questions, missing choices, or fabricated answers enter the test pool. Neither
the source PDFs nor screenshots are committed. Full manual proofreading remains
unfinished; the existing `verifiedQuestions: 0` records that distinction.

Reproduce with PyMuPDF:

```sh
python scripts/import-biology-source.py /path/to/kensab-3.pdf /path/to/kensab-4.pdf
node scripts/validate-biology-transcriptions.mjs
```

The importer rejects PDFs whose SHA-256 differs from the locked source index.
The validator checks all imported keys, pages, distinct identities, four options,
encoding hygiene, and exhaustive imported/excluded coverage. Integration tests
exercise the shared question selection pipeline and reject unavailable counts.
The dedicated GitHub workflow also runs the production build.

Next work: review the excluded 1-of-4 tasks, then transcribe and check the complex
answer types and chapter VI problems. Device/browser checks and complete manual
comparison are still needed.
