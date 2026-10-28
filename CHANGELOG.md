# 🗞️ Shtemarm — Changelog

> 📅 A dated, emoji-led record of product improvements. Incomplete work is explicitly marked as in progress.

## 🟣 October 28, 2026 — Android smoothness and saved-question fix
- 📱 Android: screen changes now fade instead of snapping.
- 🎨 Android: answer choices animate their correct/wrong colours, and the session progress bar animates between questions.
- 🗂️ Android: subject lists expand and collapse with motion, and the chevron rotates.
- 🐛 Android: removing a question from the saved list no longer reloads every book and blanks the list.
- 🧪 Build verification for these changes is pending the Android debug APK workflow, because the local sandbox cannot reach the Android SDK or Gradle.

## 🟢 October 28, 2026 — Android 0.1.1 beta stability update
- 🧪 Prepared Android 0.1.1-beta.1 (versionCode 4) with automated Kotlin scoring tests.
- ✅ Prevent repeated answer taps and duplicate score/session recording.
- 📚 Load bookmarked questions directly from their source books rather than rescanning every book.
- ⚡ Cache parsed question lists and retain polished Liquid Glass transitions.
- 💾 Add local JSON progress backup and restore in Settings for future reinstallation.
- 🛠️ Improve exam, game, and study-tool question loading when a source book is missing.
- 🔐 Keep the release private; debug signatures can differ between CI runs, so upgrading from 0.1.0 may require uninstalling and losing stored progress.
- 🧾 Some question books and exam formats are still incomplete; this is a stability beta, not a production release.

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

