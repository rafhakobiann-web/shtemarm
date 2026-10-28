#!/usr/bin/env node
/**
 * Fail closed on accidentally tracked secret files and known credential formats.
 * This is defense in depth, NOT a substitute for historical scans, key rotation
 * or a review of repository content licenses before making it public.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0").filter(Boolean);
const failures = [];
const bannedPath = [
  /(^|\/)\.env($|\.(?!example$|sample$))/i,
  /(^|\/)(?:credentials(?:-[^/]*)?|service-account[^/]*|google-services)\.json$/i,
  /\.(?:pem|p12|pfx|jks|keystore|mobileprovision)$/i,
  /(^|\/)(?:key|secrets|local)\.properties$/i,
  /(^|\/)id_(?:rsa|ecdsa|ed25519)$/i,
];
const tokens = [
  ["OpenAI key", /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{28,}/g],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{30,}/g],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}/g],
  ["Supabase secret", /\bsb_secret_[A-Za-z0-9_-]{20,}/g],
  ["Groq key", /\bgsk_[A-Za-z0-9]{28,}/g],
  ["Stripe live secret", /\bsk_live_[A-Za-z0-9]{18,}/g],
  ["AWS access ID", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
];
const textFile = /\.(?:mjs|cjs|js|jsx|ts|tsx|json|yml|yaml|toml|properties|sh|md|html|css|svg|xml|txt|gradle|kts|sql|py|gitignore)$/i;
let checked = 0;
for (const file of tracked) {
  if (bannedPath.some(re => re.test(file))) {
    failures.push(file + ": forbidden tracked secret-file path");
    continue;
  }
  if (!textFile.test(file) && !/^\.gitignore$/.test(file)) continue;
  if (statSync(file).size > 5_000_000) continue;
  const contents = readFileSync(file, "utf8");
  checked++;
  for (const [label, re] of tokens) {
    re.lastIndex = 0;
    for (const match of contents.matchAll(re)) {
      const line = contents.slice(0, match.index).split("\n").length;
      failures.push(file + ":" + line + ": " + label + " detected");
    }
  }
}
if (failures.length) {
  console.error("Secret safety check failed (" + failures.length + " issue(s)).");
  for (const message of failures) console.error(message);
  console.error("Do not print key values in CI logs. Revoke and rotate exposed credentials.");
  process.exitCode = 1;
} else {
  console.log("Secret safety check passed: " + tracked.length +
    " tracked paths checked for forbidden files, " + checked + " text files scanned.");
}
