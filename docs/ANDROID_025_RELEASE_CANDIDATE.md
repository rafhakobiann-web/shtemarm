# Shtemarm Android 0.2.5 — release candidate

**Status: unmerged candidate; not a published GitHub Release or an in-place installed-app update.**

- Android package: `am.shtemarm.app`
- Version name: `0.2.5`
- Version code: `7` (previous production-default `5`; a separate unmerged 0.2.1 proposal used `6`).
- Built from `release/android-0-2-5-candidate`, based on Liquid Glass Draft PR #127 at commit `a60046e0883f06b04eceea49e0f2a39c9ff31246`.

## Changes included in this candidate

- **Liquid Glass 2.0, initial Android Compose visual pass:** opt-in Ultra preset, additional cached rim highlights, diffuse ambient backdrop, springier floating tab selector, long-label overflow support, accessible tab semantics, backup compatibility, and three pure JUnit tests.
- **Book loading reliability:** reset stale loading indicators on book and saved-questions navigation; report saved-question loading failures separately from an empty list. Based on Draft PR #125 at `af287515cd2f6daff5f835788c2acf9e4bbefc43`.
- **Dispatcher performance:** remove the redundant whole-subject IO wrapper for non-math book aggregation; retain synchronous scored-math reader on Dispatchers.IO; do CPU-intensive deduplication on Default. Based on Draft PR #128 at `9cd9bf17e816835b4890891f942a009b10cf74e8`.
- **Android version:** `0.2.5` / `versionCode 7`.
- **CI checks:** offline content validation, math audit, unit tests, debug/release assembly, APK identity assertions, APK signature verification and SHA256 reporting.

## Explicitly not included

- True backdrop screenshot blur, runtime refraction shaders, or entire-application Liquid Glass redesign. The material is a translucent, cached optical **approximation**.
- Full question-bank transcription; existing data quality work is separate.
- Signed production/Play Store release, device-tested FPS improvement, or guaranteed in-place update from prior debug-signed APKs.
- The other open, overlapping Android PRs (#123, #126, etc.) have not been merged.

## Release gates before an actual update is distributed

- [ ] Exact candidate commit builds, unit tests and content validation succeed in GitHub Actions.
- [ ] Test the generated APK on a real device: launch, book load and cancellation, saved questions, readable Armenian, light/dark, Ultra and balanced glass, tabs/TalkBack, scroll/memory.
- [ ] Confirm all bundled book/exam material is legally distributable.
- [ ] Check existing installed APK's signing certificate fingerprint against the proposed **persistently signed** 0.2.5 APK; certificate must match for in-place updates. GitHub-hosted debug APKs may have different ephemeral debug certificates.
- [ ] Confirm the release APK is properly signed, metadata `am.shtemarm.app / 0.2.5 / 7`, and test installing over the current distributed build.
- [ ] Obtain the owner's explicit publication approval for the *verified* artifact and release channel.

**Do not overwrite the download at `public/downloads/shtemarm-android.apk` or update Production through this candidate.**
The existing 0.2.0 publishing workflow pins `versionCode=5` and must not be reused for 0.2.5. Keep Preview, production website and Lovable untouched; keep the Shtemarm name.
