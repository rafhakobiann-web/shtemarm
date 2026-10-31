#!/usr/bin/env python3
"""Check that the bundled offline content is readable before publishing an APK."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB_DATA = ROOT / "public" / "data"
APP_ASSETS = ROOT / "android" / "app" / "src" / "main" / "assets"

BOOKS = [
    "book1.json", "book2.json", "book3.json",
    "armenian-book1.json", "history-book1.json", "history-book2.json",
    "history-book3.json", "history-tests.json",
    "bio-book1.json", "bio-book2.json", "physics-book1.json",
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

# The English books use empty stems for numbered gap-fill exercises.
# Each recovered item must have the corresponding numbered blank in its passage.
recoverable_english_gaps = 0
unverified_blank_stems = 0
for filename in ("book1.json", "book2.json", "book3.json"):
    book_gaps = 0
    book_missing = []
    book_total = 0
    book_keyed = 0
    for section_index, section in enumerate(read(WEB_DATA / filename).get("sections", []), 1):
        for unit in section.get("units", []):
            if unit.get("kind") != "mc":
                continue
            passage = str(unit.get("passage") or "")
            for question_index, question in enumerate(unit.get("questions", []), 1):
                book_total += 1
                options = question.get("options") or {}
                if (isinstance(options, dict) and
                    str(question.get("answer") or "").strip().lower() in
                    {str(key).lower() for key, value in options.items() if str(value).strip()}):
                    book_keyed += 1
                if str(question.get("stem") or "").strip():
                    continue
                number = str(question.get("n") or "").strip()
                marker = "(" + number + ")"
                marker_at = passage.find(marker) if number else -1
                near_marker = (passage[marker_at + len(marker):marker_at + len(marker) + 30]
                               if marker_at >= 0 else "")
                if marker_at >= 0 and "__" in near_marker:
                    recoverable_english_gaps += 1
                    book_gaps += 1
                else:
                    unverified_blank_stems += 1
                    if len(book_missing) < 20:
                        book_missing.append(
                            f"section-{section_index}/{unit.get('id', 'unknown')}/question-{number or question_index}"
                        )
    print(f"{filename}: {book_total} MCQ records, {book_keyed} keyed, "
          f"{book_gaps} recoverable gap stems, "
          f"{len(book_missing)} sampled unresolved blank stems")
    assert book_keyed == book_total, (
        f"{filename}: {book_total - book_keyed} multiple-choice records have no usable answer choice"
    )
    if book_missing:
        print("  First unresolved positions: " + ", ".join(book_missing))
assert recoverable_english_gaps >= 1000, (
    f"English gap-fill coverage regressed: {recoverable_english_gaps}"
)
print(f"Verified {recoverable_english_gaps} English gap-fill blanks; "
      f"{unverified_blank_stems} missing stems are not invented")

# Regression guards for source-checked English transcription repairs.
# Incorrectly merged OCR items must not silently shift answer options.
def english_unit(filename, unit_id):
    for section in read(WEB_DATA / filename).get("sections", []):
        for unit in section.get("units", []):
            if unit.get("id") == unit_id:
                return unit
    raise AssertionError(f"Missing English unit: {filename}:{unit_id}")


french = english_unit("book2.json", "2-1-Text23")["questions"]
assert len(french) == 10, "English II: Text 23 must contain ten distinct questions"
assert french[7]["answer"] == "b" and french[8]["answer"] == "c"
assert french[9]["answer"] == "c", "English II: pronoun question key changed"
assert all(q.get("stem", "").strip() for q in french), "English II: Text 23 stem lost"
assert french[8]["options"]["c"] == "constructed", "English II: shifted text options"
assert french[9]["options"]["c"] == "houses", "English II: shifted pronoun options"

express = english_unit("book2.json", "2-1-Text28")["questions"]
assert "developed" in express[1]["stem"]
assert express[1]["options"]["a"] == "came up with", "English II: merged option recurred"

eclipse = english_unit("book2.json", "2-1-Text36")["questions"]
assert len(eclipse) == 10 and eclipse[5]["answer"] == "a"
assert eclipse[6]["answer"] == "c" and eclipse[8]["options"]["b"] == "speed"

american_food = english_unit("book3.json", "3-1-Text30")["questions"]
assert len(american_food) == 10
assert american_food[4]["stem"].strip() and american_food[7]["stem"].strip()
assert [american_food[i]["answer"] for i in range(4, 10)] == [
    "c", "c", "a", "d", "a", "b"
], "English III: incorrect or shifted answer keys"
vocabulary = english_unit("book2.json", "2-1-Text5")["questions"][0]
assert vocabulary["options"] == {
    "a": "universal", "b": "ordinary", "c": "unusual", "d": "common"
}
grammar = english_unit("book3.json", "3-5-136")["questions"][0]
assert grammar["options"]["a"].strip() and grammar["answer"] == "a"
assert grammar["stem"].endswith("________________."), "English III: answer leaked into question"

print("Verified source-aligned OCR correction anchors for English volumes II and III")

dictionary = read(APP_ASSETS / "english-armenian-dictionary.json")
assert isinstance(dictionary, dict) and len(dictionary) >= 8000, "Vocabulary asset incomplete"
levels = read(APP_ASSETS / "english-level-practice.json").get("questions", [])
assert len(levels) == 100, "English level questions incomplete"
ids = [x.get("id") for x in levels]
assert len(ids) == len(set(ids)), "Duplicate level-test IDs"
for level in ("a1", "a2", "b1", "b2", "c1"):
    assert sum(x.startswith(level + "-") for x in ids) == 20, f"{level} count incorrect"
print(f"Verified {all_questions} question records, {len(dictionary)} vocabulary words, 100 CEFR practice questions")
