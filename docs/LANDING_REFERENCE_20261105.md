# Shtemarm — reference-inspired landing experiment (Nov 5, 2026)

## Scope and safety
This is a **separate Draft PR #219** branched from the restored teal/paper/amber design, currently targeting `main` to avoid collisions with independent updates to Draft PR #216. Nothing has been merged or deployed to Production or Lovable. This work affects only the public homepage and its scoped landing styles.

## Reference-driven design
The previous visual reference called for deep teal editorial panels, warm amber/yellow accents, paper/grid texture, bold Armenian display typography, a mobile phone with an animated island/notch and alternating sections. This implementation is **inspired by those design patterns**, not a pixel-for-pixel copy of proprietary artwork or an assertion that the original reference video can be rendered here.

The reference stylesheet, `src/landing-reference-2026.css`, loads **after** all existing appearance/Liquid Glass styles and only applies inside `.sht-editorial[data-design="reference"]`. It introduces:

- Dark-teal notebook-grid hero, gold CTA, prominent phone, editorial labeling and subtle compositor-friendly entry motion.
- Strong light/dark contrast for **every nested phone element**, with an explicitly light phone screen and dark ink regardless of the surrounding theme.
- Paper, gold, deep-teal and mint alternating storytelling sections, more readable subject/book tiles and consistent chapter headings.
- Responsive breakpoint overrides with matching specificity to defeat the previous Liquid Glass mobile CSS that left text oversized or invisible. Narrow-screen rules cover phones from 320px to tablets.
- Reduced-motion and keyboard-focus safeguards.

## Actual, honest learning interactions
In `LandingShowcase.tsx`, the public `#experience` section now offers:
- Subject tabs for math, English and Armenian with **two original illustrative questions each** (six total), localized in Armenian/English/Russian, feedback, scoring and reset.
- A three-mode **offline teacher example** (hint, explanation, try it), explicitly labeled as a demo and **not** sending any AI requests or credits.
- A responsive flashcard section with swipe **left = know**, **right = review**, accessible click buttons and a session-only review list (no data persisted, no claim of account syncing).
- Demo progress values based on the visitor's actual sample answers, not invented user achievements.

Real textbook-based guest access is a separate review in Draft PR #207, not silently merged here.

## Android and original version
The landing retains the existing website-hosted Android APK (`/downloads/shtemarm-android.apk`, older debug beta v0.1.1-beta.1), upgrade caution and install guidance. No Google Play badge is shown. The original editorial alternative remains in PR #216.

## Verification and release gate
- [x] New files committed to the separate Draft branch.
- [x] Source-level regression tests updated for the new cascade; interaction tests cover six questions, subject switching, teacher modes, flashcards and the download URL.
- [x] CSS braces and comments structurally checked; responsive specificity corrected.
- [ ] Real browser screenshot audit at 320px, 390px, tablet and desktop in light and dark modes; also accessibility keyboard and vertical-scrolling checks.
- [ ] Actual Vitest and production build logs. GitHub Actions currently fail before runner steps (#217).
- [ ] Verify Netlify preview deployment: latest provider result is **failure**, no build log available through GitHub connector.
- [ ] Vercel build blocked by provider rate limits, not an identified application error.
- [ ] Test Android APK response bytes and install on a device if making the public website change live.
- [ ] Do not merge to `main` or change Production/Lovable until these verification gates pass.

No prices, examination success rates, student counts or official question content are invented for marketing copy.
