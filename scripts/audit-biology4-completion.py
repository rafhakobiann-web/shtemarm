#!/usr/bin/env python3
"""Source-only checks for the owner-supplied 2018 Biology IV PDF.

Usage:
  python scripts/audit-biology4-completion.py /path/to/kensab-4.pdf --source-only
  python scripts/audit-biology4-completion.py /path/to/kensab-4.pdf

Only source numbers, locations and key shapes are output; no source question text,
answer values, PDF bytes or scans are committed by this script.
"""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA256 = "9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e"
CHAPTERS = [(1, 5, 43, 232), (2, 44, 115, 300), (3, 116, 183, 301),
            (4, 184, 268, 338), (5, 269, 311, 214), (6, 312, 373, 303)]
KEY_RE = re.compile(r"(\d{1,3})(?:\.(\d+))?\s*-\s*(\d+)")
TRI_RE = re.compile(r"â·Çï»Ù|ã·Çï»Ù", re.I)


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def page_markers(doc, start, end):
    result = defaultdict(list)
    for page in range(start, end + 1):
        for block in doc[page - 1].get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line["spans"]:
                    t = span["text"].strip()
                    if (re.fullmatch(r"\d{1,4}", t) and "Bold" in span["font"]
                        and min(abs(span["bbox"][0] - 42.24),
                                abs(span["bbox"][0] - 56.42)) < 2
                        and line["dir"] == (1., 0.)):
                        result[int(t)].append(page)
    return result


def tri_state_tasks(doc, start, end):
    """Only IDs, never passage wording; a PDF extraction heuristic."""
    result = []
    for page in range(start, end + 1):
        chunks = re.split(r"(?m)^\.\s*", doc[page - 1].get_text())[1:]
        for chunk in chunks:
            if not TRI_RE.search(chunk):
                continue
            m = re.search(r"(?m)^\s*(\d{1,3})\s*$", chunk)
            if m is None:
                raise ValueError(f"Unidentified three-state question on PDF page {page}")
            result.append(int(m.group(1)))
    return result


