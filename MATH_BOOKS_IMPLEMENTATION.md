# Mathematics integration and practice test

## What this update adds

- A dedicated Mathematics page with exactly the two official book cards: Mathematics Shtemaran 1 and Mathematics Shtemaran 2.
- A Mathematics link on the existing homepage; English book selection and English question data are kept in place.
- 73 original Armenian practice questions (36 associated with book 1 and 37 associated with book 2), with a mix of multiple-choice and typed-number answers, verified answer keys, and explanations.
- A practice-test page that randomizes question order for each attempt, selects 65 questions for a mixed exam-style attempt, and shows results/explanations at the end.
- Links to the book source pages and PDF files.

## Sources used as references

- Official 2026 January–February mathematics unified-exam paper, Test 2: https://dimord.am/storage/pdfReport/tester/pul_1/9/9_2.pdf
- Official ATC 2026 tests and answer keys page: https://dimord.am/public/tests
- Mathematics Shtemaran 1: https://shtemaran.am/shtems/matem-1
- Mathematics Shtemaran 2: https://shtemaran.am/shtems/matem-2

The 2026 exam paper was used only as a model for topic range and exam-style task presentation. The questions included in `src/lib/mathQuestions.ts` are newly written practice items, not a transcription of the official paper or the books. The initial bank is a prototype and should be expanded and independently proofread before being described as a complete conversion of either book.

## Routes

- `/math` — the two mathematics book cards and test entry points.
- `/math-test?book=1` — practice questions associated with Mathematics Shtemaran 1.
- `/math-test?book=2` — practice questions associated with Mathematics Shtemaran 2.
- `/math-test?book=all` — a randomized 65-question mixed practice test, following the 65-task count in the 2026 sample paper.

## Local setup

1. Copy `.env.example` to `.env` and fill in the environment values required by your own project.
2. Install dependencies using the package manager used by your environment.
3. Run the project's test and build scripts before publishing.
