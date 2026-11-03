# Biology III: source-verified completion workflow

This document describes **third-volume question-bank maintenance**, not a declaration that all questions have been imported.

## Current baseline (do not misrepresent as completed)

| Printed section | Indexed | Live source-aligned tasks | Pending |
|---|---:|---:|---:|
| 1. Կենդանի օրգանիզմների բազմազանությունը | 305 | 178 | 127 |
| 2. Մարդ | 310 | 204 | 106 |
| 3. Բջջի կառուցվածքը, նյութափոխանակությունը և էներգիան | 347 | 214 | 133 |
| 4. Բազմացում, ժառանգականություն և փոփոխականություն | 337 | 207 | 130 |
| 5. Էվոլյուցիա, էկոլոգիա և կենսոլորտ | 166 | 108 | 58 |
| 6. Խնդիրներ | 372 | 0 | 372 |
| **Total** | **1837** | **911** | **926** |

Of the 926 pending: 892 await answer-type handling/source verification, 17 figure reviews, 15 formula reviews and 2 incomplete-text reviews. The 911 existing multiple-choice answers match the indexed printed answer key; that **does not** prove every transcription is fully verified.

## Private source PDF examination — 2026-11-03

The author-supplied 384-page source PDF was inspected locally, without uploading it to the repository. All **926 pending printed question numbers** were located in the corresponding chapter pages. This is evidence of source-document availability **only**: it is not manual proofreading of the question wording, illustrations, or answer keys. No new original text or playable answers have been imported by that discovery.

The project provides a maintainer-only, no-text metadata audit:

```sh
python scripts/audit_biology3_pdf.py /private/kensab-3.pdf \
  --output /tmp/biology3-page-audit.json \
  --pending-output /tmp/biology3-pending-source-locations.json
```

The source hash is checked before the per-question report is generated. The report records the 926 printed numbers, source pages, detection status and tentative **format hints** without copying the copyrighted question wording. A recognized printed number does not establish a correct or publishable transcription.

**Publication rights** are separate from source possession. Do not publish wholesale book contents in the public repository or deployed website without rights clearance. Existing 911 imported tasks remain untouched. Real question-content imports require verified transcriptions, answer checks, format support and rights confirmation.

## Use the source-aware importer

The repository does not ship the copyrighted source PDF. Students should **never** need to upload any PDF.

```sh
node scripts/import-biology3-verified.mjs --check
node scripts/import-biology3-verified.mjs --manifest > /tmp/biology3-review-metadata.json
node scripts/import-biology3-verified.mjs --dry-run /private/biology3-reviewed-patch.json
# Only after careful review and source rights confirmation:
node scripts/import-biology3-verified.mjs --apply /private/biology3-reviewed-patch.json
node --test scripts/tests/biology3-verified-import.test.mjs
bunx vitest run src/test/biology-backlog-audit.test.ts
```

The review manifest contains **only question numbers, page references, and review reasons**; it contains no original question text. Use it to locate pending tasks in an authorized source and create a rights-cleared patch for a maintainer-controlled import.

### Patch structure (descriptive; no original book text included)

```json
{
  "volume": 3,
  "sourceSha256": "<the SHA-256 in biology-original-volume3-index.json>",
  "rightsConfirmed": true,
  "questions": [
    {
      "chapter": 6,
      "number": 1,
      "sourcePage": 296,
      "kind": "num",
      "verifiedText": true,
      "verifiedAnswer": true,
      "payload": {
        "stem": "<reviewed question text with reuse permission>",
        "answer": "<answer verified against the source>"
      }
    }
  ]
}
```

Supported `kind` values: `mc` (one multiple-choice question with four options, exact official answer key), `num` (text + answer), `set` (numbered statements and an array of correct numbers), `seq` (sequence with ordered numeric answer), `match` (matching passage and letter-to-number answer map). Use the existing `UnitCard` task formats, not generic fabricated multiple-choice alternatives.

Each item must match the exact printed chapter number and mapped PDF page, belong to the pending queue, and have both text and answer reviews acknowledged. Figure, formula and incomplete-text flags must be separately reviewed. Duplicate numbers, wrong source hashes, wrong multiple-choice answers and missing rights confirmation are rejected.

The importer updates the third-volume question bank, coverage metadata, pending counts and backlog summary **together**. Its default check and dry-run modes do not alter the website. **Never commit the private patch or source PDF** unless publication rights permit it.

## Safety and rollout

- No route changes. `/book/33` and `/biology?book=33` stay stable.
- Existing 911 source-aligned questions and their answer IDs remain unchanged.
- Never fill empty entries with invented questions and never label metadata-only entries as playable.
- Re-run source audits, question rendering, mobile tests and the website build before merging.
- Do not deploy to Lovable Production solely because an audit is green; content review and Preview testing are additional requirements.
