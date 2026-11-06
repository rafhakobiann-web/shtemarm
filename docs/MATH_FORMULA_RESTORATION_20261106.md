# Math formula recovery — 2026-11-06

## Authoritative sources
Both original PDF bytes were compared with the hashes already recorded in `public/data/math-transcriptions/audit.json`:
- `matem-1`: `8c5a28bd86a0133377a7c375fb161bbf909b0dcc68685e0435767c7291d748d8`
- `matem-2`: `e344f5bd01882a5d8ac5de6dddbd7e9e3b65f124b37dc3d0f14c7368f11fa074`

This records source verification, not a claim that every printed expression is transcribed correctly.

## Completed in Draft PR #236
- Restored native SVG text glyph `n` in Part I, section 2-8, task 39.1 (PDF p.230), correcting a mistaken `m`.
- Verified 3 other tiny PDF raster-origin glyphs already represented in native SVG: degree `°` (I p.249, section 3-2, task 8.4), `f` (II p.293, section 3-4, task 40.6) and `K` (II p.306, section 3-5, task 29 stem). No duplicate raster assets added.
- Replaced 25 garbled explanation-context prompt strings with source-verified, math-delimited expressions and original question conditions. These include Part I section 2-5 tasks 1–3 (12 subquestions), Part I section 3-2 task 8 (6), Part II section 3-4 task 40 (6), and Part I section 2-8 task 39.1 (1). Original answers, options, task IDs, books and native transcription references remain unchanged.
- Added regression checks to the math transcription validator for restored glyphs, source formula identities, and question conditions.
- Existing formula renderer changes and parsing tests remain in this Draft PR.

## Repository data audit
Code-level scan of `public/data/math-text-questions.json` found:
- 5,676 questions total: Part I 2,640; Part II 3,036.
- 3,532 native vector transcriptions: Part I 1,544; Part II 1,988.
- No null/empty question records, replacement/private-use characters, or unbalanced single-dollar delimiters in the scanned prompt strings.

A heuristic review additionally flagged many flattened PDF-order math expressions in native-linked explanation prompts. Such heuristics are triage candidates, **not** proof of missing or incorrect formulas. Continue manual comparison with the original PDFs in source page/task order.

## QA / release gates
- Run `npm run validate:math`, `npm run validate:math:text`, `npm run audit:math`, `npm test`, and `npm run build`.
- Review at 320px/390px and desktop for KaTeX inline/block rendering, native SVG and explanation/AI flow.
- GitHub Actions runner availability must be verified; source checks do not substitute for executed CI tests.
- Keep Draft PR separate from live Lovable; no merge or Production deployment until QA.

## Math handbook rules (follow-up)
- Inspected the existing handbook: 47 teaching topics were present before this addition; the guide now includes **53**.
- Added six manually written, multilingual (Armenian / English / Russian) lessons in `src/lib/mathHandbookCalculus.ts`: the power/sum derivative rules, product and exponential differentiation, tangent equations, the derivative of `x|x|`, monotonicity and extrema by derivative sign, and logarithm properties.
- Each new lesson contains its rule, an illustrative worked example with three steps, a verified answer, and a common mistake. Examples are teaching examples, not individual solutions copied from the original question bank.
- The function category makes derivative lessons available within the `ՖՈՒՆԿՑԻԱՆԵՐ` sections of both workbooks; the logarithm lesson is available within `ԱՐՏԱՀԱՅՏՈՒԹՅՈՒՆՆԵՐԻ` sections.
- Wrapped two undelimited TeX formulas (and their answers) in the additional lessons. Converted the GCD/LCM and true/false logical identities into explicitly delimited KaTeX so they do not appear as literal command text.
- Expanded `src/test/math-handbook.test.ts` with category coverage, TeX delimiter checks and multilingual lesson assertions.

**Remaining checks:** Execute the test suite and inspect handbook rule cards in browser (Armenian fonts, mobile widths, all color schemes). The handbook does not yet provide an individually verified explanation for every one of the 5,676 book questions.
