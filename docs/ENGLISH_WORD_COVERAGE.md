# English-book Armenian word coverage

The three checked-in English books contain 12,758 distinct normalized English
source tokens in their textual content. Repeated occurrences count once. This
includes ordinary vocabulary, names, abbreviations, inflections, intentionally
incorrect answer choices, and PDF extraction artifacts.

The completion adds 3,057 exact source forms. Combined with the existing lookup,
all 12,758 have an Armenian gloss or a source-form explanation; zero are missing.
This is lookup coverage, not a claim that every entry is a distinct dictionary
headword or that the pre-existing translations have all been independently
reviewed.

Names receive Armenian renderings. Abbreviations are expanded. Fused or broken
source tokens show the intended spacing. Nonstandard answer options retain their
original spelling and receive an explanatory correction in the lookup. The book
passages, question text, options, and official answers remain unchanged.

The browser and server use `local-word-translation.ts`. Exact local matches take
priority over cached network results and require no API credentials. Passage
translation retains its existing behavior. Other translation languages retain
their existing dictionary entries; this completion is Armenian only.

Run `npx vitest run src/test/book-vocabulary-coverage.test.ts
src/test/translation.test.ts` to check coverage against the actual three JSON
books, token preservation, malformed-form explanations, apostrophes, language
fallbacks, and the user's `theme` translation. Production build also passes.
