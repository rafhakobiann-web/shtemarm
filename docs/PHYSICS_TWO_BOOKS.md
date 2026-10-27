# Physics source books I and II — source audit (27 October 2026)

## The two supplied books

The site owner supplied two **scanned, image-based PDFs**:

| Original PDF | Edition | Pages | First exercise | Answer tables start | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| fizika-1_compressed.pdf | 2017 | 430 | PDF p. 5 | PDF p. 406 | f2e92bfd8c2fe7918f8c02bdfd97504a5445dce83b8bd2b042b5749c3a42f8e0 |
| fizika-2_compressed.pdf | 2017 | 436 | PDF p. 5 | PDF p. 409 | 3e4af54287b3895f2ac401226d5915a6bf1467b312d7c7c66c30157ce0238d07 |

Page numbers above refer to **physical PDF page indexes**, not the smaller printed page numbers; each volume's first exercise is PDF page 5. These values were checked from the actual provided files' rendered pages and SHA digests, not guessed from search results.

The files were published by the Armenian GTC as physics multiple-choice and numerical question collections. Both contain diagrams, charts, mathematics and answer keys. **Only "www.atc.am" is extracted by plain PDF text extraction**: the actual exercise content is embedded in page images. Do not generate empty/questionless text banks from this extraction, invent answers, or attribute authored examples to the original book.

## Functionality delivered

- Both volumes have distinct in-app book routes, subject tiles, thematic/summary assessment pools, and dedicated original-source access.
- The **Original PDF reader**, at \`/physics/books?volume=61&page=5\` or \`?volume=62&page=5\`, opens exactly the edition the learner chooses **on their own device**, preserving all formulas and diagrams. The PDF remains on the learner's device: the browser's IndexedDB stores the file locally (if allowed by quota), a Blob URL shows it in the site's iframe, and an explicit removal option deletes it. Hash confirmation is available on demand; other editions are clearly labelled as unverified.
- The reader has page controls, direct jump to exercise beginnings and answer tables, and a browser-native external-tab fallback for Android PDF readers that do not support iframe rendering.
- An in-browser answer notebook lets learners record **printed question numbers, source page and their own answer**, then manually check against the original answer tables, mark reviewed questions, revisit the source page and remove entries. No official answers are guessed; no answers or PDFs are sent to a server.
- The nearby downloadable public-source URL may refer to a **different edition**, so its page numbers and answers must not be represented as matching the two exact 2017 uploads.
- Separately, \`public/data/physics-book1.json\` and \`physics-book2.json\` contain **original Shtemarm study questions**, *not verbatim reproductions* of the uploaded books. Both practice collections have 55 compound tasks, i.e. 40 one-of-four choices, 13 groups comprising 28 numerically answerable responses and 2 six-claim tasks (80 achievable points across 70 numbered response slots). The combined practice pool spans mechanics, heat, electricity, optics, waves, and atomic physics. The GTC 2027 blueprint is recorded in \`src/lib/gtc-blueprints.ts\`.
- Number-based tasks have locally stored answer explanations available without AI calls. Six-claim units remain combined for correct bundle scoring.

## Still to be completed

Full independent **question-by-question transcription and answer-key verification** against each PDF, including fidelity checks for plots, individual option order, apparatus drawings and formula typesetting. The current practice banks are **not** the original books and the original PDFs are **not copied to the public repository** or to a server. Full-text extraction would require reliable Armenian scan recognition plus painstaking human page and answer-key review.

The user can read the full originals privately inside the app right now, provided their local PDFs are available. For any future structured transcription, each source entry must include the volume, physical PDF page, printed question number, question type, exact answer-key position, transcription provenance and any source diagram relationship. Do not advertise unverified transcriptions as completed.

## Testing

\`\`\`bash
bunx vitest run src/test/physics.test.ts src/test/physics-source.test.ts src/test/physics-source-notes.test.tsx
bun run build
\`\`\`

These are **on-demand or pull-request checks only**. No cron schedule is introduced.
