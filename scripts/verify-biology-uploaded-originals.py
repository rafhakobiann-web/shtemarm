#!/usr/bin/env python3
"""Verify that the owner's Biology III/IV source PDFs match the indexed originals.

Usage: python scripts/verify-biology-uploaded-originals.py kensab-3.pdf kensab-4.pdf
This script does not publish source text or modify student question banks.
"""
from __future__ import annotations

import hashlib
import sys
from pathlib import Path

SOURCES = (
    ("Biology III", "adc0ddf59fa1008d6dd50f8d41583e44aa7161d2e23bc83f62b4c482e0722b93", 384),
    ("Biology IV", "9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e", 392),
)


def check(path: Path, name: str, expected_hash: str, expected_pages: int) -> bool:
    if not path.is_file():
        print(f"FAIL {name}: file not found: {path}")
        return False
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    if digest.hexdigest() != expected_hash:
        print(f"FAIL {name}: SHA-256 does not match indexed source")
        return False
    try:
        import fitz  # PyMuPDF, also used by the Biology importer
        with fitz.open(path) as pdf:
            page_count = len(pdf)
    except ImportError:
        print(f"PASS {name}: SHA-256 verified; page-count check skipped (install PyMuPDF)")
        return True
    if page_count != expected_pages:
        print(f"FAIL {name}: expected {expected_pages} pages, got {page_count}")
        return False
    print(f"PASS {name}: SHA-256 verified; {page_count} pages")
    return True


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python scripts/verify-biology-uploaded-originals.py kensab-3.pdf kensab-4.pdf")
        return 2
    return 0 if all(
        check(Path(path), name, digest, pages)
        for path, (name, digest, pages) in zip(sys.argv[1:], SOURCES)
    ) else 1


if __name__ == "__main__":
    raise SystemExit(main())
