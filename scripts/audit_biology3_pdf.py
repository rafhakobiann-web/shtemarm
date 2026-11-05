#!/usr/bin/env python3
"""Audit a user-supplied Biology III PDF without reproducing its copyrighted text.

Usage: python scripts/audit_biology3_pdf.py /path/to/kensab-3.pdf --output /tmp/bio3-audit.json
Dependency: pip install pymupdf
"""
import argparse
import hashlib
import json
import re
from collections import Counter
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



# These are heuristic review hints only, never a substitute for reading source
# answer pages or reconstructing copyright-protected exercise text.
QUESTION_LABEL = re.compile(r"(?m)^\s*(\d{1,3})\s*$")
FORMAT_HINTS = (
    ("matching-candidate", re.compile(r"Ñ³Ù³å³ï³ëË³Ý", re.I)),
    ("sequence-candidate", re.compile(r"Ñ³çáñ¹³Ï³Ý|Ñ»ñÃ³Ï³Ý", re.I)),
    ("selection-candidate", re.compile(r"μáÉáñ ×Çßï åÝ¹áõÙ|Üß»É ×Çßï", re.I)),
    ("true-false-candidate", re.compile(r"6 åÝ¹áõÙ|ÖÇßï ¿|êË³É", re.I)),
)

def indexed_page(chapter, number):
    """Find the page already mapped to a specific numbered source task."""
    page = chapter["startPage"]
    for first, at in chapter["pageRuns"]:
        if first > number:
            break
        page = at
    return page

def format_hint(chapter_id, preceding_text):
    if chapter_id == 6:
        return "problem-candidate"
    for candidate, pattern in FORMAT_HINTS:
        if pattern.search(preceding_text):
            return candidate
    return "unclassified"

def audit_pending_questions(pdf, root):
    """Source-linked metadata for every pending question, never source text."""
    index = json.loads((root / "public/data/biology-original-volume3-index.json").read_text(encoding="utf-8"))
    coverage = json.loads((root / "public/data/biology-volume3-coverage.json").read_text(encoding="utf-8"))
    if index["sourceSha256"] != coverage["sourceSha256"]:
        raise ValueError("The index and coverage use different source documents.")
    detected = []
    for chapter, chapter_coverage in zip(index["chapters"], coverage["chapters"]):
        if chapter["id"] != chapter_coverage["id"]:
            raise ValueError("Chapter order is not aligned with the source index.")
        for item in chapter_coverage["excluded"]:
            number = item["n"]
            page = indexed_page(chapter, number)
            source_page = pdf[page - 1]
            text = source_page.get_text("text")
            positions = [m.start() for m in QUESTION_LABEL.finditer(text) if int(m.group(1)) == number]
            # We count printed question labels, not arbitrary in-text mentions.
            # A matching label alone cannot establish a correct transcription.
            hint = format_hint(chapter["id"], text[max(0, positions[0] - 220):positions[0]]) if positions else "not-detected"
            detected.append({
                "chapter": chapter["id"], "number": number, "sourcePage": page,
                "pendingReason": item["reason"],
                "printedNumberDetected": bool(positions),
                "matchingLabelOccurrences": len(positions),
                "formatHint": hint,
                "answerVerified": False,
                "wordingVerified": False,
                "reviewStatus": "needs-source-and-rights-review",
            })
    counts = Counter(x["formatHint"] for x in detected)
    return {
        "sourceSha256": index["sourceSha256"],
        "indexedQuestions": coverage["indexedQuestions"],
        "importedQuestions": coverage["importedQuestions"],
        "pendingQuestions": len(detected),
        "detectedQuestionNumbers": sum(x["printedNumberDetected"] for x in detected),
        "ambiguousLabels": sum(x["matchingLabelOccurrences"] > 1 for x in detected),
        "formatHints": dict(counts),
        "questions": detected,
        "notice": "Metadata only. Neither original question text nor answer keys are reproduced; format hints require human review.",
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--pending-output", type=Path, help="Write a metadata-only audit of all pending source question labels.")
    args = parser.parse_args()
    result = audit(args.pdf)
    if args.pending_output:
        import fitz
        with fitz.open(str(args.pdf)) as pdf:
            root = Path(__file__).resolve().parent.parent
            source_index = json.loads((root / "public/data/biology-original-volume3-index.json").read_text(encoding="utf-8"))
            actual_hash = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
            if actual_hash != source_index["sourceSha256"]:
                raise ValueError("The source PDF hash does not match the official indexed edition.")
            pending = audit_pending_questions(pdf, root)
        args.pending_output.parent.mkdir(parents=True, exist_ok=True)
        args.pending_output.write_text(json.dumps(pending, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({key: pending[key] for key in ("pendingQuestions","detectedQuestionNumbers","ambiguousLabels","formatHints")}, ensure_ascii=False))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
