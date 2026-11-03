import type { Book, Section } from './books';

/** Merge disjoint printed tasks without changing existing progress IDs. */
export function mergeBiologyExtended(base: Book, extra: Book): Book {
  if (![33,34].includes(base.id) || extra.id !== base.id || !Array.isArray(extra.sections))
    throw new Error('Invalid Biology supplement identity');
  const sections = new Map<number, Section>();
  const ids = new Set<string>();
  for (const book of [base, extra]) {
    for (const section of book.sections) {
      if (!Array.isArray(section.units)) throw new Error('Invalid Biology section');
      const target = sections.get(section.n) ?? {...section, units: [], instr_hy: '', instr_en: ''};
      for (const unit of section.units) {
        if (ids.has(unit.id)) throw new Error(`Duplicate Biology task: ${unit.id}`);
        ids.add(unit.id);
        target.units.push(unit);
      }
      sections.set(section.n, target);
    }
  }
  return {...base, sections: [...sections.values()].sort((a,b)=>a.n-b.n).map(s=>({
    ...s, units: s.units.sort((a,b)=>Number(a.label)-Number(b.label)),
  }))};
}
