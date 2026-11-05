# Original landing design: interaction polish

Continue Draft PR #216. The owner chose to retain the original teal, paper and amber design. No Canva layout, asset or stylesheet is included in this implementation.

## Changes

- Simplify desktop navigation; keep every section accessible through the responsive menu at smaller widths.
- Close menus on outside pointer interaction or Escape, restoring focus to the menu summary on Escape. Escape also closes the phone island.
- Make phone controls, navigation controls and language buttons easier to tap. Keep menus usable at tablet widths and preserve Armenian text wrapping.
- Support horizontal touch/pen swipes between sample questions. Vertical gestures, answer buttons and links retain their normal behavior.
- Reserve room for sample-question feedback to reduce movement after answering. Keep feedback in a persistent accessible status region.
- Remove repeated scroll-driven section fades and sticky-header blur; preserve action-driven transitions and reduced-motion preferences.
- Replace the misleading “GitHub APK” hero caption with a localized device-availability caption. Existing site-hosted APK behavior remains unchanged.
- Let native FAQ accordions open one question at a time.

## Verification

Locally verified in an isolated landing harness using the actual landing components, styles and theme helpers, with router/auth/language integration adapters:

- 5 Vitest interaction tests passed across 2 files (existing sample tests plus menu, island and swipe regressions).
- Strict TypeScript check of the landing components and their local helpers passed.
- Vite client build of the isolated landing passed.

These results do not establish a full application/SSR build or deployed auth integration. Browser screenshot checks could not run: the runtime had no working Chromium binary and browser installation did not produce one. Full repository CI, exact-head Preview checks at 320/360/390/430/768/1024/1280/1440px, actual light/dark visual review and Android installation remain required before release. The CI workflow includes the new regression file.

Main, Production, Lovable and question-bank data remain unchanged.
