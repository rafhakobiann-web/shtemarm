#!/usr/bin/env python3
"""Check that the bundled offline content is readable before publishing an APK."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB_DATA = ROOT / "public" / "data"
APP_ASSETS = ROOT / "android" / "app" / "src" / "main" / "assets"

BOOKS = [
    "book1.json", "book2.json", "book3.json",
    "armenian-book1.json", "armenian-book2.json", "armenian-book3.json",
    "armenian-book4.json", "history-book1.json", "history-book2.json",
    "history-book3.json", "history-tests.json",
    "bio-book1.json", "bio-book2.json", "bio-book3.json", "bio-book4.json",
    "physics-book1.json",
    "physics-book2.json", "physics-original-book1.json",
    "physics-original-book2.json", "original-chemistry.json",
    "original-geography.json", "original-russian.json",
    "math-text-questions-extra.json",
]

def read(path: Path):
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError(f"Missing or empty asset: {path}")
    return json.loads(path.read_text(encoding="utf-8"))

all_questions = 0
for name in BOOKS:
    data = read(WEB_DATA / name)
    if name == "math-text-questions-extra.json":
        assert "matem-1" in data and "matem-2" in data, "Math parts missing"
        print("Verified math transcription asset")
        continue
    if name == "history-tests.json":
        assert isinstance(data.get("tests"), list), "History test collection missing"
        continue
    assert isinstance(data.get("sections"), list), f"Sections missing: {name}"
    amount = 0
    for section in data["sections"]:
        for unit in section.get("units", []):
            amount += len(unit.get("questions", []))
            if unit.get("kind") in ("set", "seq", "match"):
                assert "answer" in unit, f"Missing answer for {name}:{unit.get('id')}"
    all_questions += amount
    print(f"{name}: {amount} individual questions")
assert all_questions > 4000, f"Unexpectedly low question count: {all_questions}"

# Verify that Android's mathematical source mirrors the website's original
# two book datasets. There are no generated substitute/author-written 0.3.0 banks.
math_index = read(WEB_DATA / "math-books-index.json")
math_text = read(WEB_DATA / "math-text-questions.json")
assert isinstance(math_index.get("books"), dict), "Missing website math books"
assert isinstance(math_text, dict), "Missing website math text data"
math_subquestions = 0
for book_id, expected in (("matem-1", 2640), ("matem-2", 3036)):
    sections = math_index["books"].get(book_id, {}).get("sections", [])
    assert sections, f"Missing indexed math sections: {book_id}"
    assert isinstance(math_text.get(book_id), dict), f"Missing transcribed math text: {book_id}"
    part_count = 0
    kinds = set()
    for section in sections:
        assert "chapter" in section and "section" in section
        for task in section.get("tasks", []):
            kind = task.get("answer_type", "choice")
            assert kind in {"choice", "open", "tf"}, (book_id, kind)
            count = task.get("sub_count")
            assert isinstance(count, int) and count > 0, (book_id, task.get("task"))
            answers = task.get("answers")
            assert isinstance(answers, list) and len(answers) == count, (
                book_id, task.get("task"), "answer count mismatch"
            )
            kinds.add(kind)
            part_count += count
    assert part_count == expected, (book_id, part_count, expected)
    assert kinds == {"choice", "open", "tf"}, (book_id, kinds)
    math_subquestions += part_count
    print(f"{book_id}: {part_count} indexed website subquestions; types={sorted(kinds)}")
assert math_subquestions == 5676

# Reject the mistakenly introduced original-practice banks from beta.2.
for name in ("original-math.json", "original-english.json",
             "original-history.json", "original-biology-3.json"):
    assert not (WEB_DATA / name).exists(), f"Unexpected authored bank: {name}"

# The English books use empty stems for numbered gap-fill exercises.
# Each recovered item must have the corresponding numbered blank in its passage.
recoverable_english_gaps = 0
unverified_blank_stems = 0
for filename in ("book1.json", "book2.json", "book3.json"):
    for section in read(WEB_DATA / filename).get("sections", []):
        for unit in section.get("units", []):
            if unit.get("kind") != "mc":
                continue
            passage = str(unit.get("passage") or "")
            for question in unit.get("questions", []):
                if str(question.get("stem") or "").strip():
                    continue
                number = str(question.get("n") or "").strip()
                marker = "(" + number + ")"
                marker_at = passage.find(marker) if number else -1
                near_marker = (passage[marker_at + len(marker):marker_at + len(marker) + 30]
                               if marker_at >= 0 else "")
                if marker_at >= 0 and "__" in near_marker:
                    recoverable_english_gaps += 1
                else:
                    unverified_blank_stems += 1
assert recoverable_english_gaps >= 1000, (
    f"English gap-fill coverage regressed: {recoverable_english_gaps}"
)
print(f"Verified {recoverable_english_gaps} English gap-fill blanks; "
      f"{unverified_blank_stems} missing stems are not invented")

dictionary = read(APP_ASSETS / "english-armenian-dictionary.json")
assert isinstance(dictionary, dict) and len(dictionary) >= 8000, "Vocabulary asset incomplete"
levels = read(APP_ASSETS / "english-level-practice.json").get("questions", [])
assert len(levels) == 100, "English level questions incomplete"
ids = [x.get("id") for x in levels]
assert len(ids) == len(set(ids)), "Duplicate level-test IDs"
for level in ("a1", "a2", "b1", "b2", "c1"):
    assert sum(x.startswith(level + "-") for x in ids) == 20, f"{level} count incorrect"
print(f"Verified {all_questions} question records, {len(dictionary)} vocabulary words, 100 CEFR practice questions")
