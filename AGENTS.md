<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Question data lives in public/data/book{1,2,3}.json, generated from the uploaded PDFs by a one-off Python parser (sections, units, official answer keys); edit data there, not in components. Why: ~4,400 questions are too large to inline in code.
- Section ids 71 (section 7 dialogues) and 72 (section 7 part Բ) are synthetic; display via secTitle/secNum. Why: the books print them inside section 7.
- Progress is stored in localStorage and mirrored to the user_progress table (one jsonb row per user) when signed in. Why: works offline and online.
- Answer explanations are generated on demand by a server function using the official answer as ground truth. Why: no explanations exist in the books.
