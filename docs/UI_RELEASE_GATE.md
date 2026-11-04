# Shtemarm UI release gate

This checklist documents the **human sign-off required before merging design work**.
It is not a branch-protection rule and cannot itself prevent a merge.

## Minimum automated checks
- [ ] GitHub Actions: design/appearance, mobile-navigation, landing/auth/dashboard and SEO pass.
- [ ] `src/test/responsive-shell-regression.test.ts` passes.
- [ ] App build succeeds on the selected Preview platform; deployment rate limits are not counted as success.
- [ ] Every failing check is triaged: relevant regression repaired, or unrelated blocker documented and reviewed.

## Visual and interaction acceptance
- [ ] At **320, 360, 390, 430, 768, 1024, 1280 and 1440px**: no horizontal document overflow, clipped menu, overlapped hero, or unreachable CTA.
- [ ] Public header: menu, Armenian/English/Russian, accent picker, color mode, and sign-in work at all breakpoints.
- [ ] Accent selector remains visible in **Classic, Academy and Liquid Glass**, including opaque/reduced-transparency preferences.
- [ ] Signed-in header: subject shortcuts actually open `/dashboard?subject=...`, not the public `/`.
- [ ] Mobile: tapping each of five tabs opens the correct route; swiping horizontally changes selection; vertical swipes over the dock scroll normally.
- [ ] Mobile: after a horizontal tab drag to an already-open tab, the temporary highlight returns to the actual current tab; the dock never remains stuck.
- [ ] Flashcards: **left = I know**, **right = review later**; the current question must not flip when the swipe is released.
- [ ] Flashcards: a short tap flips the card, a vertical swipe scrolls the page, and diagonal drags do not silently grade an answer.
- [ ] Switching flashcard subject, filter or topics during a swipe cancels the previous timer; no stale answer is saved.
- [ ] At reduced-motion settings, flashcard grading is instant while all buttons remain usable; test long question text on 320px and 390px phones.
- [ ] Navigation and keyboard focus have **44px or larger** usable targets where practical, and all controls have meaningful accessible names.
- [ ] Dashboard: book cards, user metrics and real progress are preserved; no placeholder data is presented as real.
- [ ] Exam setup: question source, count, timing and grading remain unchanged; no question-bank edits in this UI PR.
- [ ] Dark/light, reduced-motion, high-contrast, Android WebView/Chrome, and desktop keyboard navigation reviewed.
- [ ] Maintenance-mode and signed-in redirects verified before any Production deployment.

## Merge and deployment discipline
1. Work on a dedicated branch and open a **Draft PR**.
2. Review the Preview deployment from the exact head commit. Check small-phone and desktop screenshots.
3. Do not merge or deploy from this chat unless the user explicitly authorizes release.
4. Promote to ready-for-review only after the above checks pass; have a second person review when available.
5. Once CI and visual review pass, merge deliberately, then verify the live route and keep a rollback commit reference.

## Repository protection
For this private repository, the GitHub connector could not access branch protection and the
rulesets endpoint reported a plan restriction. The checklist is therefore **advisory only**.
A repository administrator can use GitHub Settings → Rules → Rulesets (if eligible)
to target `main`, require a pull request, require relevant status checks, block force pushes,
and restrict bypass access. **Do not make the repo public just to obtain protections**:
book/source-asset redistribution rights need separate review.

## Public try-before-sign-up experience (PR #207)
- [ ] Open `/try` as a signed-out visitor on a 320px phone, 390px Android phone, tablet and desktop.
- [ ] The landing hero and footer open the demo without an auth redirect; `/auth` remains available when ready to register.
- [ ] Switch Հայերեն / English / Русский, dark/light mode, and all three demo tabs; content and focus remain readable.
- [ ] Answer all three **illustrative** questions and review explanations; retry the demo without an account.
- [ ] Flip and swipe cards: left = known, right = review; retry missed cards in the current guest session. Vertical scroll does not mark cards.
- [ ] Complete the mini-challenge and see only labeled **sample XP**.
- [ ] Reload / leave the page: demo answers, card piles and XP must not persist to real account progress.
- [ ] Direct visits to real `/dashboard`, `/book/*`, `/exam/*` still require authorization; guest navigation does not bypass protected routes.
- [ ] Confirm reduced-motion and keyboard interaction, and check browser console for errors.
- [ ] Confirm the intended maintenance-mode behavior before making the guest experience publicly available.
