# Shtemarm — Phase 1 release and QA boundaries

## Project identity and environments
The product remains **Shtemarm**. Do not rename it or interact with Lovable.
This pull request does not change Vercel, Netlify, Preview or Production environment
variables or trigger a live web deployment. Keep Preview available and do not
enable `VITE_MAINTENANCE_MODE` or close Production as part of stabilization.

## Android release behavior
By the project owner's decision, both **debug and release** builds launch
`NativeShtemarm()` (the complete native study application). The old Android
release-only `RelaunchHoldingScreen()` gate introduced in PR #109 is removed.
This does **not** publish an APK. Building an unsigned release APK in CI is
only a compilation/package test, not an installable signed production release.

## Book and question content
- Existing `bio-book3.json` offers 36 **original practice** questions in six
  topic groups, **not** the official third book's transcription.
- Existing `armenian-book2.json`, `armenian-book3.json` and
  `armenian-book4.json` each offer 10 **original practice** questions.
- These 66 existing questions are now discoverable in the Android book catalog
  under clearly identified original-practice titles.
- Biology IV and the full official digitizations of the remaining books are
  **not complete**. Do not publish empty placeholders or claim official
  coverage without checking source rights, question text, illustrations and
  answer keys. The Android asset audit checks file integrity and keyed
  multiple-choice structure; it cannot certify original-book completeness.
- The mathematics reader presents unscored transcriptions separately from
  verified answer-keyed math practice.

## Required acceptance checks before merging / publishing
1. GitHub Actions: validation of all book assets, Armenian font files and OFL
   licenses, `testDebugUnitTest`, `assembleDebug`, `assembleRelease`.
2. On Android hardware: start and relaunch the app; verify debug book loads,
   changing books mid-load, topic search, exams, games, bookmarks/mistakes and
   progress backup import/export. Test offline.
3. Check Armenian font rendering in large text, study passages and long section
   titles, including accessibility and scrolling.
4. Confirm actual **signed** release behavior, data persistence and rollback
   plan before distributing the app publicly. Preview must stay available.
5. Record missing official book chapters and answer-key gaps accurately, without
   presenting original exercise sets as the GTC volumes.

Keep changes in a Draft PR until acceptance. No Production rollout has been
authorized.
