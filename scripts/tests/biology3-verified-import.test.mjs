import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const command = path.join(root, "scripts/import-biology3-verified.mjs");
const dataPaths = [
  "public/data/bio-book3.json",
  "public/data/biology-volume3-coverage.json",
  "public/data/biology-original-volume3-index.json",
  "public/data/biology-backlog-summary.json",
  "public/data/biology-pending-books.json",
];
function run(cwd, ...args) {
  return spawnSync(process.execPath, [command, ...args], {cwd, encoding: "utf8"});
}
function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "shtemarm-biology3-"));
  for (const p of dataPaths) {
    fs.mkdirSync(path.dirname(path.join(base,p)), {recursive:true});
    fs.copyFileSync(path.join(root,p),path.join(base,p));
  }
  return base;
}
function verifiedExample(rootDir) {
  const index=JSON.parse(fs.readFileSync(path.join(rootDir,dataPaths[2]),"utf8"));
  const sixth=index.chapters.find(ch=>ch.id===6);
  // Synthetic fixture: never included in the real student question bank.
  return {
    volume:3,sourceSha256:index.sourceSha256,rightsConfirmed:true,
    questions:[{
      chapter:6,number:1,sourcePage:sixth.startPage,
      kind:"num",verifiedText:true,verifiedAnswer:true,
      payload:{stem:"Synthetic fixture: compute 1 + 1.",answer:"2"}
    }]
  };
}
test("current Biology III source index, answers and coverage are consistent",()=>{
  const r=run(root,"--check");
  assert.equal(r.status,0,r.stderr);
  assert.deepEqual(JSON.parse(r.stdout),{indexed:1837,imported:911,pending:926});
});
test("manifest includes all 926 pending source question IDs and pages",()=>{
  const r=run(root,"--manifest");
  assert.equal(r.status,0,r.stderr);
  const manifest=JSON.parse(r.stdout);
  assert.equal(manifest.chapters.reduce((sum,ch)=>sum+ch.pending.length,0),926);
  assert.equal(manifest.chapters[5].pending.length,372);
  assert(manifest.chapters.every(ch=>ch.pending.every(q=>Number.isInteger(q.page) && q.page>0)));
  assert(!r.stdout.includes('"stem"'));
});
test("dry-run and applied synthetic unit preserve source accountability",()=>{
  const dir=sandbox();
  try{
    const original=fs.readFileSync(path.join(dir,dataPaths[0]),"utf8");
    const patchPath=path.join(dir,"private-review-patch.json");
    fs.writeFileSync(patchPath,JSON.stringify(verifiedExample(dir)));
    let r=run(dir,"--dry-run",patchPath);
    assert.equal(r.status,0,r.stderr);
    assert.equal(JSON.parse(r.stdout).after.pending,925);
    assert.equal(fs.readFileSync(path.join(dir,dataPaths[0]),"utf8"),original);
    r=run(dir,"--apply",patchPath);
    assert.equal(r.status,0,r.stderr);
    const book=JSON.parse(fs.readFileSync(path.join(dir,dataPaths[0]),"utf8"));
    assert.equal(book.sections.find(s=>s.n===6).units[0].kind,"num");
    const coverage=JSON.parse(fs.readFileSync(path.join(dir,dataPaths[1]),"utf8"));
    assert.equal(coverage.importedQuestions,912);
    assert.equal(coverage.chapters[5].excluded.length,371);
    const board=JSON.parse(fs.readFileSync(path.join(dir,dataPaths[3]),"utf8"));
    assert.equal(board.books.find(b=>b.volume===3).pending,925);
    r=run(dir,"--check");
    assert.equal(r.status,0,r.stderr);
    assert.equal(JSON.parse(r.stdout).pending,925);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test("rejects unverified or unauthorized additions",()=>{
  const dir=sandbox();
  try{
    const patch=verifiedExample(dir);
    patch.rightsConfirmed=false;
    const patchPath=path.join(dir,"invalid-patch.json");
    fs.writeFileSync(patchPath,JSON.stringify(patch));
    const r=run(dir,"--dry-run",patchPath);
    assert.notEqual(r.status,0);
    assert.match(r.stderr,/Rights to publish/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
