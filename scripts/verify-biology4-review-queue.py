#!/usr/bin/env python3
"""Validate Biology IV pending source-reference queue without distributing book text."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
index = json.loads((root / "public/data/biology-original-volume4-index.json").read_text())
queue = json.loads((root / "docs/biology-final-500-source-queue.json").read_text())
assert index["volume"] == 4
assert index["totalPages"] == 392
assert index["sourceSha256"] == queue["sourceSha256"]["4"]
assert sum(ch["questionCount"] for ch in index["chapters"]) == 1688
chapters = {ch["id"]: ch for ch in index["chapters"]}
seen = set()
counts = {}
for row in queue["entries"]:
    volume, chapter, number, page, answer_start, answer_end, reason = row
    if volume != 4:
        continue
    assert chapter in chapters, row
    ch = chapters[chapter]
    assert 1 <= number <= ch["questionCount"], row
    assert ch["startPage"] <= page <= ch["endPage"], row
    assert ch["answerPages"][0] <= answer_start <= answer_end <= ch["answerPages"][1], row
    assert reason, row
    identity = (chapter, number)
    assert identity not in seen, f"Duplicate question reference: {identity}"
    seen.add(identity)
    counts[chapter] = counts.get(chapter, 0) + 1
assert len(seen) == queue["distribution"]["4"] == 85
assert counts == {6: 85}, counts
print(json.dumps({"volume": 4, "queued": len(seen), "chapters": counts, "duplicateIds": 0, "valid": True}, ensure_ascii=False))
