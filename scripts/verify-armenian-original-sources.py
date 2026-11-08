#!/usr/bin/env python3
"""Verify structural index of the user's four original 2018 Armenian PDFs.

Run:
  python3 scripts/verify-armenian-original-sources.py hayoc-1.pdf hayoc-2.pdf hayoc-3.pdf hayoc-4.pdf

Needs PyMuPDF. Reads printed contents and fingerprints only; it never
extracts, copies or publishes copyrighted question text or answer keys.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser(description=__doc__)
p.add_argument("pdfs", nargs=4, type=Path, help="Volumes I, II, III, IV in order")
p.add_argument("--json-out", type=Path, help="Optional structural validation report")
args = p.parse_args()
index = json.loads((ROOT/"public/data/armenian-source-index.json").read_text(encoding="utf8"))
if len(index["volumes"]) != 4:
    raise SystemExit("Expected four Armenian original volumes")
report = []
errors = []
for i, path in enumerate(args.pdfs):
    volume = index["volumes"][i]
    if volume["volume"] != i + 1:
        errors.append(f"Volume {i+1}: misordered source index")
        continue
    pdf = fitz.open(path)
    actual_sha = hashlib.sha256(path.read_bytes()).hexdigest()
    if len(pdf) != 256 or actual_sha != volume["sourcePdfSha256"]:
        errors.append(f"Volume {i+1}: page count or PDF fingerprint mismatch")
        continue
    toc = []
    for line in pdf[2].get_text("text").splitlines():
        m = re.search(r"\.{8,}\s*(\d{1,3})\s*$", line)
        if m:
            toc.append(int(m.group(1)))
    expected = [s["pdfPage"] for s in volume["sections"]]+[
        volume["appendixStartPage"],volume["answerKeyStartPage"]]
    if toc != expected:
        errors.append(f"Volume {i+1}: printed ToC pages {toc} differ from index {expected}")
    for j, chapter in enumerate(volume["sections"]):
        end = expected[j+1]-1
        if chapter["endPdfPage"] != end:
            errors.append(f"Volume {i+1}, chapter {j+1}: wrong final page")
    report.append({
        "volume": i+1,
        "sha256Verified":actual_sha == volume["sourcePdfSha256"],
        "pdfPages":len(pdf),
        "sourceChapters":len(volume["sections"]),
        "contentsPagesMatch":toc == expected,
        "appendixPage":volume["appendixStartPage"],
        "answerKeyStartPage":volume["answerKeyStartPage"],
        "questionTextPublished":False
    })
payload = {"results":report,"errors":errors}
output = json.dumps(payload,ensure_ascii=False,indent=2)+"\n"
print(output,end="")
if args.json_out:
    args.json_out.write_text(output,encoding="utf8")
if errors:
    raise SystemExit(1)
