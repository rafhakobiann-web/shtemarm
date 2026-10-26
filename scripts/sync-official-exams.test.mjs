import test from "node:test";
import assert from "node:assert/strict";
import { officialUrl, parseOfficialRows, mergedCatalog } from "./sync-official-exams.mjs";

const fixture = '<table><tr><td>1</td><td>26/10/2026</td><td>Հայոց պատմություն</td>' +
  '<td><a href="/files/history-1.pdf">Թեստ 1</a></td>' +
  '<td><a href="/files/history-answer.pdf">Պատասխաններ</a></td></tr>' +
  '<tr><td>2</td><td>22/10/2026</td><td>Կենսաբանություն</td>' +
  '<td>-----------</td><td>-----------</td></tr></table>';

test("identifies trusted published links and pending materials", () => {
  const rows = parseOfficialRows(fixture);
  assert.equal(rows.history.date, "2026-10-26");
  assert.equal(rows.history.status, "published");
  assert.equal(rows.history.links.length, 2);
  assert.equal(rows.history.links[1].kind, "answers");
  assert.equal(rows.biology.status, "pending");
  assert.equal(rows.biology.links.length, 0);
});
test("rejects external and dangerous URLs", () => {
  assert.equal(officialUrl("javascript:alert(1)"), null);
  assert.equal(officialUrl("https://evil.example/file.pdf"), null);
  assert.equal(officialUrl("/files/exam.pdf"), "https://dimord.am/files/exam.pdf");
});
test("does not regress from published to pending", () => {
  const row = parseOfficialRows(fixture).history;
  const old = { version: 1, updatedAt: "old", papers: [row] };
  assert.equal(mergedCatalog(old, { ...row, status: "pending", links: [] }), old);
});
test("ignores unrelated rows", () => {
  assert.deepEqual(parseOfficialRows("<table><tr><td>test</td></tr></table>"), { history: null, biology: null });
});
