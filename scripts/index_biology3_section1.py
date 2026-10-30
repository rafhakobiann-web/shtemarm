#!/usr/bin/env python3
"""Build a metadata-only question-number/answer-key audit for Biology III section 1.

Run: python scripts/index_biology3_section1.py kensab-3.pdf --output section1-index.json
Requires PyMuPDF. Does not copy original question text or images.
"""
import argparse
import json
import re
from pathlib import Path
import fitz


def index(pdf_path):
    pdf = fitz.open(pdf_path)
    if len(pdf) != 384:
        raise ValueError("Unexpected edition/page count: expected 384")
    next_id = 1
    pages = []
    for page_num in range(5, 62):
        page = pdf[page_num - 1]
        raw_numbers = [int(n) for n in re.findall(r"(?m)^(\\d{1,3})\\s*$", page.get_text())]
        ids = []
        for number in raw_numbers:
            if number == next_id:
                ids.append(number)
                next_id += 1
        pages.append({
            "page": page_num,
            "questionIds": ids,
            "questionCount": len(ids),
            "visualReviewRequired": bool(page.get_images(full=True) or page.get_drawings()),
            "verification": "numbering-machine-extracted",
        })
    raw_key = pdf[361].get_text()
    matches = re.findall(r"(?m)^(\\d{1,3})\\s*\\n-\\s*([1-4])\\s*$", raw_key)
    keys = {int(n): int(answer) for n, answer in matches if 1 <= int(n) <= 305}
    return {
        "volume": 3,
        "section": 1,
        "sourcePages": [5, 61],
        "firstQuestionId": 1,
        "lastQuestionId": next_id - 1,
        "questionCount": next_id - 1,
        "pages": pages,
        "answerKeyPage362": [
            {"questionId": n, "answerOption": answer, "status": "machine-extracted-unproofread"}
            for n, answer in sorted(keys.items())
        ],
        "warnings": [
            "No question text or answer options have been transcribed.",
            "Answer keys on later pages and non-MC answer types require separate review.",
            "Legacy Armenian PDF encoding and figures require visual verification.",
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = index(args.pdf)
    Path(args.output).write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {output['questionCount']} section-one question numbers and "
          f"{len(output['answerKeyPage362'])} page-362 answer entries")
