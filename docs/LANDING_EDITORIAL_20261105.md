# Shtemarm landing refresh — responsive guest experience (2026-11-05)

## Scope and design
The user's reference informed the editorial treatment: teal hero, amber accents, paper/grid panels, readable Armenian typography and a phone-style preview. Original Shtemarm branding and copy only. All work stays in Draft PR #216; Production, Lovable and the existing exam routes are unchanged.

## Implemented
- Interactive **dynamic-island-inspired** phone notch: accessible expanded state, disclosure and a clear link to the practice sample. Phone preview retains swipe/keyboard buttons and native vertical scrolling.
- **Three answerable, original illustrative guest questions** (math, English grammar, Armenian language), localized HY/EN/RU. Users get answer feedback, next/previous navigation, score and reset without sign-in or persistence. These are NOT verbatim official textbook exercises.
- Dedicated **Try 3 questions** anchor in hero and desktop/mobile menus so guests discover the sample quickly.
- Scoped **dark-mode typography/contrast** fix: Noto Sans Armenian glyph support, less cramped headline letter spacing, legible dark navigation, FAQ and neutral cards while paper/amber sections intentionally retain dark ink.
- Compositor-friendly intro and hover motion, responsive touch feedback, native swipe behavior, optional scroll-based reveals, reduced-motion/high-contrast safeguards, and no new animation libraries or network dependencies.
- Netlify TanStack/Nitro build routing configuration remains in this PR and needs deployment-route smoke checks.

## Android APK — public-vs-private correction
**Important:** The GitHub repository is private. A GitHub release can be *published and non-draft* while still requiring repository access. Therefore it is not a reliable public download link.

The repository already contains the same-origin website APK `public/downloads/shtemarm-android.apk` and metadata `public/downloads/android-release.json` (version **0.1.1-beta.1**, 19,331,250 bytes). The redesigned landing **now links to `/downloads/shtemarm-android.apk`**, and /download loads the manifest and falls back to that on-site asset. The Android download is labeled a **debug beta**, not a signed release or Play Store listing. The website's asset version is older than the private GitHub v0.3.0-beta.4 release; do not misrepresent versions.

The developer can approve and publish a newer properly signed APK to a truly public static host later. Until then, do not rely on `github.com/rafhakobiann-web/shtemarm/releases` for unauthenticated student downloads.

## Guest book previews are separate
The requested **two original questions per section and two complete English text/exercise units per section** are implemented separately in **Draft PR #207**, not this PR. That larger guest-access PR has routing/auth implications and must be reviewed and tested before any merge. The landing's three questions are only an illustrated teaser and do not claim to complete PR #207.

## Verification and release checklist
- [x] GitHub connector confirmed the PR branch remains separate from `main`.
- [x] Website APK and metadata file exist in the repository; automated checksum and size regression added.
- [x] New source-level regressions and jsdom interaction tests committed; GitHub workflow updated to include them.
- [x] Netlify and Vercel posted successful deployment status contexts for the PR head as of the initial check.
- [ ] **GitHub Actions unavailable:** workflow runs show `failure` with **zero runner steps**, before executing tests. This cannot be treated as passing tests. Inspect account runner availability/billing/settings and rerun.
- [ ] Run `bunx vitest run src/test/landing-editorial-2026.test.ts src/test/landing-sample-interaction.test.tsx src/test/download-scroll.test.ts`.
- [ ] Run `bunx tsc --noEmit` and `bun run build`, then inspect logs.
- [ ] Mobile (320px, 390px), tablet and desktop checks: dark/light typography, expanded notch, quiz, navigation, vertical scroll, reduced motion.
- [ ] Verify public deployed `/downloads/shtemarm-android.apk` and manifest both return correct bytes (not SPA HTML/404), match SHA-256, and install on a test Android device.
- [ ] Verify Netlify / and /download runtime routes. A deploy success status alone does not prove the pages function.
- [ ] No merge or Production/Lovable publish until actual QA is complete.
