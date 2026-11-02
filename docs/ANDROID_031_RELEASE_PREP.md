# Shtemarm Android 0.3.1 / website update candidate

Status: **not released**. Changes are isolated from Production and Lovable.

## Android changes
- Version 0.3.1 (versionCode 10), retaining applicationId `am.shtemarm.app`.
- Corrected the study explanation card: only English and Mathematics link to their respective handbook. Other subjects no longer open the unrelated English grammar handbook.
- Existing offline question content and answer keys are unchanged.

## Website
- No Production or public download has been updated by this candidate.
- The website's current APK publishing workflow deliberately refuses to publish debug-signed builds, because a different debug signing key breaks in-place updates.
- The earlier AI explanations work remains isolated in Draft PR #171, not silently merged into this candidate.

## Mandatory release checks
1. Run `cd android && gradle --no-daemon testDebugUnitTest assembleDebug assembleRelease`.
2. Verify application ID, versionCode=10, versionName=0.3.1, and check installed-app certificate compatibility with the update APK.
3. Test the APK on a device (launch, subject selection, explanations, navigation, and progress persistence).
4. Verify distribution rights for bundled question content.
5. Use an approved, stable signing key and a vetted publishing workflow for website downloads.
6. Test the Vercel Preview build before merging any website changes.

Do not merge or publish until the checks pass.
