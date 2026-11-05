# Explanations and AI teacher improvements

This branch changes the teaching experience; it does not publish a release or configure provider accounts.

## Explanation quality and language
- Both subject and math generation now explicitly request the selected Armenian, English or Russian language. Previously the prompts always requested Armenian.
- Shared prompt builders request the relevant rule/evidence, worked reasoning, verification, common mistakes and a takeaway. Reading explanations must use the supplied passage rather than invented quotations or line numbers.
- The supplied answer key is a reference to check, not a reason to fabricate a proof when the condition conflicts with it. Prompt instructions improve guidance but do not certify model accuracy.
- LaTeX commands reach the provider with their backslashes intact. The old math template interpreted commands such as \frac and \begin as JavaScript control-character escapes.
- Shared teaching prompts omit the learner's selected answer. Cache namespaces change to shared-teaching-v2 and math-shared-v6, so earlier output does not bypass the corrected prompts. The math key also includes the task and unambiguous options/page arrays.
- Local math memory-cache identity includes the book, task, format and page/native-source context.
- Question explanations reset when their question, answer or UI language changes; a late response from the previous component cannot populate the new question.

## AI teacher experience
- Keep all three learning modes: guided hint, complete explanation, practice. Mode instructions request readable steps, feedback on the learner's attempt and one practice question at a time.
- Use one safe content renderer for chat and question explanations: headings, numbered steps, emphasis, bullet points, math and schema-validated diagrams. Plain HTML remains escaped. Multiline display math is not split into separate steps.
- Preserve the provider's Markdown and multiplication symbols instead of deleting every asterisk and code fence.
- Localized teacher title and starter questions; localized bounded offline replies, clearly labeled as offline.
- Failed messages have a retry button. Retrying keeps one student-question bubble. A synchronous pending guard prevents duplicate submits, including before React rerenders.
- New conversation clears message state and the signed context token, and restores composer focus. Conversation text is not persisted.
- Respect IME composition when handling Enter; respect reduced motion while scrolling to replies.

## Validation
- Focused Vitest coverage includes prompt language/LaTeX, cache identity, quota-denied/provider-failure handling, cached access without new quota calls, escaped rendering, display-math grouping, retry/duplicate-submit behavior, signed follow-up context/reset and stale question/language responses.
- Full Vite/TanStack/Nitro production build succeeds locally. No live model credentials or billable API requests were used in tests.
- The complete TypeScript check reports 15 existing diagnostics. A separate copy with original versions of all changed existing source files reports exactly the same diagnostics: auth-route search arguments, Lovable OAuth union types and the MCP get-questions result type. No new diagnostics were introduced.
- Preview browser review and real configured-provider checks are still required, including a real algebra explanation, passage evidence, language switching and all three teacher modes.

## Release boundaries
Keep changes in a Draft PR. No secrets, quotas, database schema, question-bank content, landing design, Production or Lovable settings are changed. Existing server authentication, atomic quota reservation, provider fallback order and successful-response-only explanation caching remain in place. No claim of unlimited provider access or completed reviewed explanations is made.
