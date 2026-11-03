#!/usr/bin/env python3
"""Verify the 4 original Armenian language PDFs used for Shtemarm's TOC.

Usage:
  python scripts/verify-armenian-pdf-sources.py /path/to/source-pdf-directory

Expects hayoc-1.pdf .. hayoc-4.pdf, requires PyMuPDF and iconv (ARMSCII-8).
Verifies fingerprint, actual first pages of all 32 numbered chapters, the
8 section headings, and the official TOC. It does not claim that exercises
or answer keys have been transcribed, corrected or graded.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("source_dir", type=Path)
options = parser.parse_args()
source = json.loads((ROOT / "public/data/armenian-source-index.json").read_text())
if source["schemaVersion"] != 2:
    raise SystemExit("Unsupported Armenian source index")
issues = []
result = []

def decode(pdf_page):
    raw = pdf_page.get_text().encode("latin1", errors="replace")
    process = subprocess.run(["iconv", "-f", "ARMSCII-8", "-t", "UTF-8"],
                             input=raw, capture_output=True, check=True)
    return process.stdout.decode("utf-8", errors="replace")

for volume in source["volumes"]:
    name = volume["pdf"]
    path = options.source_dir / name
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != volume["sourceSha256"]:
        issues.append(f"{name}: PDF SHA-256 mismatch")
        continue
    pdf = fitz.open(path)
    if len(pdf) != volume["totalPages"] or len(pdf) != 256:
        issues.append(f"{name}: expected exactly 256 pages")
        continue
    toc = decode(pdf[volume["tocPdfPage"] - 1])
    sections_ok = 0
    toc_ok = 0
    for section in volume["sections"]:
        # ARMSCII-8 sources use ԵՎ where Unicode uppercasing of և yields ԵՒ.
        title = section["title"].upper().replace("ԵՒ", "ԵՎ")
        page = section["pdfPage"]
        if title not in toc:
            issues.append(f"{name}: TOC missing {title}")
        else:
            # The TOC has each page number after its title's leader dots.
            # Allow spaces/newlines and formatting in between.
            expression = re.escape(title) + r"\s*\.{3,}\s*" + str(page) + r"\b"
            if re.search(expression, toc):
                toc_ok += 1
            else:
                issues.append(f"{name}: TOC page mismatch for {title}, expected {page}")
        if title in decode(pdf[page - 1]):
            sections_ok += 1
        else:
            issues.append(f"{name}: first page {page} does not begin section {title}")
    for appendix in volume["appendices"]:
        if appendix["title"].upper() not in toc:
            issues.append(f"{name}: missing appendix {appendix['title']} in TOC")
    result.append({"volume": volume["volume"], "sha256": digest,
                   "tocPagesChecked": toc_ok, "sectionStartsChecked": sections_ok,
                   "answerAppendixPage": volume["appendices"][1]["pdfPage"]})
print(json.dumps({"books": result, "errors": issues, "verifiedScope":
                  "source fingerprints, TOC chapters and page numbers only"},
                 ensure_ascii=False, indent=2))
if issues or len(result) != 4 or any(x["sectionStartsChecked"] != 8 for x in result):
    raise SystemExit(1)
