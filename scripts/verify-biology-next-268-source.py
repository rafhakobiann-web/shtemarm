#!/usr/bin/env python3
"""Verify exactly 268 source question markers without copying textbook text.

Usage: python scripts/verify-biology-next-268-source.py /path/to/kensab-4.pdf
Requires: pip install pymupdf

This audit proves a unique numbered question exists in the hash-matched PDF.
It DOES NOT verify the question text, answers, grading type, or reproduction rights.
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
batch = json.loads((ROOT/"docs/biology-next-268-source-review.json").read_text())
index = json.loads((ROOT/"public/data/biology-original-volume4-index.json").read_text())
digest = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
if digest != index["sourceSha256"] or batch["sourceSha256"] != digest:
    raise SystemExit("Wrong source PDF: SHA-256 does not match the reviewed original")
pdf = fitz.open(args.pdf)
selected = defaultdict(list)
for entry in batch["entries"]:
    selected[entry["chapter"]].append(entry)

def is_marker(span, direction):
    return (re.fullmatch(r"\d{1,4}", span["text"].strip())
            and "Bold" in span["font"]
            and min(abs(span["bbox"][0]-42.24),abs(span["bbox"][0]-56.42))<2
            and direction==(1.0,0.0))

checked = 0
issues = []
for chapter in index["chapters"][:5]:
    markers=defaultdict(list)
    for p in range(chapter["startPage"],chapter["endPage"]+1):
        for block in pdf[p-1].get_text("dict")["blocks"]:
            for line in block.get("lines",[]):
                for span in line["spans"]:
                    if is_marker(span,line["dir"]):
                        markers[int(span["text"].strip())].append(p)
    for item in selected[chapter["id"]]:
        n=item["printedNumber"]
        pages=markers.get(n,[])
        if len(pages)!=1:
            issues.append({"chapter":chapter["id"],"number":n,"reason":"missing_or_ambiguous_marker"})
        else:
            checked+=1
            if pages[0]!=item["sourcePage"]:
                issues.append({"chapter":chapter["id"],"number":n,"reason":"source_page_index_differs",
                               "indexedPage":item["sourcePage"],"actualPage":pages[0]})
report={"selected":len(batch["entries"]),"uniqueMarkersFound":checked,
        "sourcePageDiscrepancies":sum(x["reason"]=="source_page_index_differs" for x in issues),
        "issues":issues,"answerAndTextReview":"pending"}
print(json.dumps(report,ensure_ascii=False,indent=2))
if checked!=268 or issues:raise SystemExit(1)
