# Shtemarm — original-book coverage audit (2026-11-02)

This work adds a **read-only**, cross-subject bank inventory rather than inventing missing source content. Run `node scripts/audit-all-book-coverage.mjs` to see the indexed question and unit totals and integrity blockers. Run with `--strict` to block missing Mathematics answer/prompt records or absent expected source-bank files. The JSON report prints to stdout; no existing books are overwritten.

| Subject | Volumes | Reality / next step |
| --- | --- | --- |
| English | I–III | Existing imports present. Draft PR #152 restores 22 source-checked entries; do not double-apply. Compare remaining tasks to the respective PDF and printed keys. |
| Armenian History | I–III | Existing imports present. Draft PR #153 isolates History I source mismatch candidates; reconcile printed ID, book, section, edition and answer key before changes. |
| Mathematics | I–II | Index covers 5,676 subquestions, but that is **not** proof of PDF wording accuracy. Compare section text, formula layout and keys page-by-page. |
| Biology | I–IV | Parts I–II imported. Part III contains 36 *authored* tasks; Parts III/IV have 0 verified official transcriptions in current metadata. Draft PR #152 indexes original Part IV source chapters. |
| Physics | I–II | Original source-reviewed bank files are partial. Continue checking scans and answer tables, especially diagrams and numerical choices. |
| Armenian | I–IV | Practice material is authored rather than transcribed from official books. All 4 original volumes remain pending source/rights review. |

## Safe workflow

1. Identify exact PDF edition, printed page, section, exercise ID and answer-key page.
2. Record the gap without copying uncertain question or answer text. Never fabricate entries.
3. Only after confirming source content and redistribution permissions, update the correct isolated dataset and add a per-question regression test covering prompt, choices, key and source identity.
4. Run existing subject audits and unit tests; check web build, then device UI. Keep substantive source imports in Draft PRs until verified.
5. Never alter Lovable, Preview, Production or Android release settings as part of a data audit.

## Running the structural inventory

```sh
node scripts/audit-all-book-coverage.mjs
node scripts/audit-all-book-coverage.mjs --strict
node scripts/audit-english-source-integrity.mjs
node scripts/audit-history-books.mjs
node scripts/audit-biology-banks.mjs
npm run audit:math
```

**Limitations:** A clean structural audit does not certify that a book is complete, that stems match scanned pages, or that copyrighted content may be distributed. Existing Draft PRs are not merged in this audit.
