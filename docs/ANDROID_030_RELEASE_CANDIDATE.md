# Shtemarm Android 0.3.0 — candidate release notes

**Channel:** private GitHub prerelease / debug-signed device-testing APK, not Play Store or production distribution.

**Package:** `am.shtemarm.app` · **versionName:** `0.3.0` · **versionCode:** `9`.

## Changes in this candidate

- Exposes the existing 36 *original* Biology III practice questions in the native Android catalogue. Their content is **not a verified transcription** of the 2018 book.
- Adds 12 original practice questions each for Mathematics, English, Armenian History, and Biology III (**48 new questions in total**), with distinct identifiers and verified answer-option structure. These are newly authored teaching questions, **not official ԳԹԿ questions or missing book-page transcriptions**.
- Subjects' original questions are selectable in the native book catalogue. Mathematics original practice is also included in subject-wide practice while the two scored math sources retain their existing dedicated reader.
- Adds release-gating content validation for all four original banks, duplicate checks, option/answer checks, plus Biology III asset presence.
- Keeps the already merged Android backup I/O fix, existing native UI, branding and Armenian font configuration. No changes to Lovable or website Production.

## Known gaps — do not claim the banks are finished

- Mathematics: 5,676 indexed subquestions have text, but **536 legacy source-task instructions still require line-by-line wording verification** (see `docs/MATH_DEMAND_VERIFICATION.md`).
- English: the three original books include blank stems in some units; existing validation reports recoverable numbered gaps separately from unanswered/unknown stems. The dictionary's lookup coverage does **not** prove every gloss is correct.
- Armenian History: originals and sample papers are present, but a complete item-by-item comparison against source scans and keys remains pending.
- Biology: Volume 3 has 36 original practice questions plus 12 new original questions, **zero officially source-verified transcriptions**; Volume 4 is not imported.
- A complete device touch/scroll, book-loading, backup import/export, and Armenian typography pass must occur before a signed production rollout.

## APK limitations

The automated candidate uses GitHub Actions' debug keystore, which can change between builds. It is **not a guaranteed in-place update** from another installed version. Back up learner progress before testing. This build is intended for installation/testing by the repository owner only; the repository stays private. No Google Play upload, public APK download page or public redistribution is authorized by this candidate workflow.

## Release gate

The CI must run source-security checks, offline data validation, Android unit tests and debug/release builds; verify debug APK package, versionName, versionCode, signature and SHA-256 before creating the private prerelease. If any of these fail, it must **not** create a release.

No Production website deployment or Lovable action is part of this workflow.
