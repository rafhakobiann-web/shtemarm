# Biology IV: 568 source-linked self-practice tasks (not automatically graded)

This branch builds on PRs #183–#186. It enables students to practice **568 previously non-playable numbered questions from the original Biology IV PDF** directly from the existing `/book/34` page, with no new route. The student opens the panel and selects a **locally verified PDF**; source text is read in the browser and never submitted to Shtemarm.

## Actual functionality

- A fixed, source-anchored set of **568 unique pending Biology IV question numbers**: all 268 entries from PR #184 plus the 300 Biology IV entries from PR #185. No overlap with the existing core or supplement banks.
- Original question/chapter/page references and printed key-page links. Students can open their own original PDF on the correct page, even if automatic text extraction is incomplete.
- An answer field (including for multi-part questions), previous/next controls, chapter selection, and a question-position input.
- A checkbox for students to attest that they compared their response with the printed answer key; an optional local-only reviewed-state tracker.
- SHA-256 source verification and optional browser-side PDF caching. Only PDF content selected by the student is read; no PDF bytes, question text, answer tables or claimed verified answers are committed.
- All UI content in Armenian, English and Russian; lazy loading of the practice component to avoid slowing regular book browsing.
- A test confirming the 568 task identities, source pages, zero overlaps, and isolation from automatically scored book coverage.

## Explicit limitations

**These 568 exercises are self-practice, not 568 restored auto-graded question-bank items.** The original source questions' wording, complete statements, figures, response types and printed answer keys have **not** been exhaustively audited. A question may span multiple pages or require a diagram; local extraction can be incomplete. The user must consult their original page. The UI never assigns an official score, awards verified-answer XP, or increases the graded-question count.

The combined inherited baseline from PR #183 remains **2,257 playable and 1,268 pending for auto-graded source-bank import**. This PR adds a separate way for a student to work through 568 of those pending tasks without claiming completed transcription. It does not modify the original book JSON or established routes.

## Validation

```sh
bunx vitest run src/test/biology-source-practice-568.test.ts
bun run build
```

Source is the user's own hash-locked 2018 PDF. Do not merge or deploy until the automated build and device testing have passed, and publishing rights have been confirmed for any future full source-text reproduction.
