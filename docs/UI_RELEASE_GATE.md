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


### Real book previews (guest library upgrade)
- [ ] From landing, each subject card opens `/try?subject=<category>` with the matching book covers visible.
- [ ] English, mathematics, history, biology, Armenian language and physics books can be selected from the guest catalog.
- [ ] A selected book exposes **at most two answerable questions PER SECTION** from its current Shtemarm source data, with original text, choices and feedback; no fabricated fallback question is shown if a book is missing usable items.
- [ ] Each section lists its own two unlocked questions and visibly locks questions 3+ in that section. Proceeding requires answering the current question.
- [ ] Signed-out visitors who tap **Open full book** are routed through sign-in. After completing sign-in and onboarding, registered users can access the existing full book pages.
- [ ] Full mathematics books remain on `/math/books`; guest preview uses two text-based source items rather than PDF crops.
- [ ] Check that no guest responses are written to student progress or mistake storage.
- [ ] **Access control limitation:** Existing `/public/data/*.json` files are served publicly. This release gates the app interface, NOT raw JSON downloads. A truly restricted question bank requires moving full data behind authenticated server endpoints and removing public static copies. Do not represent this frontend gate as secure content protection.

### Guest section-level previews — 2026-11-04
- [ ] Every book section has a selectable tab, showing up to **two questions in that section** (not just two for the whole book).
- [ ] In English reading/cloze sections, reveal the first **two complete source texts/exercises**, with every original subquestion for each text. The third source text remains behind sign-in.
- [ ] In English grammar, sentence correction, ordering and matching sections that have no reading text, reveal two full source units (exercises), not invented passages.
- [ ] Changing sections resets transient guest answers and offers two new section-scoped exercises without leaking progress to registered accounts.
- [ ] Mathematics uses chapter+section identity; test two separate math sections and two text-transcribed answerable questions in each.
- [ ] Other subject banks reveal at most two answerable questions per section; non-MC task formats are exposed as complete tasks where relevant.
- [ ] The next three locked slots reflect the remainder of the **currently selected section**, and original full books still require sign-in.
