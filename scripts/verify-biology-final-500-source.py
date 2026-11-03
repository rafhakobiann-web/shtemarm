#!/usr/bin/env python3
"""Verify physical numbered markers for the final 500 Biology source references.

Usage:
  python3 scripts/verify-biology-final-500-source.py --volume4 /path/to/kensab-4.pdf
  python3 scripts/verify-biology-final-500-source.py --volume3 /path/to/kensab-3.pdf --volume4 /path/to/kensab-4.pdf

Requires PyMuPDF. The source PDFs are not committed or uploaded. Marker
verification does NOT confirm question wording, answer keys or answer type.
"""
import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path
import fitz

root=Path(__file__).resolve().parents[1]
parse=argparse.ArgumentParser()
parse.add_argument("--volume3",type=Path)
parse.add_argument("--volume4",type=Path)
args=parse.parse_args()
if not(args.volume3 or args.volume4):
    parse.error("Pass at least one user-provided original PDF")
batch=json.loads((root/"docs/biology-final-500-source-queue.json").read_text())
results={}
for volume,source in ((3,args.volume3),(4,args.volume4)):
    if source is None:continue
    index=json.loads((root/f"public/data/biology-original-volume{volume}-index.json").read_text())
    fingerprint=hashlib.sha256(source.read_bytes()).hexdigest()
    if fingerprint!=index["sourceSha256"] or fingerprint!=batch["sourceSha256"][str(volume)]:
        raise SystemExit(f"Biology {volume}: supplied source PDF SHA-256 mismatch")
    doc=fitz.open(source)
    selected=[row for row in batch["entries"] if row[0]==volume]
    errors=[]
    for chapter in index["chapters"]:
        subset=[row for row in selected if row[1]==chapter["id"]]
        if not subset:continue
        markers=defaultdict(list)
        for page in range(chapter["startPage"],chapter["endPage"]+1):
            for block in doc[page-1].get_text("dict")["blocks"]:
                for line in block.get("lines",[]):
                    for span in line["spans"]:
                        if (re.fullmatch(r"\d{1,4}",span["text"].strip())
                            and "Bold" in span["font"]
                            and min(abs(span["bbox"][0]-42.24),
                                    abs(span["bbox"][0]-56.42))<2
                            and line["dir"]==(1.0,0.0)):
                            markers[int(span["text"].strip())].append(page)
        for _v,_c,number,page,*_rest in subset:
            if markers[number]!=[page]:
                errors.append({"chapter":chapter["id"],"printedNumber":number,
                               "indexedPage":page,"actualPages":markers[number]})
    results[str(volume)]={"selected":len(selected),
                          "uniqueMatchingMarkers":len(selected)-len(errors),
                          "mismatches":errors,"sha256Verified":True}
print(json.dumps(results,ensure_ascii=False,indent=2))
if any(result["mismatches"] for result in results.values()):
    raise SystemExit(1)
