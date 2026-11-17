#!/usr/bin/env python3
"""Read every reachable Git blob for known hard-coded credential formats.

Use before changing repository visibility. Scans Git history, not just HEAD.
Never prints secret values. Pass/fail alone cannot establish a complete audit.
"""
import re
import subprocess
import sys

# Exact known-invalid credential-shaped fixture in one historical test blob.
KNOWN_TEST_FIXTURE_BLOB = "cde98d6648f4f3827e8b4ae31dcefe0d7e6c938f"
KNOWN_TEST_FIXTURE_PATH = "src/test/public-auth-config.test.ts"
KNOWN_TEST_FIXTURE_VALUE = b"sb_secret_test-only-invalid-key"

PATTERNS = {
    "OpenAI key": re.compile(rb"\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{28,}"),
    "Google API key": re.compile(rb"\bAIza[0-9A-Za-z_-]{30,}"),
    "GitHub token": re.compile(rb"\bgh[pousr]_[A-Za-z0-9]{30,}"),
    "Supabase secret": re.compile(rb"\bsb_secret_[A-Za-z0-9_-]{20,}"),
    "Groq key": re.compile(rb"\bgsk_[A-Za-z0-9]{28,}"),
    "Stripe live key": re.compile(rb"\bsk_live_[A-Za-z0-9]{18,}"),
    "AWS key": re.compile(rb"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"),
    "Private key block": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}
commits = subprocess.check_output(["git", "rev-list", "--objects", "--all"], text=True)
seen = set()
blobs_checked = 0
violations = []
proc = subprocess.Popen(["git", "cat-file", "--batch"], stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
assert proc.stdin and proc.stdout
try:
    for row in commits.splitlines():
        parts = row.split(" ", 1)
        oid, path = parts[0], parts[1] if len(parts) > 1 else "<git object>"
        if oid in seen:
            continue
        seen.add(oid)
        proc.stdin.write((oid + "\n").encode())
        proc.stdin.flush()
        header = proc.stdout.readline().decode("ascii", "replace").split()
        if len(header) < 3 or header[1] == "missing":
            raise RuntimeError("Cannot read Git object: " + oid[:12])
        size = int(header[2])
        # Consume the object even when large so cat-file stays synchronized.
        content = proc.stdout.read(size)
        proc.stdout.read(1)  # trailing newline
        if header[1] != "blob" or size > 12_000_000 or b"\x00" in content[:8192]:
            continue
        blobs_checked += 1
        for label, pattern in PATTERNS.items():
            matches = list(pattern.finditer(content))
            if label == "Supabase secret" and oid == KNOWN_TEST_FIXTURE_BLOB and path == KNOWN_TEST_FIXTURE_PATH:
                matches = [m for m in matches if m.group(0) != KNOWN_TEST_FIXTURE_VALUE]
            if matches:
                violations.append((oid[:12], path, label))
                if len(violations) >= 40:
                    break
        if len(violations) >= 40:
            break
finally:
    proc.stdin.close()
    proc.stdout.close()
    proc.wait(timeout=20)

if violations:
    print("History scan FAILED: suspected credentials are present in reachable Git history.")
    for sha, path, label in violations:
        print(f"  {path} @ {sha}: {label}")
    print("Revoke affected keys and rewrite history before making the repository public.")
    sys.exit(1)
print(f"History scan passed: {blobs_checked} text blobs checked across reachable commits.")
print("This detects known key patterns, not all possible secrets or sensitive content.")
