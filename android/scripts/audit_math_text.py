#!/usr/bin/env python3
"""Measure usable, answer-verified mathematics questions in both official books.

Does not transcribe, publish or invent any exercise text.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "public" / "data"

with (DATA / "math-books-index.json").open(encoding="utf-8") as fh:
    index = json.load(fh)
with (DATA / "math-text-questions.json").open(encoding="utf-8") as fh:
    bank = json.load(fh)

counts = {}
for book_id in ("matem-1", "matem-2"):
    book = index["books"].get(book_id, {})
    source = bank.get(book_id, {})
    valid = 0
    other = 0
    missing = 0
    unscorable = 0
    missing_examples = []
    for section in book.get("sections", []):
        key = f'{section["chapter"]}-{section["section"]}'
        for task in section.get("tasks", []):
            answers = task.get("answers") or []
            rows = source.get(key, {}).get(str(task["task"]), [])
            prior = task.get("questions") or []
            for offset in range(task.get("sub_count", 0)):
                question = (rows[offset] if offset < len(rows) else None)
                question = question or (prior[offset] if offset < len(prior) else None)
                if not question or not isinstance(question, dict):
                    other += 1
                    missing += 1
                    if len(missing_examples) < 20:
                        missing_examples.append(f"{key}/task-{task['task']}/item-{offset + 1}")
                    continue
                prompt = str(question.get("prompt") or "").strip()
                options = question.get("options") or []
                answer = str(answers[offset]).strip() if offset < len(answers) else ""
                if (prompt and isinstance(options, list) and 2 <= len(options) <= 6
                        and all(str(o).strip() for o in options)
                        and len(set(map(str, options))) == len(options)
                        and answer.isdecimal()
                        and 1 <= int(answer) <= len(options)
                        and task.get("answer_type", "choice") == "choice"):
                    valid += 1
                else:
                    other += 1
                    unscorable += 1
    counts[book_id] = valid
    print(f"{book_id}: {valid} native-scored math MCQs; {missing} missing transcription entries; "
          f"{unscorable} present but not auto-scorable")
    if missing_examples:
        print("  First missing positions: " + ", ".join(missing_examples))
assert set(counts) == {"matem-1", "matem-2"}, "Both mathematics parts required"
print("Only questions with verified source answer positions may be auto-scored.")
