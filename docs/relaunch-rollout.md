# Shtemarm relaunch rollout

## Preview stays open
This branch does not touch Lovable. Vercel Preview builds must have `VITE_MAINTENANCE_MODE` unset or set to `false`. Preview URLs continue to render the actual application.

## Close public web app
After merging and testing, set `VITE_MAINTENANCE_MODE=true` in the **Production** environment only in Vercel, then redeploy Production. Do not set it for Preview or Development. Until that deployment happens, the live website is NOT closed.

The maintenance gate is a public-facing screen, not access control: static JSON assets and APIs are still accessible. Sensitive operations require server-side authorization.

## Android
Release builds display the holding screen; debuggable builds retain the full study app for testing. Existing installed versions remain unchanged until users install an updated APK. To reopen release builds, remove the release gate after the relaunch.

## Next QA phases (not yet completed)
- Profile Android startup and Compose recompositions before removing features; avoid deleting functional study tools blindly.
- Audit Armenian fonts on Android and web, accessibility and reduced-motion settings.
- Verify source-backed Biology III and other books, including diagrams and answer keys.
- Expand vocabulary with checked translations and sources, not fabricated entries.
- University guides should show admission year, source and last verification date; avoid unverified passing scores.
- Implement streaks, XP, achievements and optional daily goals without punitive mechanics.
- Test build, unit tests, Android Gradle build and production/preview routing before merging.

## Naming candidates
- **Ուսնակ** — broader study identity
- **Կրթուղի** — a learning and university pathway
- **Դիմորդ+** — applicant-focused
- **Գիտահարթակ** — all-in-one study platform

Names and domains require trademark and availability checks before rebranding.
