#!/usr/bin/env python3
"""Source-only QA for Biology III, 2018 edition.

Checks the owner-provided PDF without copying book text, images, or answer
values to GitHub. This is structural validation, NOT question proofreading.

  python3 scripts/audit-biology3-completion.py /path/to/kensab-3.pdf
  python3 scripts/audit-biology3-completion.py /path/to/kensab-3.pdf --json-out /tmp/bio3.json

Requires PyMuPDF. Add --source-only to run outside the repository.
"""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
SHA = "adc0ddf59fa1008d6dd50f8d41583e44aa7161d2e23bc83f62b4c482e0722b93"
SOURCE_CHAPTERS = [(1, 5, 61, 305), (2, 62, 124, 310),
                   (3, 125, 191, 347), (4, 192, 262, 337),
                   (5, 263, 295, 166), (6, 296, 361, 372)]


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def markers_on_pages(pdf, chapter):
    markers = defaultdict(list)
    for page in range(chapter["startPage"], chapter["endPage"] + 1):
        for block in pdf[page - 1].get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line["spans"]:
                    text = span["text"].strip()
                    if (re.fullmatch(r"\d{1,4}", text)
                            and "Bold" in span["font"]
                            and min(abs(span["bbox"][0] - 42.24),
                                    abs(span["bbox"][0] - 56.42)) < 2
                            and line["dir"] == (1., 0.)):
                        markers[int(text)].append(page)
    return markers


