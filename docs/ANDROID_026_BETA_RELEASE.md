# Shtemarm Android 0.2.6-beta.1 — experimental visual update

**Android beta, not a finished iOS-identical design or Play Store production release.**

- `applicationId = am.shtemarm.app`
- `versionName = 0.2.6-beta.1`
- `versionCode = 8`
- Built from `release/android-0-2-6-beta-1`.
- Shtemarm name and all study features remain intact.

## Consolidated Android work

The release branch incorporates the substance of the previous related Draft PRs:
- **#125:** cancel-safe book and saved-question loading/error states.
- **#127:** native Ultra Glass highlights and spring dock foundations.
- **#128:** non-math book aggregation dispatcher improvements with scored math kept off the UI thread.
- **#129:** combined 0.2.5 beta candidate and APK identity checks; superseded by 0.2.6 build metadata.
- **#130:** transparent Scaffold dark-mode text contrast and Haze captured-backdrop blur on Android 12+.
- **#131:** experimental moving Haze source/overlay Glass Lab preview, live theme studio sliders, Aurora/Paper/Ink palettes, Noto Serif Armenian editorial headings, redesigned home card, spring dock interactions and preference backup/restore.

## What's genuine, and what isn't

Haze processes actual rendered background layers behind the glass surface in the interactive Settings lab; the preview includes moving colored source shapes that demonstrate the blur. Navigation's current captured source is mostly a static atmospheric backdrop. The surrounding UI does **not** yet reproduce Apple's full glass refraction or all iOS navigation gestures.

A real refraction shader, dynamic distortion of arbitrary scrolling content, complete redesign of every study screen, and validated smoothness on HONOR X9d are **not included**.

## Important installation warning

A GitHub Actions **debug-signed APK** is not guaranteed to install over an earlier Shtemarm debug APK. Its signing certificate can differ between CI runners, even with a larger versionCode. If installation says `INSTALL_FAILED_UPDATE_INCOMPATIBLE` or reports different signatures, **do not uninstall your existing app before exporting progress** (Settings -> Save/Restore progress) because local data could be lost. A stable, persistently signed upgrade is a separate release gate.

## Verification gates

- [ ] Exact beta commit passes repository secret/history scans, offline content checks, JUnit, Debug+Release assembly, APK manifest and signer verification.
- [ ] Test Android 12+ blur, Android 7–11 fallback, Settings/theme controls, dark/light/Armenian font, studies, backups, and app launch on a real device.
- [ ] Confirm persistent signing certificate matching for in-place upgrades before promoting an update to existing users.
- [ ] Verify book and examination source redistribution rights before a general public distribution.
- [ ] Compare user screenshots with desired material; optimize GPU after visual acceptance.

**Release channel:** Experimental beta from the private repository. Do not update the production website download link, public Play Store listing, Lovable, or website Preview. No release is considered a complete Apple-like Liquid Glass redesign.
