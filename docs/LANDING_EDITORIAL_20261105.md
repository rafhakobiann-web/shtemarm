# Shtemarm landing refresh — video reference (2026-11-05)

## Brief
The owner supplied a short vertical video showing a warm Armenian exam-preparation landing experience with a dark teal hero, vivid amber sections, light paper/grid backgrounds, oversized typography and phone-style study screen previews.

This redesign **uses those general presentation patterns** with Shtemarm's own branding, original localized copy, real study routes, and original CSS mockups rather than copying a competitor's artwork, screenshots, product names, app badges or copy.

## Implemented
- Dark-teal hero with contrasting amber sign-up CTA, a visible Android APK route and interactive phone-size learning preview.
- Paper/grid section with a real client-side sample equation and feedback. Explicitly labeled as *illustrative, not an official bank question*.
- Gold study-journey section showing illustrative progress, and a dark-teal AI tutor illustration that sends **no live AI requests** and cannot exhaust provider credits.
- Website vs Android download comparison: the Android beta links directly to a **published, public GitHub Release**, not a Google Play store badge. The download page uses the same fallback source if no administrator-configured public APK is present.
- The app is labeled a **debug beta (v0.3.0-beta.4)**, with installation/update-signature caution. Existing user routes and study features are unchanged.
- Reuses current Armenian, English and Russian interface controls; the new showcase is fully translated.
- New scoped stylesheet loaded *last* on the public root. It does not restyle logged-in study screens or the separate download route.
- Reduced-motion rules, mobile breakpoints down to 320px, touch-size controls, explicit keyboard focus, and a working, non-persistent sample interaction.

## Public Android source verification
At design time, the GitHub REST releases listing identified the non-draft, published public release:
- Release: `https://github.com/rafhakobiann-web/shtemarm/releases/tag/v0.3.0-beta.4`
- APK: `https://github.com/rafhakobiann-web/shtemarm/releases/download/v0.3.0-beta.4/Shtemarm-Android-0.3.0-beta.4-Debug-Test.apk`

Do not describe this as Play Store-listed or production-signed. The version links are snapshots and should be updated on subsequent approved public releases. An administrator can provide `VITE_ANDROID_APK_URL` or the signed-off `/downloads/android-release.json` for the separate download route.

## Manual QA / safety
- [ ] Public hero, navigation, account CTA and Github APK CTA all work at 320px, 390px, tablet and desktop widths.
- [ ] The sample 3x + 5 = 14 answer has feedback for choices 2, 3, 4 and resets without authentication.
- [ ] The original swipeable phone preview can still be operated by touch/keyboard; vertical page scroll is not intercepted.
- [ ] Text is readable on dark teal and gold panels, in light, dark, high-contrast and reduced-motion themes.
- [ ] All HY/EN/RU translations in the new showcase are legible at 320px.
- [ ] Site users can sign in; beta APK opens GitHub, not Google Play; link target has a published public APK.
- [ ] `/download` still supports installable website/PWA and has no false private-invitation claim.
- [ ] Header and footer links, metadata, FAQ and book routes are unchanged.
- [ ] `bunx vitest run src/test/landing-editorial-2026.test.ts src/test/download-scroll.test.ts src/test/seo-headings-and-sharing.test.ts`, `bunx tsc --noEmit`, and `bun run build` pass before release.
- [ ] No merge or production publication until review and responsive QA.
