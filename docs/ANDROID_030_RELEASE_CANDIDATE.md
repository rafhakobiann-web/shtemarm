# Shtemarm Android 0.3.0 — corrected website-book candidate (beta.3)

**Status:** private, debug-signed test prerelease; not a Play Store or production-signed build.

**Package:** `am.shtemarm.app` · **versionName:** `0.3.0` · **versionCode:** `9`.

## Correction to beta.2

Beta.2 mistakenly introduced **48 newly authored substitute questions** for Mathematics, English, Armenian History, and Biology III. Those four newly introduced files have been removed from this candidate. Do **not** present beta.2 as proof that the actual missing book pages were transcribed. This update uses the same checked-in website source files, instead of generated replacement questions.

## Source content and Android behavior

- Mathematics: the website has two indexed question books with **5,676 subquestions** across `math-books-index.json` and `math-text-questions.json`. The existing native multiple-choice screen reads scored choices from those same files. The new **open-number** and **true/false** screens now read their own answer types and exact available text from those same two assets; they do not turn numerical answers into choices or invent missing text.
- English: existing `book1.json`, `book2.json`, `book3.json` remain canonical in Android. Some original blank-stem items rely on a numbered passage; unrecoverable missing stems are **not invented**. Native multi-step tasks remain available in the advanced practice screen.
- Armenian History: existing `history-book1.json`, `history-book2.json`, `history-book3.json`, `history-tests.json`, and `history-bank-book1.json` remain canonical in Android. Mixed task types are not misrepresented as single-choice questions.
- Biology: `bio-book1.json` and `bio-book2.json` remain canonical. Website Biology III has 36 **original practice** items, not verified source transcriptions, so they have **not** been unlocked as an official source book; Biology IV remains unavailable pending a verified source.
- Adds a source-data validation check for all **5,676 indexed math subquestions** and their answer types, with a guard rejecting the mistakenly added 0.3.0 author-written files.

## Incomplete, not certified

The website and Android do **not** yet have a complete, independently proofread transcription of every source page. Mathematics still needs manual review of 536 legacy task instructions; native text-only screens cannot render every rich mathematical source layout. English and Armenian History require further source-by-source checking. Biology III and IV do not have verified full source-book banks. The existence of a data row or an automated test does not prove correspondence to a printed answer key.

## Distribution and testing

CI performs security checks, JSON source validation, Android unit tests, debug/release builds, and APK package/signature/checksum validation before creating the private prerelease. GitHub's debug signing certificate can differ between builds; this is **not** an in-place upgrade guarantee. Back up study progress before installation.

The candidate release does not merge the draft PR, publish a public download, deploy Vercel, alter Lovable, or change Production. Device UI, scrolling, Armenian typography and all book sections need real-device testing.
