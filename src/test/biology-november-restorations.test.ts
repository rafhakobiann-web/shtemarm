import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => JSON.parse(readFileSync(`public/data/${p}.json`, "utf8"));
const book3 = read("bio-book3");
const book4 = read("bio-book4");
const unit = (volume: number, section: number, n: number) =>
  (volume === 3 ? book3 : book4).sections.find((s: {n:number}) => s.n === section)
    .units.find((u: {id:string}) => u.id === `bio${volume}-s${section}-q${n}`);

describe("Biology source restorations checked on 2026-11-03", () => {
  it("restores precisely the 30 reviewed printed IDs with their original page and key", () => {
    // Independent transcription of the printed answer tables, not generated
    // from the current playable bank. Page references are printed pages.
    const expected = [
      [3,2,5,62,"2"], [3,2,139,81,"4"], [3,2,175,86,"1"],
      [3,2,177,86,"3"], [3,2,185,87,"3"], [3,2,195,89,"4"],
      [3,3,124,142,"3"], [3,3,147,145,"1"], [3,3,190,151,"3"],
      [3,4,30,196,"2"], [3,4,31,196,"1"], [3,4,57,199,"3"],
      [3,4,82,203,"4"], [3,4,91,205,"4"], [3,4,169,216,"1"],
      [3,4,200,221,"2"], [3,4,213,223,"2"],
      [4,1,98,18,"4"], [4,2,116,60,"4"], [4,2,121,61,"2"],
      [4,2,129,62,"4"], [4,2,134,63,"1"], [4,2,138,63,"2"],
      [4,3,166,138,"2"], [4,3,179,140,"3"], [4,4,1,184,"3"],
      [4,4,7,185,"3"], [4,4,10,185,"1"], [4,4,32,188,"2"],
      [4,5,62,278,"3"],
    ] as const;
    const entries = read("biology-reviewed-restorations").entries.filter(
      (e: {reviewDate:string}) => e.reviewDate === "2026-11-03",
    );
    expect(entries).toHaveLength(expected.length);
    for (const [v, s, n, page, answer] of expected) {
      const u = unit(v, s, n);
      expect(u?.sourcePage).toBe(page);
      expect(u?.questions[0].n).toBe(String(n));
      expect(u?.questions[0].answer).toBe(answer);
      expect(Object.keys(u.questions[0].options)).toEqual(["1","2","3","4"]);
      const proof = entries.find((e: {volume:number;chapter:number;number:number}) =>
        e.volume === v && e.chapter === s && e.number === n);
      expect(proof?.answerKeyPage).toBeGreaterThan(page);
    }
  });

  it("keeps all four page-break continuations, including the complete last option", () => {
    for (const [v,s,n,page,end] of [
      [3,2,185,87,88], [3,4,169,216,217], [4,1,98,18,19], [4,4,32,188,189],
    ]) {
      expect(unit(v,s,n).sourcePage).toBe(page);
      expect(unit(v,s,n).sourceEndPage).toBe(end);
    }
    expect(unit(3,2,185).questions[0].options["3"]).toContain("կողմնային եղջյուրներից");
    expect(unit(3,2,185).questions[0].options["4"]).toBe("մսի արգանակի և բանջարեղենի հյութերի ներմուծումն արյան մեջ");
    expect(unit(3,4,169).questions[0].options["4"]).toContain("միջավայրի բոլոր գործոնների ազդեցությունից");
    expect(unit(4,1,98).questions[0].options["4"]).toContain("ենթակլանային հանգույցից և փորի նյարդային շղթայից");
    expect(unit(4,4,32).questions[0].options["4"]).toContain("նույն առանձնյակի մարմնական բջջի հետ");
  });

  it("preserves powers, subscripts, ion charges and all genotype alternatives as readable text", () => {
    expect(unit(3,2,5).questions[0].options["2"]).toBe("500 սմ³");
    expect(unit(3,2,195).questions[0].options["4"]).toBe("B₁₂");
    expect(unit(3,3,190).questions[0].stem).toContain("CO₂ և H₂O");
    expect(unit(3,4,57).questions[0].options["4"]).toBe("(3:1)² հարաբերություն");
    expect(unit(3,4,82).questions[0].options["4"]).toBe("Xᵈ Xᵈ և Xᴰ Y");
    expect(unit(3,4,200).questions[0].options["1"]).toContain("180°");
    expect(unit(4,4,1).questions[0].stem).toContain("G₂");
    expect(Object.values(unit(4,3,179).questions[0].options)).toEqual(["OH⁻","K⁺","H⁺","Na⁺"]);
    expect(Object.values(unit(4,5,62).questions[0].options)).toEqual(["NO₃⁻","NH₄⁺","N₂","NO₂⁻"]);
  });

  it("leaves essential figures and unsupported answer formats in the review queue", () => {
    for (const [v, count, pending] of [[3,928,909],[4,790,898]]) {
      const coverage = read(`biology-volume${v}-coverage`);
      expect(coverage.importedQuestions).toBe(count);
      expect(coverage.chapters.flatMap((c: {excluded:unknown[]}) => c.excluded)).toHaveLength(pending);
      expect(coverage.chapters.flatMap((c: {excluded:{reason:string}[]}) => c.excluded)
        .every((e: {reason:string}) => ["figure-review","answer-type-pending"].includes(e.reason))).toBe(true);
    }
  });
});
