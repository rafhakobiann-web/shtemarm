# Additional Biology tasks

This supplement adds 500 whole printed tasks: III 277, IV 223. It includes multi-selection, ordering, numeric and single-choice problems. Combined with the core banks, III has 1,222/1,837 and IV 1,035/1,688 tasks; 1,268 remain.

The existing volume coverage files describe the core MC import. Effective coverage is that core plus biology-extended-coverage.json; supplemental IDs are disjoint and drawn from the core exclusion lists. Do not treat those historical exclusions as the current combined backlog.

Source text and printed keys were extracted from the supplied PDFs with hash checks and conservative structural filters. Visual samples were reviewed; these 500 have not all been manually proofread. PDF spacing and line-break artifacts may remain. Diagram-dependent, ambiguous, incomplete and unsupported items stay pending. The earlier individual source-review metadata does not certify this supplement.

Run python3 scripts/import-biology-extended.py SOURCE_FOLDER with PyMuPDF installed. It checks the indexed PDF SHA-256 values, extracts 304 statement/ordering tasks and selects 196 chapter-six tasks by text-fragment quality, preserving original numbering. The source PDFs are not committed.

loadBook merges the supplements before caching. Duplicate IDs or failed supplement requests fail loading so partial banks are not silently presented as complete. Tests exercise all 500 correct keys, unanswered tasks, unique IDs, coverage and mixed-format selection. No merge/deployment or browser testing is implied.
