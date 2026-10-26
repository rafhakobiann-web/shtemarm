#!/usr/bin/env python3
"""Read-only cross-check of the two source Mathematics PDFs and native stems.
No OCR, no guesses, no automatic edits of students' question statements.
Run on the actual repository PDFs in GitHub Actions to create a QA report.
"""
from __future__ import annotations
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from collections import Counter
import fitz

ROOT=Path("public")
DATA=ROOT/"data"
INDEX=json.loads((DATA/"math-books-index.json").read_text(encoding="utf-8"))
AUDIT=json.loads((DATA/"math-transcriptions/audit.json").read_text(encoding="utf-8"))

def norm(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKC", text).lower()
                   if c.isalnum() or c in "և")

def stem_snippets(task:dict)->list[str]:
    snippets=[]
    for block in task.get("stem",[]):
        for run in block.get("runs",[]):
            if len(run)<1 or not isinstance(run[0],str):
                continue
            candidate=run[0].strip()
            # Look for descriptive Armenian words; formulas composed only of
            # short fragments must be reviewed graphically by a person.
            if len(norm(candidate))>=9 and re.search("[\u0530-\u058F]",candidate):
                snippets.append(candidate)
    return snippets

report={"method":"Native Math source stems cross-checked against exact PDF text layers",
        "books":{},"checked":0,"matched":0,"no_descriptive_phrase":0,
        "unable_to_match":0,"warnings":[],"errors":[]}
for book in ("matem-1","matem-2"):
    pdf_path=ROOT/"math/books"/(book+".pdf")
    if not pdf_path.is_file():
        report["errors"].append({"book":book,"kind":"missing_pdf","path":str(pdf_path)})
        continue
    actual_hash=hashlib.sha256(pdf_path.read_bytes()).hexdigest()
    expected_hash=AUDIT["source_sha256"][book]
    if actual_hash!=expected_hash:
        report["errors"].append({"book":book,"kind":"source_sha256_mismatch",
                                  "actual":actual_hash,"expected":expected_hash})
        continue
    doc=fitz.open(pdf_path)
    page_cache={}
    def get_page_text(page:int)->str:
        if page<0 or page>=len(doc):return ""
        if page not in page_cache:
            page_cache[page]=norm(doc[page].get_text(sort=True))
        return page_cache[page]
    task_map={}
    for section in INDEX["books"][book]["sections"]:
        key=str(section["chapter"])+"-"+str(section["section"])
        for task in section["tasks"]:
            task_map[(key,str(task["task"]))]=task
    scanned=0;matched=0;no_text=0;unmatched=0
    for source in (DATA/"math-transcriptions"/book).glob("*.json"):
        key=source.stem
        native=json.loads(source.read_text(encoding="utf-8"))
        for task_id,task in native.get("tasks",{}).items():
            meta=task_map.get((key,str(task_id)))
            if not meta:
                report["errors"].append({"book":book,"section":key,"task":task_id,"kind":"not_indexed"})
                continue
            scanned+=1
            pieces=stem_snippets(task)
            if not pieces:
                no_text+=1
                report["warnings"].append({"book":book,"section":key,"task":task_id,
                                           "kind":"graphic_or_short_stem"})
                continue
            pages=set()
            for seg in meta.get("segments",[]):
                raw=seg.get("page") if isinstance(seg,dict) else None
                if isinstance(raw,int):
                    pages.update([raw-1,raw])
            if not pages:
                report["warnings"].append({"book":book,"section":key,"task":task_id,
                                           "kind":"missing_source_page"})
                unmatched+=1
                continue
            source_text=" ".join(get_page_text(p) for p in pages)
            has_long_phrase=any(norm(piece) in source_text for piece in pieces)
            if has_long_phrase:
                matched+=1
            else:
                unmatched+=1
                report["warnings"].append({"book":book,"section":key,"task":task_id,
                                           "kind":"verify_original_requirement",
                                           "example":pieces[0][:85],"pages":sorted(p for p in pages if p>=0)})
    report["books"][book]={"pdf_pages":len(doc),"native_tasks_checked":scanned,
                           "matched_source_phrase":matched,
                           "no_descriptive_phrase":no_text,
                           "needs_visual_review":unmatched}
    report["checked"]+=scanned
    report["matched"]+=matched
    report["no_descriptive_phrase"]+=no_text
    report["unable_to_match"]+=unmatched
    doc.close()

out=DATA/"math-pdf-source-audit.json"
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:v for k,v in report.items() if k!="warnings"},ensure_ascii=False,indent=2))
print("Warnings for human verification:",len(report["warnings"]))
if report["errors"]:
    raise SystemExit(1)
