import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const reviewed = read('public/data/biology-reviewed-restorations.json').entries;
let total = 0;
for (const volume of [3, 4]) {
  const index = read(`public/data/biology-original-volume${volume}-index.json`);
  const book = read(`public/data/bio-book${volume}.json`);
  const coverage = read(`public/data/biology-volume${volume}-coverage.json`);
  assert.equal(book.id, 30 + volume);
  assert.equal(book.source.sha256, index.sourceSha256);
  assert.equal(book.source.complete, false);
  const ids = new Set();
  for (const chapter of index.chapters) {
    const section = book.sections.find(s => s.n === chapter.id);
    const report = coverage.chapters.find(c => c.id === chapter.id);
    const accounted = new Set(report.excluded.map(e => e.n));
    assert.equal(accounted.size, report.excluded.length);
    for (const unit of section?.units ?? []) {
      assert(!ids.has(unit.id)); ids.add(unit.id);
      assert.equal(unit.kind, 'mc');
      assert.equal(unit.questions.length, 1);
      const question = unit.questions[0];
      const number = Number(question.n);
      assert(!accounted.has(number)); accounted.add(number);
      assert.equal(unit.id, `bio${volume}-s${chapter.id}-q${number}`);
      assert.equal(question.answer, chapter.choiceKeys[number - 1]);
      assert.deepEqual(Object.keys(question.options), ['1', '2', '3', '4']);
      const expectedPage = chapter.pageRuns.filter(([n]) => n <= number).at(-1)[1];
      assert.equal(unit.sourcePage, expectedPage);
      // Some original printed questions are grammatically complete but short
      // (e.g., a one-word subject followed by a full stop). Do not invent
      // padding text merely to satisfy an arbitrary length threshold.
      // The exception is allowed only for a specifically page-and-key-checked
      // question from this exact source PDF.
      if (question.stem.trim().length <= 10) {
        const proof = reviewed.find(r =>
          r.volume === volume && r.chapter === chapter.id &&
          r.number === number && r.page === expectedPage &&
          r.answer === question.answer && r.sourceSha256 === index.sourceSha256 &&
          r.wordingAndOptionsComparedToOriginal === true &&
          r.printedAnswerComparedToOriginal === true,
        );
        assert(proof, `Short question without original-page proof: ${volume}:${chapter.id}:${number}`);
      }
      for (const text of [question.stem, ...Object.values(question.options)]) {
        assert(text.trim().length);
        // U+00BB (») is a valid Armenian quotation mark, not legacy mojibake.
        assert(!/\ufffd|www\.|atc\.am|[\u00b2-\u00ba\u00bc-\u00ff]/i.test(text));
      }
    }
    assert.equal(report.imported, section?.units.length ?? 0);
    assert.equal(accounted.size, chapter.questionCount);
    for (let n = 1; n <= chapter.questionCount; n++) assert(accounted.has(n));
  }
  assert.equal(ids.size, coverage.importedQuestions);
  const pending = read('public/data/biology-pending-books.json').books.find(b => b.part === volume);
  assert.equal(pending.transcribedQuestions + (pending.sourceAlignedAdaptedQuestions ?? 0), ids.size);
  assert.equal(pending.remainingQuestions + ids.size, coverage.indexedQuestions);
  if (volume === 3) {
    assert.equal(pending.transcribedQuestions, 911);
    assert.equal(pending.sourceAlignedAdaptedQuestions, 34);
    const adapted = book.sections.flatMap(s => s.units).filter(u => u.sourceAlignedAdapted);
    assert.equal(adapted.length, 34);
    assert(adapted.every(u => u.passage.includes('Բնագրի բառացի վերարտադրություն չէ')));
  }
  // Source-reviewed anchors: don't shift the first item or renumber later units.
  const first = book.sections[0].units[0].questions[0];
  assert.equal(first.n, '1');
  assert.equal(first.answer, volume === 3 ? '3' : '4');
  assert(first.stem.includes(volume === 3 ? 'ագռավաչքին' : 'բակտերիաներն'));
  console.log(`Biology ${volume}: ${ids.size} source text questions; ${pending.remainingQuestions} pending`);
  total += ids.size;
}
assert(total > 1600);
console.log(`Validated ${total} distinct questions, printed keys, source pages, and complete coverage accounting.`);
