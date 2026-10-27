#!/usr/bin/env python3
"""OCR Armenian physics originals to a *review queue*, never straight into a graded bank.

Run: python scripts/digitize-physics-scans.py --book1 fizika-1_compressed.pdf \
         --book2 fizika-2_compressed.pdf --output /tmp/physics-ocr --pages 5:40

No OCR answer is graded or represented as source-checked. The output is a
staging JSON that a reviewer must compare with the original PDF and answer key.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

try:
    import fitz  # PyMuPDF
except ImportError as exc:
    raise SystemExit("Install local dependency: pip install PyMuPDF") from exc

SOURCES = {
    1: {
        "sha256": "f2e92bfd8c2fe7918f8c02bdfd97504a5445dce83b8bd2b042b5749c3a42f8e0",
        "pages": 430, "answersStart": 406,
    },
    2: {
        "sha256": "3e4af54287b3895f2ac401226d5915a6bf1467b312d7c7c66c30157ce0238d07",
        "pages": 436, "answersStart": 409,
    },
}
QUESTION = re.compile(r"^\s*(\d{1,4})[.)]\s+(\S.*)$")
OPTION = re.compile(r"^\s*([1-4])\)\s+")
SECTION = re.compile(r"^\s*(\d+\.\d+)\.\s+(.+)$")

def fingerprint(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for blob in iter(lambda: stream.read(4 * 1024 * 1024), b""):
            digest.update(blob)
    return digest.hexdigest()

def ocr_one(args: tuple[str,int,int,str]) -> dict:
    file, index, dpi, lang = args
    doc = fitz.open(file)
    try:
        page = doc[index - 1]
        pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72),
                             colorspace=fitz.csGRAY, alpha=False)
        image = pix.tobytes("png")
    finally:
        doc.close()
    run = subprocess.run(
        ["tesseract", "stdin", "stdout", "-l", lang, "--psm", "6"],
        input=image, capture_output=True, timeout=60, check=False,
    )
    if run.returncode:
        return {"page": index, "error": run.stderr.decode("utf8","replace")[:300],
                "text": ""}
    text = run.stdout.decode("utf8", "replace")
    # An OCR word is not an authoritative book transcription.
    return {"page": index, "text": text}

def candidates(pages: list[dict]) -> list[dict]:
    result: list[dict] = []
    active: dict | None = None
    for page in pages:
        if "error" in page:
            if active:
                active["warnings"].append("ocr_page_failed")
            continue
        for line in page["text"].splitlines():
            line = line.strip()
            if not line or line.lower() in {"www.atc.am","www.atc.am."}:
                continue
            match=QUESTION.match(line)
            if match:
                number=int(match.group(1))
                # Outside the source numbering 1..9999 or option markers 1..4
                # with ')' are not distinguishable from OCR errors; record
                # questionable items instead of silently altering the bank.
                if active:
                    result.append(active)
                active={
                    "printedNumberCandidate":number,"pageStart":page["page"],
                    "pageEnd":page["page"],"ocrLines":[line],
                    "status":"ocr-needs-manual-review","verifiedAnswer":None,
                    "warnings":[]
                }
            elif active:
                active["ocrLines"].append(line)
                active["pageEnd"]=page["page"]
        # No automatic answer-book association; PDF scans often contain
        # graphical choice layouts and equations that OCR cannot read safely.
    if active:
        result.append(active)
    prev=0
    for item in result:
        n=item["printedNumberCandidate"]
        if n != prev + 1:
            item["warnings"].append("nonconsecutive_ocr_question_number")
        if len(item["ocrLines"]) < 3:
            item["warnings"].append("short_or_incomplete_text")
        options = sum(1 for line in item["ocrLines"] if OPTION.match(line))
        if options != 4:
            item["warnings"].append("choices_not_reliably_parsed")
        if any(term in " ".join(item["ocrLines"]).lower() for term in
               ["նկար", "գրաֆիկ", "պատկեր", "գծագիր"]):
            item["warnings"].append("inspect_source_diagram")
        prev=n
    return result

def process(volume: int, source: Path, dest: Path, page_range: str,
            workers: int, dpi: int, lang: str) -> dict:
    spec = SOURCES[volume]
    sha=fingerprint(source)
    if sha != spec["sha256"]:
        raise ValueError(f"Physics part {volume}: original PDF hash mismatch. "
                         "Refuse to confuse editions or answer keys.")
    doc=fitz.open(source)
    length=len(doc)
    doc.close()
    if length!=spec["pages"]:
        raise ValueError(f"Expected {spec['pages']} scanned pages in part {volume}, got {length}")
    lo,hi=(int(v) for v in page_range.split(":"))
    lo=max(5,lo); hi=min(hi,spec["answersStart"] - 1)
    if hi < lo:
        raise ValueError("OCR range must contain at least one exercise page")
    tasks=[(str(source),i,dpi,lang) for i in range(lo,hi+1)]
    pages=[]
    if workers == 1:
        for i,t in enumerate(tasks,1):
            pages.append(ocr_one(t))
            if i % 10 == 0:
                print(f"Part {volume}: {i}/{len(tasks)} scanned",flush=True)
    else:
        with ProcessPoolExecutor(max_workers=workers) as pool:
            futures={pool.submit(ocr_one,t):t[1] for t in tasks}
            for i, future in enumerate(as_completed(futures),1):
                pages.append(future.result())
                if i%10==0:
                    print(f"Part {volume}: {i}/{len(tasks)} scanned",flush=True)
    pages.sort(key=lambda item:item["page"])
    parsed=candidates(pages)
    data={
        "format":"physics-source-ocr-staging-v1",
        "volume":volume,"sourceSha256":sha,
        "sourcePhysicalPages":length,"pageRange":[lo,hi],
        "status":"UNVERIFIED OCR TEXT — NOT A PLAYABLE QUESTION BANK",
        "questionCandidates":parsed,
        "ocrPages":pages,
    }
    dest.mkdir(parents=True,exist_ok=True)
    out=dest/f"physics-part{volume}-ocr-stage-{lo}-{hi}.json"
    out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n","utf8")
    summary={
        "volume":volume,"pages":len(pages),
        "questionCandidates":len(parsed),
        "requiresReview":sum(bool(x["warnings"]) for x in parsed),
        "ocrFailures":sum("error" in p for p in pages),
        "output":str(out),
    }
    return summary

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--book1",required=True,type=Path)
    ap.add_argument("--book2",required=True,type=Path)
    ap.add_argument("--output",default="physics-ocr-output",type=Path)
    ap.add_argument("--pages",default="5:409",
                    help="Inclusive physical PDF pages, clamped before answer keys; e.g. 5:35")
    ap.add_argument("--workers",type=int,default=2)
    ap.add_argument("--dpi",type=int,default=130)
    ap.add_argument("--language",default="Armenian")
    args=ap.parse_args()
    if not 1<=args.workers<=8 or not 96<=args.dpi<=240:
        ap.error("workers 1..8, dpi 96..240")
    if not re.fullmatch(r"\d+:\d+",args.pages):
        ap.error("--pages must be START:END")
    reports=[]
    for volume,source in [(1,args.book1),(2,args.book2)]:
        reports.append(process(volume,source,args.output,args.pages,
                               args.workers,args.dpi,args.language))
    print(json.dumps(reports,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
