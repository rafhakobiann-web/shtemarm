#!/usr/bin/env python3
"""Cross-check the 500 queued Biology task numbers/pages against owner PDFs.

Usage:
    python scripts/verify-biology-next-500-source.py --volume4 /path/kensab-4.pdf
    python scripts/verify-biology-next-500-source.py --volume3 /path/kensab-3.pdf --volume4 /path/kensab-4.pdf

It does NOT extract or publish copyrighted question text, answers, or pages.
Successful marker verification is NOT a claim of accurate transcription/grading.
"""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import fitz

ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser()
a.add_argument("--volume3",type=Path)
a.add_argument("--volume4",type=Path)
args=a.parse_args()
queue=json.loads((ROOT/"docs/biology-next-500-source-queue.json").read_text())
if not (args.volume3 or args.volume4):a.error("At least one supplied source PDF is required.")

def is_marker(span,direction):
    return (re.fullmatch(r"\d{1,4}",span["text"].strip())
            and "Bold" in span["font"]
            and min(abs(span["bbox"][0]-42.24),abs(span["bbox"][0]-56.42))<2
            and direction==(1.,0.))

report={}
for volume,path in [(3,args.volume3),(4,args.volume4)]:
    if path is None:continue
    index=json.loads((ROOT/f"public/data/biology-original-volume{volume}-index.json").read_text())
    actual=hashlib.sha256(path.read_bytes()).hexdigest()
    if actual!=index["sourceSha256"] or actual!=queue["sourceSha256"][str(volume)]:
        raise SystemExit(f"Volume {volume}: wrong PDF fingerprint")
    pdf=fitz.open(path)
    selected=[r for r in queue["entries"] if r[0]==volume]
    issues=[]
    for chapter in index["chapters"]:
        rows=[r for r in selected if r[1]==chapter["id"]]
        if not rows:continue
        markers=defaultdict(list)
        for page in range(chapter["startPage"],chapter["endPage"]+1):
            for block in pdf[page-1].get_text("dict")["blocks"]:
                for line in block.get("lines",[]):
                    for span in line["spans"]:
                        if is_marker(span,line["dir"]):
                            markers[int(span["text"].strip())].append(page)
        for _,ch,n,p,*_ in rows:
            if markers[n]!=[p]:
                issues.append(dict(chapter=ch,number=n,expected=p,actual=markers[n]))
    report[str(volume)]=dict(queued=len(selected),uniqueMarkersWithExpectedPages=len(selected)-len(issues),
                             issues=issues,verifiedPdfSha256=actual)
print(json.dumps(report,ensure_ascii=False,indent=2))
if any(v["issues"] for v in report.values()):raise SystemExit(1)
