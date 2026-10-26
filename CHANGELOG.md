# 🗞️ Shtemarm — Changelog

> 📅 A dated, emoji-led record of product improvements. Incomplete work is explicitly marked as in progress.

## 🧮 October 26, 2026 — Math test improvements
- 🧩 The 65-question exam builder now loads the second transcription batch too, matching the practice-game question bank.
- 🖼️ Math practice now shows the original book-page crop when a question has not yet been transcribed, rather than displaying a misleading placeholder.
- ⚠️ Custom-test failures now show a custom-test-specific message instead of incorrectly referring to the 65-question exam.
- 🧮 Numeric answer checking now accepts reordered multi-select statement answers while rejecting duplicate selections.
- 🔁 Fixed math-game replay so previous saved answers are cleared for that round instead of silently blocking new answers.
- ❤️ Made the math game's three lives functional: the round ends when they run out and reveals the last missed answer with an explanation.
- 🧪 Added regression tests for math scoring and source-bank integrity, including section/task references, answer counts, source page images, and both transcription overlays.
- 🔎 Updated the math-bank audit to report prompt coverage across both transcription batches.
- 🚦 **Validation pending:** these new tests have been committed but have not been run successfully in this environment; the current Vercel build-rate limit remains a separate deployment blocker.

## 🟣 October 26, 2026 — English vocabulary expansion
- 📚 Added **1,104 English–Armenian dictionary entries** in two commits: 649, then 455.
- 🧹 Existing dictionary keys were excluded during those additions to reduce duplicates.
- 🛠️ Fixed a missing comma in the expanded dictionary that caused the Vercel production build to fail; a fresh deployment is still needed to confirm the build passes.
- 🧪 Fixed generated-test ordering so expanded questions return in original book/question order, and added scoring regression tests for multiple choice, numeric, set, sequence, and matching answers.
- 💾 Hardened progress saving so blocked browser storage or failed remote sync does not interrupt in-memory progress updates.
- 🚦 **Validation pending:** test execution and production build confirmation are still blocked by the current Vercel build-rate limit.
- 🔎 **Still in progress:** audit all three English books against the dictionary and calculate the exact number of untranslated forms. The new-entry count is not a verified coverage percentage.

## 🔵 October 25, 2026 — Platform usability and fixes
- 📱 Homepage and mobile-layout redesign work was recorded in the recent change set.
- ⚡ Loading/history and mini-game improvements were included in recent pull-request work.
- 🛠️ A math-books crash fix was recorded; complete math content and official-answer verification remain unfinished.

## 🟢 October 23, 2026 — Math content reconstruction
- ✍️ Started replacing screenshot-based math material with selectable text reconstructed from the supplied books.
- 🧮 The first reconstructed task was committed; complete exercise coverage and official-answer checks remain in progress.

## 🟡 October 20, 2026 — English learning tools
- 🎯 Configurable A1–C1 level-test work and English-to-Armenian vocabulary support are part of the platform's learning experience.
- 🧪 Exam-format validation, question/answer integrity checks, and durable AI explanation caching remain items to verify.

## 🧭 Current priorities
- 📖 Complete a word-by-word coverage audit for all three English books, then continue adding accurate Armenian translations.
- 🧮 Expand math exercises from both books and verify answers against the source material.
- 🧠 Verify AI explanations and caching without promising unlimited external API usage.
- 🧪 Continue regression checks for test structure, scoring, and answer integrity.
- 🗂️ Keep future entries dated, with an emoji at the start of every bullet.

