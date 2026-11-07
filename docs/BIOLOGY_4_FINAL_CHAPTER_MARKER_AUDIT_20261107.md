# Biology IV — verified final-chapter source locations (2026-11-07)

Source: user-uploaded `kensab-4(3).pdf`, 2018 volume IV, 392 pages, SHA-256 `9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e`. This is the exact original already locked in `public/data/biology-original-volume4-index.json`.

## Results

- Chapter VI (`Խնդիրներ`) is on PDF pp. 312–373; the indexed answer section is pp. 389–391.
- PyMuPDF page/position/font scan finds **303 uniquely located printed question-number markers out of 303 expected**, without missing or repeated markers.
- The existing final-review queue contains **85 volume-IV chapter-VI tasks**, spanning printed source pages **350–373** (23 distinct pages). The task IDs, source pages and answer-page ranges are already recorded in `docs/biology-final-500-source-queue.json`; no duplicate inventory is created.
- These 85 are **not playable**. This audit checks source identity and marker presence only, not the complete text, layout, diagrams, answer format, multi-part grading, or exact printed answers.

## Reproduction

On the stacked source-audit branch:

```sh
python3 scripts/verify-biology-final-500-source.py --volume4 /path/to/kensab-4.pdf
node scripts/verify-biology-all-source-coverage.mjs
```

The Python checker hashes the source and independently matches each of the 85 queued tasks to its bold printed-number marker on its expected source page; both commands must pass before this draft is considered reviewed. The source PDF must not be committed.

## What remains before Book IV is finished

- Verify every pending question's complete printed text, answer format and printed answer key; numeric/multipart problems cannot be converted into ordinary four-choice questions.
- Review publication rights and implementation for all remaining unplayable Volume-IV tasks across the three review queues, not only this final 85.
- Test answer scoring, question counts, route preservation and production build, then browser/mobile regression.
- Keep stacked draft PRs open; do not merge or deploy based on marker checks.