def chapter_six_answer_structure(pdf, answer_pages):
    """Only store printed key locations and subquestion IDs, not their values."""
    key = re.compile(r"(\d{1,3})(?:\.(\d+))?\s*-\s*(\d+)")
    answers = defaultdict(list)
    for page in range(answer_pages[0], answer_pages[1] + 1):
        for line in pdf[page - 1].get_text("text").splitlines():
            match = key.fullmatch(line.strip())
            if match:
                number = int(match[1])
                sub = int(match[2]) if match[2] else None
                answers[number].append(sub)
    errors = []
    missing = sorted(set(range(1, 373)) - set(answers))
    extra = sorted(set(answers) - set(range(1, 373)))
    if missing or extra:
        errors.append({"kind": "key-parents", "missing": missing, "extra": extra})
    groups = 0
    singles = 0
    for n, parts in answers.items():
        if len(parts) == 1 and parts[0] is None:
            singles += 1
        elif None not in parts and len(parts) == len(set(parts)) and sorted(parts) == list(range(1, len(parts) + 1)):
            groups += 1
        else:
            errors.append({"kind": "ambiguous-or-duplicated-subkeys", "number": n})
    return answers, {"keyedParents": len(answers),
                     "printedKeyEntries": sum(map(len, answers.values())),
                     "groupedParents": groups, "singleParents": singles,
                     "issues": errors}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", type=Path, help="Original 2018 kensab-3.pdf")
    ap.add_argument("--json-out", type=Path)
    ap.add_argument("--source-only", action="store_true",
                    help="Check source markers/printed key without GitHub bank data")
    args = ap.parse_args()
    pdf = fitz.open(args.source)
    digest = hashlib.sha256(args.source.read_bytes()).hexdigest()
    errors = []
    if digest != SHA:
        errors.append("Source fingerprint does not match the pinned 2018 edition")
    if len(pdf) != 384:
        errors.append("Unexpected PDF page count")
    if args.source_only:
        chapters = [{"id": c, "startPage": start, "endPage": end, "questionCount": total}
                    for c, start, end, total in SOURCE_CHAPTERS]
    else:
        source_index = read_json(ROOT / "public/data/biology-original-volume3-index.json")
        chapters = source_index["chapters"]
        if source_index["sourceSha256"] != SHA:
            errors.append("Repository's source fingerprint has changed")
    if len(chapters) != 6 or sum(c["questionCount"] for c in chapters) != 1837:
        errors.append("Chapter boundaries/counts have changed")
    scanned_pages = {}
    chapter_results = []
    for ch in chapters:
        markers = markers_on_pages(pdf, ch)
        valid = set(range(1, ch["questionCount"] + 1))
        missing = sorted(valid - set(markers))
        extra = sorted(set(markers) - valid)
        duplicate = sorted(n for n, pages in markers.items() if len(pages) != 1)
        if missing or extra or duplicate:
            errors.append({"chapter": ch["id"], "missing": missing,
                           "extra": extra, "duplicate": duplicate})
        for n, pages in markers.items():
            if len(pages) == 1:
                scanned_pages[(ch["id"], n)] = pages[0]
        if "pageRuns" in ch:
            expected_page = ch["startPage"]
            changes = dict(ch["pageRuns"])
            for n in range(1, ch["questionCount"] + 1):
                expected_page = changes.get(n, expected_page)
                if scanned_pages.get((ch["id"], n)) != expected_page:
                    errors.append({"kind": "incorrect-indexed-page",
                                   "chapter": ch["id"], "number": n})
        chapter_results.append({"chapter": ch["id"], "expected": ch["questionCount"],
                                "uniqueMarkers": ch["questionCount"] - len(missing) - len(duplicate),
                                "missing": len(missing), "duplicated": len(duplicate)})
    answers, key_summary = chapter_six_answer_structure(
        pdf, (377, 379) if args.source_only
        else next(ch for ch in chapters if ch["id"] == 6)["answerPages"])
    if key_summary["issues"]:
        errors.append("Chapter VI printed answer structure contains errors")
    result = {"volume": 3, "pdfPages": len(pdf), "sha256Matches": digest == SHA,
              "sourceTasks": 1837, "chapters": chapter_results,
              "chapter6AnswerKey": key_summary}
    if not args.source_only:
        previous = read_json(ROOT / "docs/biology-next-500-source-queue.json")["entries"]
        final = read_json(ROOT / "docs/biology-final-500-source-queue.json")["entries"]
        pending = [(row[1], row[2], row[3]) for row in previous + final if row[0] == 3]
        ready = []
        for name in ("bio-book3.json", "biology-extended-book3.json"):
            bank = read_json(ROOT / "public/data" / name)
            ready += [(sec["n"], int(unit["label"]))
                      for sec in bank["sections"] for unit in sec["units"]]
        ready_ids = set(ready)
        pending_ids = {(c, n) for c, n, _ in pending}
        total_ids = {(ch["id"], n) for ch in chapters
                     for n in range(1, ch["questionCount"] + 1)}
        if len(ready) != 1222 or len(ready_ids) != 1222:
            errors.append("Unexpected playable bank size or duplicate IDs")
        if len(pending) != 615 or len(pending_ids) != 615:
            errors.append("Expected exactly 615 distinct pending Book III tasks")
        if ready_ids & pending_ids or ready_ids | pending_ids != total_ids:
            errors.append("Playable and review-only source IDs do not partition the book")
        wrong_pages = [(c, n) for c, n, p in pending if scanned_pages.get((c, n)) != p]
        if wrong_pages:
            errors.append({"kind": "incorrect-queue-pages", "items": wrong_pages})
        chapter_six_pending = [n for c, n, _ in pending if c == 6]
        missing_keys = [n for n in chapter_six_pending if n not in answers]
        if missing_keys:
            errors.append({"kind": "unkeyed-chapter-six-items", "numbers": missing_keys})
        result["bankInventory"] = {
            "playable": len(ready), "pending": len(pending),
            "pendingWithVerifiedPage": len(pending) - len(wrong_pages),
            "pendingChapter6WithPrintedKey": len(chapter_six_pending) - len(missing_keys),
            "manualTextAndAnswerProofreadingComplete": False,
        }
    result["errors"] = errors
    output = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(output, encoding="utf-8")
    print(output, end="")
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
