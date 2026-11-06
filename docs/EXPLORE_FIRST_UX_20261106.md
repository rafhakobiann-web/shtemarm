# Shtemarm exploration-first UX — November 6, 2026

## Why this redesign
The old signed-in interface exposed many unrelated actions at once: books, exams, games, personal reports and a very long hamburger menu. This creates a high cognitive burden, especially on phones.

## New information architecture
- **Home** (`/dashboard`): compact personalized study introduction, six high-use subject cards, and three next-step links. No full workbook or exam catalogue shown at once.
- **Explore** (`/explore`): search across nine subject areas and seven learning tools, with separate `Subjects`, `Exams`, and `Tools` filters. The page displays the existing authenticated subject/workbook/test routes; it does **not** duplicate or change question banks. A search with no results offers a reset.
- **Exams** (`/explore#exams`): six subject entry points with a safe hash deep link that opens the Exam section even after someone previously searched for a subject.
- **Tools** (`/study-tools`): existing tools, now linked from the home, header and bottom dock. Its back links return to Explore.
- **Profile** (`/profile`): personal progress, XP, goals, detailed charts and achievements remain on a separate authenticated page.

## Navigation
- Header: five primary destinations and a small secondary menu; download, help, account, language and appearance remain available.
- Mobile: five native Link tabs, 44px+ touch targets, visible active state, swipe gesture safeguards and concise translated labels.
- Existing `/dashboard?subject=...` routes, books, exercises, tests and answer keys are not changed; the individual Armenian subject page links all four language book volumes.
- Existing `#subjects` and `#exams` Dashboard anchors still have meaningful section targets.

## Scope / non-goals
- This is a **website** navigation, dashboard and discovery redesign, not an Android-native rebuild.
- Public landing and the unfinished guest experience are separate projects; this PR does not make a private course page publicly accessible.
- Search covers subject metadata and learning tools, not every full-text question or glossary word.
- No account, progress, answer, payment or database mutations.

## QA checklist before merge
- Run the `Verify exploration-first interface` workflow (Vitest UX and regression tests, TypeScript check, production build).
- Confirm mobile widths 320px/390px, tablet and desktop in Armenian, English and Russian.
- Check real navigation on Home → subject → workbook → practice → Explore, plus Back, Exams deep link, search and no-results reset.
- Confirm keyboard focus, reduced motion, light/dark appearance and private auth protection.
- Check that all 4 Armenian books, 3 English books, 2 Math books and 4 Biology books remain accessible.
- Keep Draft until test runners and UI validation succeed; do not merge or deploy to Lovable production.

## UX continuation: subject detail + almost-full-screen explanations
- The five dashboard subject pages now share a dedicated, bordered subject header with an Explore breadcrumb and working jump to the books section. A separate link leads to the practice-exam discovery section.
- AI explanation generation in all subjects still runs through the existing server functions, official answers and offline fallback paths. No new provider, account permission or data sharing was introduced.
- The shared `RichExplanation` viewer now opens a large lesson (up to 92dvh on desktop, close to full screen on phones) with a visible border, KaTeX/validated diagrams, a step progress bar and **Previous / Next / Finish** buttons.
- Numbered AI outputs are split into their own steps, retaining introductory text, multiline algebra, source-grounded diagrams and code fences as non-executed text.
- Generic and mathematical prompts request **separate numbered steps**; the Mathematics prompt now follows the student's chosen UI language instead of always forcing Armenian.
- Model results are labeled honestly as live AI, saved AI or local offline material. Errors show as inline alerts, without opening a modal. AI explanations retain a caveat to cross-check the official key.
- Radix dialog handles focus trapping, Escape to close, scrolling and focus restoration. The smaller summary panel remains available to reopen the lesson.
- Existing answer checking, model quota limits, cache reuse and student progress are untouched.

### New verification
- `src/test/explanation-steps.test.ts`: numbered splitting across hy/en/ru, formulas, diagrams, single-step fallback and decimals.
- `src/test/rich-explanation-lesson.test.tsx`: Next/Previous/Finish/reopen, offline single-step, diagram and error behavior.
- `src/test/ai-learning.test.ts` requires localized step-by-step prompts and new fullscreen CSS.
- Updated `Verify exploration-first interface` workflow to include the above tests and TypeScript/build gates.
- **Unverified until CI runs:** mobile screenshots at 320/390px, math formula wraps, screen-reader keyboard navigation and actual AI/offline service responses.
