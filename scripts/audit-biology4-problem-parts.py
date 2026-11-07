#!/usr/bin/env python3
"""Read-only source QA for Biology IV chapter VI multipart problem structure.

Usage: python3 scripts/audit-biology4-problem-parts.py /path/to/kensab-4.pdf
No book text, answers, or PDF content is written to the repository.
"""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("pdf", type=Path)
args = parser.parse_args()
index = json.loads((ROOT / "public/data/biology-original-volume4-index.json").read_text())
queue = json.loads((ROOT / "docs/biology-final-500-source-queue.json").read_text())
assert hashlib.sha256(args.pdf.read_bytes()).hexdigest() == index["sourceSha256"], "Unexpected source PDF"
doc = fitz.open(args.pdf)
assert len(doc) == 392
chapter = index["chapters"][5]
assert chapter["id"] == 6 and chapter["questionCount"] == 303
pending = [e for e in queue["entries"] if e[0] == 4 and e[1] == 6]
assert len(pending) == 85
problems = defaultdict(set)
for page in range(chapter["startPage"], chapter["endPage"] + 1):
    for block in doc[page-1].get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                m = re.match(r"^\s*(\d{1,3})\.(\d+)\.", span["text"])
                if m and 1 <= int(m.group(1)) <= 303:
                    problems[int(m.group(1))].add(int(m.group(2)))
results = []
for _, _, number, page, key_start, key_end, reason in pending:
    parts = sorted(problems.get(number, []))
    results.append({"printedNumber":number, "indexedPage":page,
                    "detectedSubparts":parts, "needsManualReview":True})
print(json.dumps({"volume":4, "chapter":6, "pending":len(results),
                  "withDetectedSubparts":sum(bool(x["detectedSubparts"]) for x in results),
                  "items":results}, ensure_ascii=False, indent=2))
