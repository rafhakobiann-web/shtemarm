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
- Inspected the existing handbook: 47 teaching topics were present before this addition; the guide now includes **59**.
- Added six manually written, multilingual (Armenian / English / Russian) lessons in `src/lib/mathHandbookCalculus.ts`: the power/sum derivative rules, product and exponential differentiation, tangent equations, the derivative of `x|x|`, monotonicity and extrema by derivative sign, and logarithm properties.
- Each new lesson contains its rule, an illustrative worked example with three steps, a verified answer, and a common mistake. Examples are teaching examples, not individual solutions copied from the original question bank.
- The function category makes derivative lessons available within the `ՖՈՒՆԿՑԻԱՆԵՐ` sections of both workbooks; the logarithm lesson is available within `ԱՐՏԱՀԱՅՏՈՒԹՅՈՒՆՆԵՐԻ` sections.
- Wrapped two undelimited TeX formulas (and their answers) in the additional lessons. Converted the GCD/LCM and true/false logical identities into explicitly delimited KaTeX so they do not appear as literal command text.
- Expanded `src/test/math-handbook.test.ts` with category coverage, TeX delimiter checks and multilingual lesson assertions.

**Remaining checks:** Execute the test suite and inspect handbook rule cards in browser (Armenian fonts, mobile widths, all color schemes). The handbook does not yet provide an individually verified explanation for every one of the 5,676 book questions.

## Full handbook / formula integrity review (2026-11-06)
- Independently cross-compared the source index against handbook section metadata: **46/46** matches, Part I 22, Part II 24. This verifies book/section/title alignment, not each individual exercise's correctness.
- Enumerated **59 unique lessons across 11 content categories** (no duplicate IDs). Each lesson includes multilingual `hy`, `en`, and `ru` title, summary, problem, step-by-step explanation, and common mistake. All 59 formulas passed basic delimiter checks.
- Fixed the solution for diluting a 10% solution: fraction `0.2/3` is about `0.0667`, so concentration is `(0.2/3)×100%≈6.67%` (corrected in Armenian, English, Russian).
- Corrected missing domain/definition notes: (D\ge0) and (a\ne0) for real quadratic roots, (a\ne0) for Vieta, and Heron's semiperimeter (p=(a+b+c)/2).
- Added six further multilingual original lessons in `src/lib/mathHandbookAdvanced.ts`: chain rule, quotient rule, sine law, cosine law, ordered arrangements, logarithm change of base. Math rule total is now **59** (previous 47 + 6 calculus + 6 advanced).
- Extended `src/test/math-handbook.test.ts` with numerical and semantic assertions for formula conditions, concentration, derivatives, Heron's formula, and the new lessons.

### Question-bank follow-up queue
A **heuristic** text-order scan found **626 possible flattened formula prompts** among existing SVG-native-linked questions: 354 in Math I (2-5: 120; 3-1: 12; 3-2: 222) and 272 in Math II (2-4: 73; 3-4: 199). These are **unconfirmed candidates**, not 626 verified broken formulas. The visual question uses the PDF-derived native SVG; the corresponding text prompt is also passed to explanations, and may have lost expression order. Source review must be done task by task before rewriting these strings.
Added `npm run audit:math:formulas` (`scripts/audit-math-formula-integrity.mjs`) to check all prompts, TeX delimiters, native references, and print a per-section manual-review queue.

### CI blocker
At the latest inspected run, handbook/rich-math/security workflows all concluded failure **without executing any steps** (GitHub job `runner_id=0`, empty `steps`, around 3 seconds). This does not establish a build failure or success. CI/run availability must be restored/verified before merge. Local full repository checkout and browser screenshot validation were unavailable in this session. Keep PR #236 Draft.
