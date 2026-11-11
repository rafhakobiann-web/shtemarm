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

 
// Current learner coverage includes all four stage files. The earlier
// single-file coverage above is a reproducible historical checkpoint only.
let finalIndexed = 0;
let finalAvailable = 0;
for (const volume of [3,4]) {
  const idx = read('public/data/biology-original-volume' + volume + '-index.json');
  const names = ['bio','biology-extended','biology-pending','biology-last61'];
  const stages = names.map((prefix) => read('public/data/' + prefix + '-book' + volume + '.json'));
  const last = stages.at(-1);
  assert.equal(last.id, 30 + volume);
  assert.equal(last.source.sha256, idx.sourceSha256);
  assert.equal(last.source.complete, false, 'Manual proofreading is not certified');

  const coverage = new Map(idx.chapters.map(chapter => [chapter.id, new Set()]));
  for (const stage of stages) {
    assert.equal(stage.id, 30 + volume);
    for (const section of stage.sections) {
      const present = coverage.get(section.n);
      assert(present, 'Unknown Biology chapter ' + section.n);
      const chapter = idx.chapters.find(row => row.id === section.n);
      for (const unit of section.units) {
        const n = Number(unit.label);
        assert(Number.isInteger(n) && n > 0 && n <= chapter.questionCount);
        assert.equal(unit.id, 'bio' + volume + '-s' + section.n + '-q' + n);
        assert(!present.has(n), 'Duplicate Biology ' + volume + ':' + section.n + ':' + n);
        present.add(n);
      }
    }
  }

  let indexed = 0;
  let imported = 0;
  for (const chapter of idx.chapters) {
    const present = coverage.get(chapter.id);
    indexed += chapter.questionCount;
    imported += present.size;
    assert.equal(present.size, chapter.questionCount,
      'Biology ' + volume + ' chapter ' + chapter.id + ' missing imports');
    for (let n = 1; n <= chapter.questionCount; n++)
      assert(present.has(n), 'Missing Biology ' + volume + ':' + chapter.id + ':' + n);
  }
  assert.equal(indexed, volume === 3 ? 1837 : 1688);
  assert.equal(imported, indexed);

  const restored = last.sections.flatMap(section => section.units);
  assert.equal(restored.length, volume === 3 ? 28 : 33);
  for (const section of last.sections) {
    const chapter = idx.chapters.find(row => row.id === section.n);
    for (const unit of section.units) {
      const n = Number(unit.label);
      const page = chapter.pageRuns.filter(([start]) => start <= n).at(-1)?.[1];
      assert.equal(unit.sourcePage, page, 'Wrong source page for ' + unit.id);
      assert(Number.isInteger(unit.sourceAnswerPage) && unit.sourceAnswerPage > page);
      if (unit.kind === 'mc') {
        assert(unit.questions.length > 0);
        for (const question of unit.questions) {
          assert(question.stem?.trim(), 'Blank question for ' + unit.id);
          assert(question.options?.[question.answer]?.trim(), 'Missing answer option for ' + unit.id);
        }
      } else if (unit.kind === 'match') {
        assert(unit.passage?.trim());
        assert(Object.keys(unit.answer).length > 0);
        assert(Object.values(unit.answer).every(value => Number.isInteger(value) && value > 0));
      } else if (unit.kind === 'seq' || unit.kind === 'set') {
        assert(unit.passage?.trim());
        assert(unit.answer.length > 0);
        assert(Number.isInteger(unit.count) && unit.count > 0);
        assert(unit.answer.every(value => Number.isInteger(value) && value >= 1 && value <= unit.count));
      } else {
        assert.fail('Unsupported final Biology format: ' + unit.id);
      }
    }
  }
  finalIndexed += indexed;
  finalAvailable += imported;
  console.log('Biology ' + volume + ': ' + imported + '/' + indexed +
    ' indexed tasks available; manual review still pending');
}
assert.equal(finalIndexed, 3525);
assert.equal(finalAvailable, 3525);
console.log('Biology III/IV final import audit: 3,525 / 3,525 IDs present; 0 missing.');
