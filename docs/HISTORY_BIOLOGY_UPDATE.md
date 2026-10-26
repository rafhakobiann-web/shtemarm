# Armenian History and Biology — customizable practice + official updates

## What is playable
- History: all three previously imported history-book datasets can be selected together or separately. A multiple-choice or numeric question inside a larger book unit becomes an independently selectable task, while set/sequence/match tasks remain complete.
- Biology: books 1 and 2 can be selected together or separately at **/biology**. Book 2 previously stored whole sections as one large unit (177, 282, 208, 229, and 174 questions); these now become individually navigable tasks at runtime. The first five section labels are restored from their topic groups.
- All custom tests validate the exact requested task count, apply source/topic/type filters first, and reject shortages. Examination mode hides answers until submission. Practice mode requires manual checking. Users can choose 0–300 minutes, random/source order, and 20/40/80 shortcuts.
- Biology's **80** option is **not claimed to reproduce the official exam blueprint**. History's four existing 70-task sample papers remain separately playable.
- Books 3 and 4 for Biology are explicitly still **not playable**; their source is indexed at [test.am Biology archives](https://test.am/pdf.php?page=111). No missing questions are fabricated or copied from login-protected third-party PDFs.

## Official exam archive automation
- Sources are clearly attributed, not embedded as copied PDFs. The June and July 2026 archives link to their listing pages. The October 2026 official listing currently shows no download links for Biology (22 October) or History (26 October).
- `scripts/sync-official-exams.mjs` reads the official GTC index at https://dimord.am/public/tests daily through `.github/workflows/sync-official-exams.yml`, and recognizes only exact Biology / Armenian History rows and HTTPS links served by official testing authority domains.
- The script saves a new catalog revision only when source content materially changes; it never downgrades published papers to pending. If the site layout changes, it fails without updating the JSON. It does **not** transcribe or ingest exam contents automatically: answer-key checking and question extraction require verification and usage rights.
- The workflow starts working after this change is merged into the repository's **default branch** and GitHub Actions is enabled. Repository settings must permit `GITHUB_TOKEN` to push to `main`; restrictive branch protection may require a PR-based update policy instead. Vercel will deploy the new archive metadata when it builds the updated branch.

## Validation
- `node --test scripts/sync-official-exams.test.mjs`
- `bunx vitest run src/test/history.test.tsx src/test/biology.test.tsx`
- `bun run build`
