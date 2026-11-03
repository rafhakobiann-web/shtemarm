# Biology IV — direct website practice, no PDF upload

## Student flow

Students open **Biology IV** at `/book/34` and select one of the existing sections. A clear **Start learning — no PDF needed** panel links directly into the existing interactive study route (`/study/34/{section}`) and the Biology test builder (`/biology?book=34`).

- Question text and answer options for **already imported digitized tasks** are part of Shtemarm's native question-bank JSON; no upload, PDF reader or PDF selection is needed.
- Answers, scoring and progress continue to use the existing interactive study components and existing progress IDs.
- Student navigation and the existing Preview/Production routes remain unchanged.
- English, Russian and Armenian copy explains what is available and what is still being checked.

## Critical correction to the previous Draft PR

The earlier version of PR #187 added a “568 original tasks” self-practice panel that required students to provide their own PDF. **This upload-dependent panel and its manifest/test are removed.** It misrepresented 568 source-number references as a complete in-site learning experience.

Those **568 question-number references remain part of the upstream source review queues**, but their full question text and printed answer keys are still unverified; none of them have been imported or newly made playable by this change. The actual question-bank baseline inherited from PR #183 remains:

- Biology III: 1,222 digitized tasks
- Biology IV: 1,035 digitized tasks
- Combined: **2,257 available tasks; 1,268 awaiting transcription/answer-format review**.

This patch does **not** present the 568 pending numbers as playable or award credit for them. Import them as native questions only after source, answer-key and grading review and appropriate rights checks. Students must never be asked to supply PDFs to play Shtemarm.

## Checks

```sh
bunx vitest run src/test/biology-native-practice-no-pdf.test.ts
bun run build
```

PR remains Draft; no merge or deployment.
