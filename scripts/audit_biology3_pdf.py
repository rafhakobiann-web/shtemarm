#!/usr/bin/env python3
"""Audit a user-supplied Biology III PDF without reproducing its copyrighted text.

Usage: python scripts/audit_biology3_pdf.py /path/to/kensab-3.pdf --output /tmp/bio3-audit.json
Dependency: pip install pymupdf
"""
import argparse
import json
import re
from pathlib import Path

SECTIONS = [
    (1, 5, 61, "Կենդանի օրգանիզմների բազմազանությունը"),
    (2, 62, 124, "Մարդ"),
    (3, 125, 191, "Բջջի կառուցվածք և նյութափոխանակություն"),
    (4, 192, 262, "Բազմացում, զարգացում և ժառանգականություն"),
    (5, 263, 295, "Էվոլյուցիա և էկոլոգիա"),
    (6, 296, 361, "Խնդիրներ"),
]
ANSWER_PAGES = (362, 384)


def page_category(number):
    if number in (1, 2, 3, 4):
        return "front-matter", None
    for section, start, end, _ in SECTIONS:
        if start <= number <= end:
            return "questions", section
    if ANSWER_PAGES[0] <= number <= ANSWER_PAGES[1]:
        return "answer-key-or-back-matter", None
    return "unknown", None


def audit(pdf_path):
    import fitz
    pdf = fitz.open(str(pdf_path))
    if len(pdf) != 384:
        raise ValueError(f"Expected 384 pages; found {len(pdf)}")
    rows = []
    for i, page in enumerate(pdf):
        n = i + 1
        text = page.get_text("text")
        category, section = page_category(n)
        # PDF uses a legacy Armenian font encoding. Counts are metadata only,
        # not a reliable measure of readable Armenian text.
        rows.append({
            "pdfPage": n,
            "category": category,
            "section": section,
            "textCharacters": len(text),
            "embeddedImageCount": len(page.get_images(full=True)),
            "drawingCount": len(page.get_drawings()),
            "hasExtractableText": bool(text.strip()),
            "needsVisualReview": bool(page.get_images(full=True) or page.get_drawings()),
            "questionIdsVerified": [],
            "answerKeysVerified": [],
            "reviewStatus": "pending-human-review",
        })
    return {
        "source": Path(pdf_path).name,
        "totalPages": len(pdf),
        "encodingWarning": "Legacy Armenian encoding; extracted text requires visual proofreading",
        "sections": [{"number": n, "startPage": a, "endPage": b, "title": t}
                     for n, a, b, t in SECTIONS],
        "answerPages": {"start": 362, "end": 384},
        "pages": rows,
        "summary": {
            "questionPages": sum(r["category"] == "questions" for r in rows),
            "answerOrBackMatterPages": sum(r["category"] == "answer-key-or-back-matter" for r in rows),
            "pagesWithEmbeddedImages": sum(r["embeddedImageCount"] > 0 for r in rows),
            "verifiedQuestionCount": 0,
            "verifiedAnswerCount": 0,
        },
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = audit(args.pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
