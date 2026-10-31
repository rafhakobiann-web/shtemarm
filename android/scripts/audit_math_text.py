#!/usr/bin/env python3
"""Audit the two math transcription volumes without inventing missing text.

The Android reader combines the original index, main transcription bank and
supplemental bank. Count positions using that same precedence and require an
indexed source answer before a question can be auto-scored.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "public" / "data"


def read(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def at(rows, offset):
    if not isinstance(rows, list) or offset >= len(rows):
        return None
    value = rows[offset]
    return value if isinstance(value, dict) else None


def readable(question):
    if question is None:
        return False
    prompt = str(question.get("prompt") or "").strip()
    return bool(prompt and "still being processed" not in prompt.lower()
                and "<img" not in prompt.lower())


def scorable(question, answer, kind):
    if kind != "choice" or not readable(question):
        return False
    options = question.get("options")
    return (isinstance(options, list) and 2 <= len(options) <= 6
            and all(str(o).strip() for o in options)
            and len(set(map(str, options))) == len(options)
            and answer.isdecimal() and 1 <= int(answer) <= len(options))


index = read("math-books-index.json")
main = read("math-text-questions.json")
extra = read("math-text-questions-extra.json")
counts = {}
for book_id in ("matem-1", "matem-2"):
    book = index.get("books", {}).get(book_id, {})
    primary = main.get(book_id, {})
    supplemental = extra.get(book_id, {})
    valid = missing = unscorable = 0
    missing_examples = []
    for section in book.get("sections", []):
        key = f'{section["chapter"]}-{section["section"]}'
        for task in section.get("tasks", []):
            task_key = str(task["task"])
            answers = task.get("answers") or []
            rows = primary.get(key, {}).get(task_key, [])
            additions = supplemental.get(key, {}).get(task_key, [])
            previous = task.get("questions") or []
            for offset in range(task.get("sub_count", 0)):
                candidates = [at(additions, offset), at(rows, offset),
                              at(previous, offset)]
                readable_candidates = [q for q in candidates if readable(q)]
                if not readable_candidates:
                    missing += 1
                    if len(missing_examples) < 20:
                        missing_examples.append(f"{key}/task-{task_key}/item-{offset + 1}")
                    continue
                answer = str(answers[offset]).strip() if offset < len(answers) else ""
                if any(scorable(q, answer, task.get("answer_type", "choice"))
                       for q in readable_candidates):
                    valid += 1
                else:
                    unscorable += 1
    counts[book_id] = valid
    print(f"{book_id}: {valid} scored MCQs; {missing} missing readable entries; "
          f"{unscorable} transcribed but unscorable positions")
    if missing_examples:
        print("  First missing positions: " + ", ".join(missing_examples))

assert set(counts) == {"matem-1", "matem-2"}, "Both mathematics parts required"
print("Only source-indexed answer keys are eligible for automatic grading.")
