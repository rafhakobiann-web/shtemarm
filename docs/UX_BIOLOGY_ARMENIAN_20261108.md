# Shtemarm: UI/performance, Biology and Armenian continuation (2026-11-08)

**Integration base: current `main`, not the older November 3 Biology branch.**
All changes are held in a Draft PR until checks pass. No deployment requested or performed.

## UX and rendering performance

- Restyled exploration-first Home/Explore/subject surfaces with restrained theme-aware accent gradients, consistent card borders, focus and hover states, 320px-safe sizing and larger usable hit targets.
- The interactive public landing **starts with an immediate math practice example**, without loading the three English question-bank JSON files on mount. The English demo uses two original sample questions while loading the real book content **only after a user selects English**. It retains a fallback and a retry action, and keeps the loaded bank cached across tab switches.
- Below-the-fold landing sections opt into `content-visibility:auto` and intrinsic size hints; hover transitions are restricted to hover-capable devices and expensive glass effects are avoided on touch hardware. Reduced motion and high-contrast settings remain supported. No dependency or service worker changes.
- No quantified speed-up is claimed until Chrome Performance/Lighthouse and real Android browser checks are completed.

## Armenian I–IV

All four owner-provided 2018 exam-preparation PDFs are 256 pages. The table-of-contents structure was checked against originals, and the following source metadata was added to `public/data/armenian-source-index.json`:

| Volume | Eight chapter-start pages | Assertions appendix | Answers begin |
|---|---|---|---|
| I | 5, 27, 49, 98, 173, 187, 189, 194 | 240 | 249 |
| II | 5, 30, 52, 74, 170, 184, 188, 202 | 243 | 250 |
| III | 5, 35, 61, 97, 169, 176, **182**, 190 | 241 | 249 |
| IV | 6, 38, 69, 111, 186, 198, 203, 210 | 242 | 251 |

A stale Volume III stylistics page 181 was corrected to **182**. Source PDF SHA-256 fingerprints, chapter-end pages, appendix and answer-page starts are now tracked. `scripts/verify-armenian-original-sources.py` verifies those facts against the four files without exporting copyrighted question text.

Each Armenian workbook page now has an optional expandable **eight-chapter source navigator** with its real page ranges and truthful readiness. It links to an interactive chapter only when a matching content section is present, rather than confusing the II–IV Shtemarm-authored starter practice with verified official questions.

**Content limitation:** Book I's active `loadArmenianOriginalBook()` reads its dedicated official-source dataset; the Book I starter file is not the complete active source bank. Books II–IV still have Shtemarm-created starter exercises, not full original transcriptions. The source navigation does not mark their missing official questions playable.

## Biology III–IV reconciliation

The old source-review branches and current `main` have diverged by hundreds of commits. To avoid overwriting the latest web UX, this PR **does not merge the older repository tree** or expose unreviewed PDF transcriptions.

Instead, `docs/biology-main-draft-transition-20261108.json` reconciles **every original printed task ID** against:
- current-main playable questions;
- additional staged tasks in the Biology review branch;
- source-review-only candidates (not completed).

| Book | Original | Current-main playable | Staged in other branch | Still source-review-only |
|---|---:|---:|---:|---:|
| III | 1,837 | 945 | 277 | 615 |
| IV | 1,688 | 777 | 258 | 653 |

Every missing-on-main task is indexed to an original chapter and PDF page. No original question text, illustrations or answer values are copied into the new manifest. The Biology subject page now shows **available vs. staged vs. review-only** with progress bars and correct current counts, not a misleading 100% published completion.

The previous 653-task consolidated Biology IV transcription remains in its own separate PR stack pending content proofreading, answer validation, publication rights and integration testing. This development change **does not** add unverified textbook text to production.

## Verification and release gates

- `src/test/armenian-biology-performance-20261108.test.ts` checks all four Armenian book outlines, source editions, exact Biology status totals, dashboard presentation, and the on-demand landing requests.
- `.github/workflows/verify-ux-armenian-biology-20261108.yml` runs focused Vitest tests, TypeScript and a production build without deploying.
- Before releasing, inspect 320px / 390px Android and desktop, light and dark, high contrast, opening Armenian II–IV starter practice, Biology 3/4 live counts, and switching landing demo subjects during slow network fetches.
- Performance must be measured with and without cache; no numerical speed gain is assumed. The full Armenian II–IV original question import and Biology draft publication remain separate unfinished work.

**No production mutation and no automatic merge/deploy.**
