#!/usr/bin/env python3
"""Verify original Armenian language/literature PDF navigation without copying text.

Usage:
    python scripts/verify-armenian-pdfs.py /path/hayoc-1.pdf /path/hayoc-2.pdf \
      /path/hayoc-3.pdf /path/hayoc-4.pdf

Requires PyMuPDF (fitz). Run locally with the original uploaded files.
This verifies PDF identity, page count, section-heading locations, the
statement-bundle boundary and answer table boundary. It does NOT verify each
question's wording, options or answer. Never commit the supplied PDFs.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument("pdfs",nargs=4,type=Path)
args=parser.parse_args()
index=json.loads((root/"public/data/armenian-source-index.json").read_text(encoding="utf-8"))
if len(index["volumes"])!=4:raise SystemExit("Expected exactly four source volumes")
failures=[]
for source,filename in zip(index["volumes"],args.pdfs):
    volume=source["volume"]
    digest=hashlib.sha256(filename.read_bytes()).hexdigest()
    if digest != source["sourceSha256"]:
        failures.append(f"Volume {volume}: SHA-256 mismatch")
        continue
    pdf=fitz.open(filename)
    if len(pdf)!=source["totalPages"]:
        failures.append(f"Volume {volume}: unexpected page count {len(pdf)}")
        continue
    for section in source["sections"]:
        page=section["pdfPage"]
        heading=re.search(r"´²ÄÆÜ\s*"+str(section["number"])+r"\b",pdf[page-1].get_text())
        if not heading:
            failures.append(f"Volume {volume}: section {section['number']} missing on PDF page {page}")
    statement=source["statementBundle"]
    statement_text=pdf[statement["pdfPage"]-1].get_text()
    if "äÜ¸àôØÜºðÆ" not in statement_text and "äÝ¹áõÙÝ»ñÇ" not in statement_text:
        failures.append(f"Volume {volume}: statement bundle heading missing")
    answer_text=pdf[source["answerKeyStartPdfPage"]-1].get_text()
    if "´²ÄÆÜ" not in answer_text and "Պատասխաններ" not in answer_text:
        failures.append(f"Volume {volume}: answer table start not recognized")
    print(json.dumps({"volume":volume,"pdfPages":len(pdf),"sectionsChecked":len(source["sections"]),
       "statementBundlePage":statement["pdfPage"],
       "answerKeyStartPage":source["answerKeyStartPdfPage"],
       "sourceSha256Verified":True},ensure_ascii=False))
if failures:
    for item in failures:print("ERROR:",item)
    raise SystemExit(1)
print("OK: all four source PDFs checked. Individual exercise answers remain unverified.")
