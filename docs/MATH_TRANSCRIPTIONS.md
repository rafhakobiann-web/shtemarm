# Mathematics transcription bank

Both mathematics books now have text for all 5,676 indexed subquestions:

| Book | Questions | Added in the completion pass |
| --- | ---: | ---: |
| matem-1 | 2,640 | 1,544 |
| matem-2 | 3,036 | 1,988 |
| Total | 5,676 | 3,532 |

The original 2,144 text entries and all official answer arrays are preserved.
`public/data/math-text-questions.json` supplies the question bank. New entries
reference section files under `public/data/math-transcriptions/`; each section
stores shared task instructions once, followed by its individual subquestions.

## Text and mathematics

The source PDFs contain legacy ARMSCII-8 Armenian and MathType symbol fonts.
The extraction script converts them to Unicode and retains source coordinates
for selectable text, fractions, radicals, superscripts, and vector accents.
The native renderer uses SVG **text** and mathematical rules, without PDF page
screenshots, rasterized question text, HTML injection, or external math services.
Detailed layouts load only for sections currently being displayed.

The six raster graphs embedded in the PDFs are redrawn from their labeled
coordinates, zeroes, and extrema as native SVG diagrams. Connecting curves are
shape-preserving illustrations of those source graphs, not asserted formulas.
Four tiny raster letter/degree glyphs are recovered as Unicode text.
The input-image inventory and PDF SHA-256 hashes are retained in `audit.json`.

Some original crop boundaries ran into subsequent tasks. Extraction uses the
PDF content sequence and explicit subquestion labels instead of those ranges.
Three duplicated/misprinted task numbers in Book 1 are aligned by source order
with the answer-key task sequence; see `numbering_corrections` in `audit.json`.
Answer mode is explicit: Chapter 1 is multiple choice, Chapter 2 typed numeric
answers, and Chapter 3 true/false. A typed answer of `1` is never an option index.

## Reproduce and validate

With the two repository PDFs available as `matem-1.pdf` and `matem-2.pdf`:

```sh
python scripts/transcribe-math-books.py --pdf-dir /path/to/source-pdfs
npm run validate:math
npm run validate:math:text
npx vitest run src/test/math-transcriptions.test.tsx
npm run build
```

The extraction requires Python, PyMuPDF, fontTools, reportlab, and `iconv`.
It fills missing rows and preserves existing transcriptions. It stops on missing
subquestion labels, count mismatches, unknown source glyphs, and empty text.
Coverage validation checks all 5,676 prompts, native references, numeric layout
values, Unicode mappings, graph references, and answer modes. These checks do
not independently prove the mathematical correctness of every official answer.
