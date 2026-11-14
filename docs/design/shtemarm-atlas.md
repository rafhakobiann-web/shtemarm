# Shtemarm Atlas — experimental design system (not the default theme)

**Status:** Draft-only exploration in PR #276. The existing Shtemarm theme remains the default and production must not change without explicit approval.

## Product premise
Atlas is not a generic SaaS dashboard skin. It is an editorial study instrument: questions are the main content, progress is a quiet annotation, and each subject feels like a chapter of a carefully typeset reference book.

## Visual grammar
- Armenian-first typography: test real Armenian words and long chapter titles at 320px before committing a type scale.
- Chapter-index composition: a consistent chapter number, subject label, and editorial rule; no decorative fake metrics.
- Warm paper, dark ink, botanical yellow-green, and a single rust-red editorial accent.
- Controlled asymmetry on discovery screens, strictly stable alignment inside exercises.
- No gradients, glassmorphism, excessive emoji, floating orb illustrations, arbitrary bento mosaics, or novelty motion.
- Motion only when it conveys transition, answer feedback, or navigation; respect reduced-motion settings.
- Prefer accessible contrast and focus states to visual purity.

## Distinct experiences
1. **Landing / cover:** bold opening typography, a live question preview, chapter-like navigation, not a stock marketing hero.
2. **Student desk / dashboard:** one primary 'continue learning' action; subjects organized as an index, not a wall of cards.
3. **Subject / book shelf:** original source book identity, chapter structure, explicit completion state, and easy return to last position.
4. **Question page / focus sheet:** one question at a time, clear answer affordances, spacious Armenian math/text rendering, consistent next-step feedback.
5. **Mistake archive / annotations:** errors grouped by concept and recency, retry queues that don't shame students.
6. **Study insights / field notes:** progress data is legible and factual; avoid fabricated recommendations and meaningless charts.
7. **Mobile:** thumb-reachable controls, readable mathematical notation, stable navigation, no horizontal overflow.

## Guardrails
- Never change answer checking, source banks, sign-in policy, guest trial limits, progress storage, or route semantics as part of styling.
- Preserve existing appearance presets and high-contrast settings.
- CSS must be opt-in, isolated, and reversible. The experimental files in `src/styles/landing-atlas.css` and `src/styles/atlas-workspace.css` are **not imported by default**.
- Do not merge this PR until screenshot review on 360px, 768px, and 1440px; light/dark; keyboard navigation; RTL not assumed; reduced motion; real Armenian content; tests and build pass.

## Next implementation
Build an explicit opt-in preview switch that loads Atlas CSS only on request; then apply this design language to the question screen and subject index. Avoid exposing unfinished preview controls to production.
