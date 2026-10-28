# Shtemarm reliability and content audit — 2026-10-28

## Changes made
- Removed global study-music dock, the study-music settings panel and its menu entry. The legacy audio implementation is no longer mounted; it remains in the repository for now until all test and asset references can be safely removed.
- Removed Focus Mode UI and its document-class toggling. The study-tools panel now shows answer progress and revision suggestions only.
- Added a local two-team, turn-taking quiz on one device. Scores are per-team and ephemeral; this is not remote/multiplayer matchmaking. Existing curated questions and explicit explanations are used.
- Increased the quick quiz request to up to 30 single-subject / 50 mixed questions. The actual number remains bounded by the unique curated bank; no duplicate padding.
- Selected the already committed WebP artwork for Biology volumes 3 and 4, still visibly locked until verified question contents are available.
- Tightened the local English explanation fallback: the mere appearance of an article or time marker is not treated as proof of an applicable grammar rule.

## Armenian History: current code review
- Files: `public/data/history-bank-book1.json`, `history-book1.json`, `history-book2.json`, `history-book3.json`, `history-tests.json`.
- Data-loading logic: `src/lib/history.ts`; configurable exam UI: `src/components/HistoryWorkspace.tsx`; session and scoring: `HistorySession.tsx`.
- The previously imported books and bank are *present*, but presence does **not** establish all questions match original editions or answer keys. Before publishing a "fully verified" status, compare every task to licensed original scans, check options, dates, names, duplicate IDs, and matching official answers.
- Test selection currently uses `selectHistoryUnits` and separates single questions out of multi-question book units. Keep whole matching/sequence tasks intact; test that the number of displayed and graded tasks matches the requested count and that completion is impossible while questions remain unanswered unless the learner explicitly submits an incomplete attempt.
- Existing historical dataset should not be overwritten blindly; source-by-source validation is required.

## Biology volumes 3 and 4: accurate status
- Covers: `public/covers/bio-3.webp` and `public/covers/bio-4.webp`.
- Missing question data: `public/data/bio-book3.json` and `public/data/bio-book4.json` are not in the repository.
- `public/data/biology-pending-books.json` records zero source-verified questions for both volumes.
- Do not unlock those books or generate purported book questions without verifiable source text and usage permission. Transcription needs audited original wording, diagrams, options and answer keys before import.

## Modernization path
The existing application uses React 19, TanStack Router/Start, TypeScript, Vite, Vitest and shared book loaders. A one-shot rewrite would risk losing thousands of imported tasks, progress persistence and route compatibility. Favor incremental, tested extraction of modules instead:
1. Source-validated book schemas and imports, with JSON validation before every deploy.
2. Centralized grading and exam state transitions, with tests for unanswered tasks, timeouts, and finishing exactly once.
3. Lazy-loaded book data per subject and stable query caches.
4. Semantic, accessible controls and smaller route components.
5. Server-only secrets, permission-aware APIs, build/lint/type checks and repeatable staging deploy checks.
6. Verified local explanations keyed to exact questions, source sections, official answers and tested teaching notes, with explicit "not yet available" otherwise.

## Verification status
Changes were written through the GitHub connector. A full local build, TypeScript check, browser test and complete PDF-to-data comparison have **not** been performed in this session; do not call the complete rewrite, History verification or Biology transcription finished.