def problem_key_shapes(doc):
    keys = defaultdict(list)
    for page in range(389, 392):
        for line in doc[page - 1].get_text().splitlines():
            m = KEY_RE.fullmatch(line.strip())
            if m:
                keys[int(m[1])].append(None if m[2] is None else int(m[2]))
    issues = []
    if set(keys) != set(range(1, 304)):
        issues.append("Problem key parent numbers do not cover 1..303")
    for number, items in keys.items():
        if items != ([None] if len(items) == 1 and items[0] is None
                     else list(range(1, len(items) + 1))):
            issues.append(f"Ambiguous or duplicated subquestion IDs: {number}")
    summary = {"keyedProblems": len(keys), "answerEntries": sum(map(len, keys.values())),
               "groupedProblems": sum(len(v) > 1 for v in keys.values()),
               "singleAnswerProblems": sum(len(v) == 1 for v in keys.values())}
    return keys, summary, issues


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pdf", type=Path)
    ap.add_argument("--source-only", action="store_true")
    ap.add_argument("--json-out", type=Path)
    args = ap.parse_args()
    sha = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
    doc = fitz.open(args.pdf)
    issues = []
    if sha != SOURCE_SHA256: issues.append("Wrong source PDF SHA-256")
    if len(doc) != 392: issues.append("Wrong PDF page count")
    idx = None if args.source_only else read(ROOT / "public/data/biology-original-volume4-index.json")
    if idx and idx["sourceSha256"] != sha:
        issues.append("Repository source index SHA-256 mismatch")
    source_pages = {}
    chapters = []
    tri_ids = set()
    for chapter_id, start, end, total in CHAPTERS:
        actual = page_markers(doc, start, end)
        miss = sorted(set(range(1, total + 1)) - set(actual))
        extra = sorted(set(actual) - set(range(1, total + 1)))
        dup = sorted(n for n, pages in actual.items() if len(pages) != 1)
        if miss or extra or dup:
            issues.append({"chapter": chapter_id, "missing": miss, "extra": extra, "duplicate": dup})
        if idx:
            chapter = idx["chapters"][chapter_id - 1]
            expected = start
            for n in range(1, total + 1):
                for first, page in chapter["pageRuns"]:
                    if first > n: break
                    expected = page
                if actual.get(n) != [expected]:
                    issues.append(f"Wrong indexed page: chapter {chapter_id}, question {n}")
        for n, pages in actual.items():
            if len(pages) == 1: source_pages[(chapter_id, n)] = pages[0]
        tri = tri_state_tasks(doc, start, end) if chapter_id < 6 else []
        if len(tri) != len(set(tri)) or any(n < 1 or n > total for n in tri):
            issues.append(f"Ambiguous three-state IDs in chapter {chapter_id}")
        tri_ids.update((chapter_id, n) for n in tri)
        chapters.append({"chapter": chapter_id, "printedTasks": total,
                         "uniqueNumberMarkers": total - len(miss) - len(dup),
                         "threeStateTasks": len(tri)})
    answers, key_summary, key_issues = problem_key_shapes(doc)
    issues.extend(key_issues)
    if len(tri_ids) != 223: issues.append("Expected 223 three-state tasks")
    if key_summary != {"keyedProblems": 303, "answerEntries": 486,
                       "groupedProblems": 146, "singleAnswerProblems": 157}:
        issues.append("Unexpected Chapter VI printed key structure")
    result = {"volume": 4, "pdfPages": len(doc), "sha256Verified": sha == SOURCE_SHA256,
              "indexedTasks": 1688, "chapters": chapters,
              "threeStateTasks": len(tri_ids), "chapter6PrintedAnswerStructure": key_summary}
    if not args.source_only:
        core = read(ROOT / "public/data/bio-book4.json")
        extra = read(ROOT / "public/data/biology-extended-book4.json")
        first = read(ROOT / "docs/biology-next-268-source-review.json")
        next500 = read(ROOT / "docs/biology-next-500-source-queue.json")
        final500 = read(ROOT / "docs/biology-final-500-source-queue.json")
        ready = [(s["n"], int(u["label"])) for bank in (core, extra)
                 for s in bank["sections"] for u in s["units"]]
        queued = [(r["chapter"], r["printedNumber"], r["sourcePage"])
                  for r in first["entries"]]
        queued.extend((ch, n, page) for v, ch, n, page, *_ in
                      next500["entries"] + final500["entries"] if v == 4)
        ready_ids = set(ready)
        pending_ids = {(ch, n) for ch, n, _ in queued}
        indexed_ids = {(ch, n) for ch, _, _, ct in CHAPTERS for n in range(1, ct + 1)}
        if (len(ready) != 1035 or len(ready_ids) != 1035 or
            len(queued) != 653 or len(pending_ids) != 653 or
            ready_ids & pending_ids or ready_ids | pending_ids != indexed_ids):
            issues.append("Playable and pending inventories do not partition all 1688 task IDs")
        wrong_pages = [(ch, n) for ch, n, page in queued if source_pages.get((ch, n)) != page]
        if wrong_pages: issues.append({"incorrectPendingPages": wrong_pages})
        tri_playable = tri_ids & ready_ids
        if tri_playable: issues.append({"unreviewedThreeStatePublished": sorted(tri_playable)})
        remaining_problems = {n for ch, n in pending_ids if ch == 6}
        unkeyed = remaining_problems - set(answers)
        if unkeyed: issues.append({"pendingProblemsWithoutKeys": sorted(unkeyed)})
        result["stagedBank"] = {"playable": len(ready), "pending": len(queued),
                                "pendingWithVerifiedSourcePage": len(queued) - len(wrong_pages),
                                "threeStatePending": len(tri_ids & pending_ids),
                                "pendingProblemBundles": sum(len(answers[n]) > 1 for n in remaining_problems),
                                "pendingProblemSingles": sum(len(answers[n]) == 1 for n in remaining_problems),
                                "wordingAndAnswerProofreadingComplete": False}
    result["issues"] = issues
    data = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    print(data, end="")
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(data, encoding="utf-8")
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()
