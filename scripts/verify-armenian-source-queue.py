#!/usr/bin/env python3
"""Audit numbered source-task locations for Armenian phonetics (Section 1, Part 1).

Maintainer-only workflow: supply the four original 256-page PDFs locally.
This checks the task numbers and PDF pages against the review queue. It does NOT
extract or publish copyrighted question texts, options, explanations, or keys.
Students never upload PDFs; this is a source-verification script, not a quiz.
Requires PyMuPDF: python -m pip install pymupdf

Usage:
  python scripts/verify-armenian-source-queue.py hayoc-1.pdf hayoc-2.pdf hayoc-3.pdf hayoc-4.pdf
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "docs/armenian-phonetics-source-queue.json"
TOC = ROOT / "public/data/armenian-source-index.json"
NUMBER = re.compile(r"^(\d{1,3})\.\s+\S")


def task_numbers_on_page(page) -> list[int]:
    """Only top-level left-margin question labels, not indented answer options."""
    found = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            label = "".join(span["text"] for span in line["spans"]).strip()
            match = NUMBER.match(label)
            if match and line["bbox"][0] <= 60 and line["bbox"][1] < 760:
                found.append(int(match.group(1)))
    return found


def audit(files: list[Path]) -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    toc = json.loads(TOC.read_text(encoding="utf-8"))
    assert queue["status"] == "numbers_and_pages_only_no_answers_verified"
    assert queue["originalQuestionTextsCommitted"] == 0
    assert queue["individuallyVerifiedOfficialAnswers"] == 0
    assert len(queue["volumes"]) == len(toc["volumes"]) == len(files) == 4
    total = 0
    for idx, path in enumerate(files):
        record = queue["volumes"][idx]
        source = toc["volumes"][idx]
        vol = idx + 1
        assert record["volume"] == source["volume"] == vol
        assert record["sourceSha256"] == source["sourceSha256"], f"Volume {vol}: wrong PDF fingerprint"
        actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        assert actual_hash == record["sourceSha256"], f"Volume {vol}: source PDF differs"
        pdf = fitz.open(path)
        assert len(pdf) == 256 == source["totalPages"], f"Volume {vol}: incorrect page count"
        assert record["section"] == record["part"] == 1
        assert record["firstPdfPage"] == source["sections"][0]["pdfPage"]
        assert record["nextPartStartsPdfPage"] <= source["sections"][0]["lastPdfPage"]
        assert record["nextPartStartsPdfPage"] == record["lastPdfPage"] + 1
        assert re.search(r"Ø²ê\s*1\b", pdf[record["firstPdfPage"] - 1].get_text())
        assert re.search(r"Ø²ê\s*2\b", pdf[record["nextPartStartsPdfPage"] - 1].get_text())
        expected = 1
        for page_range in record["pageRanges"]:
            number = page_range["pdfPage"]
            assert record["firstPdfPage"] <= number <= record["lastPdfPage"]
            assert page_range["from"] == expected
            assert page_range["to"] >= expected
            actual = task_numbers_on_page(pdf[number - 1])
            required = list(range(page_range["from"], page_range["to"] + 1))
            assert actual == required, (
                f"Volume {vol}, PDF page {number}: "
                f"expected markers {required}, got {actual}"
            )
            expected = page_range["to"] + 1
        assert expected - 1 == record["taskCount"]
        total += record["taskCount"]
        print(f"Volume {vol}: {record['taskCount']} numbered source references verified, "
              f"PDF pages {record['firstPdfPage']}-{record['lastPdfPage']}")
    assert total == queue["sourceTaskMarkers"] == 572
    print(f"OK: {total} original task NUMBER/PAGE references matched; "
          "zero question texts or answer keys were imported.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdfs", nargs=4, type=Path)
    options = parser.parse_args()
    audit(options.pdfs)
