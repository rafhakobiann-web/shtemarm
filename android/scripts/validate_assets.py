#!/usr/bin/env python3
"""Check that the bundled offline content is readable before publishing an APK."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB_DATA = ROOT / "public" / "data"
APP_ASSETS = ROOT / "android" / "app" / "src" / "main" / "assets"
ANDROID = ROOT / "android"

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

# Every catalog entry must be packaged with the APK, not only the older books
# enumerated in BOOKS. This catches missing files before runtime navigation.
catalog = (ANDROID / "app/src/main/java/am/shtemarm/app/QuestionRepository.kt").read_text(encoding="utf-8")
catalog_assets = set(re.findall(
    r'StudyBook\\(\\s*"[^"]+"\\s*,\\s*"[^"]+"\\s*,\\s*"([^"]+\\.json)"\\s*\\)', catalog
))
assert len(catalog_assets) >= 18, "BookCatalog extraction failed or lost books"
for asset in sorted(catalog_assets):
    data = read(WEB_DATA / asset)
    assert isinstance(data, dict) and any(
        key in data for key in ("sections", "tests", "questions", "items", "matem-1")
    ), f"Unsupported or empty book root: {asset}"
print(f"Verified all {len(catalog_assets)} unique BookCatalog data assets")

for font in ("noto_sans_armenian.ttf", "noto_serif_armenian.ttf"):
    path = ANDROID / "app/src/main/res/font" / font
    assert path.is_file() and path.stat().st_size > 10_000, f"Missing bundled Armenian font: {font}"
for license_name in ("OFL-NotoSansArmenian.txt", "OFL-NotoSerifArmenian.txt"):
    path = ANDROID / "licenses" / license_name
    assert path.is_file() and path.stat().st_size > 100, f"Missing font license: {license_name}"
print("Verified bundled Armenian fonts and OFL licenses")

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
