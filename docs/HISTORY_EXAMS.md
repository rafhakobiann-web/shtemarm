# Armenian History workspace

`/history` and `/history-book` share the same configurable workspace. Existing
`/history?test=1` through `test=4` links preselect the corresponding full sample
exam; the user can adjust settings before starting.

The builder uses the existing first-book single-choice bank and four sample
exams. It does not unlock or claim newly transcribed content from other books.
Source text and official answer keys are unchanged. Section and task-kind filters
are applied before selection. Counts refer to complete tasks; multi-question
units retain their full passage and are scored by the existing `scoreUnit` rules.
Selection rejects shortages and never pads by repeating IDs.

Settings include source, sections, task kinds, exact count, random or source
order, exam or practice mode, and an optional 0–300 minute limit. A session
snapshots the chosen tasks. Exam answers stay editable and unrevealed until
submission; practice feedback appears only after explicit checking. The timer
uses an absolute deadline so background tabs do not extend the time limit.
Submission is idempotent and uses the latest answers. Results use the existing
`history-progress-v1` storage key, retaining earlier results. Active attempts
remain in memory; reload warns about losing the attempt. Returning to settings
keeps the selected configuration for the current visit.

Validation: `npx vitest run src/test/history.test.tsx src/test/scoring.test.ts
src/test/explanation.test.ts`, followed by `npm run build`. Browser checks cover
390px layout, editable answers, review, a fresh attempt, and a 70-task sample.
