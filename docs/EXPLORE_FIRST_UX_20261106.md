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
