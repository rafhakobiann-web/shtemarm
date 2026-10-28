# Shtemarm Android 0.1.0-beta.1

This is the **first installable beta of the native Kotlin/Jetpack Compose app**, distributed
from the private repository for testing. It is not a Google Play production release.

## Included
- Website-inspired academy design: teal hero, five-tab floating navigation,
  cards, subject book covers, and Liquid Glass appearance presets.
- Subtle / Balanced / Vivid glass styling, Classic and Academic themes,
  dark mode, larger text and custom accent colors.
- Bundled, OFL-licensed Noto Sans Armenian for UI and Noto Serif Armenian for passages.
- Local question-book browsing, verified answer checking, progress saved to this phone,
  retry incorrect questions and bookmarks.
- English passage gap-fill questions, beginner CEFR practice, supported multi-step
  exercises, mini-games, vocabulary, mathematics reader, and study tools.

## Beta limitations
- Some source question books are incomplete; biology volumes 3–4 are not claimed complete.
- Official GTC-style full exam generation, cloud account synchronization,
  visual math diagrams, AI explanations and multilingual UI are not fully implemented.
- This release is **debug-signed for private testing**. Do not publish it to Play Store.
  The debug signing key may change between CI builds; an updated APK may require
  uninstalling the previous beta. App data can be lost when uninstalling.
- Tests, estimates and study exercises are educational, not official certificates.
- Source PDFs and digitized book materials require an explicit redistribution rights
  review before public release.

## Before a production release
1. Configure a long-term Android signing keystore in secured GitHub Actions secrets.
2. Build and sign a release APK/AAB and validate update installation.
3. Finish accessibility/device testing and privacy documentation.
4. Verify legal rights to distribute the repository's textbook PDFs and question banks.
5. Check server-only API keys in the host's secret manager, rotate any exposed keys,
   and rerun current-file and historical secret scans.
