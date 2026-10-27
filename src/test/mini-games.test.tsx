import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QUICK_QUIZ_ITEMS, SUBJECTS, makeRound, resultPercent, shuffle } from "@/lib/mini-game-data";
import { TRUE_FALSE_ITEMS, MATCH_PAIRS } from "@/lib/mini-game-activities";
import { TrueFalseGame, MatchingGame, FlashcardsGame } from "@/components/AdditionalMiniGames";
import { bestResult, recordResult } from "@/lib/mini-game-progress";

beforeEach(()=>{window.localStorage.clear();});
const ids=<T extends {id:string}>(data:T[])=>new Set(data.map(q=>q.id));

describe("mini-game bank quality and topic filters",()=>{
  it("offers at least 10 answerable, nonrepetitive quiz questions in every subject",()=>{
    const subjects=SUBJECTS.filter(s=>s.id!=="mixed");
    expect(subjects).toHaveLength(8);
    for(const {id} of subjects){
      const items=QUICK_QUIZ_ITEMS.filter(item=>item.subject===id);
      expect(items.length,id).toBeGreaterThanOrEqual(10);
      const round=makeRound(QUICK_QUIZ_ITEMS,id,10,()=>0.5);
      expect(round).toHaveLength(10);
      expect(ids(round).size).toBe(10);
      for(const item of items){
        expect(item.prompt.trim().length).toBeGreaterThan(8);
        expect(item.choices).toHaveLength(4);
        expect(new Set(item.choices).size).toBe(4);
        expect(item.choices.filter(c=>c===item.answer)).toHaveLength(1);
        expect(item.explanation.trim().length).toBeGreaterThan(10);
      }
    }
    expect(ids(QUICK_QUIZ_ITEMS).size).toBe(QUICK_QUIZ_ITEMS.length);
  });
  it("supplies meaningful true/false explanations and matching cards to every subject",()=>{
    for(const {id} of SUBJECTS.filter(s=>s.id!=="mixed")){
      const tf=makeRound(TRUE_FALSE_ITEMS,id,10,()=>0.4);
      const pairs=makeRound(MATCH_PAIRS,id,8,()=>0.4);
      expect(tf.length,id).toBeGreaterThanOrEqual(8);
      expect(pairs.length,id).toBeGreaterThanOrEqual(8);
      expect(ids(tf).size).toBe(tf.length);
      expect(ids(pairs).size).toBe(pairs.length);
      expect(tf.every(x=>typeof x.truth==="boolean"&&x.reason.length>10)).toBe(true);
    }
    expect(ids(TRUE_FALSE_ITEMS).size).toBe(TRUE_FALSE_ITEMS.length);
    expect(ids(MATCH_PAIRS).size).toBe(MATCH_PAIRS.length);
    expect(new Set(MATCH_PAIRS.map(pair=>pair.left)).size).toBe(MATCH_PAIRS.length);
    expect(new Set(MATCH_PAIRS.map(pair=>pair.right)).size).toBe(MATCH_PAIRS.length);
  });
  it("creates 20-question mixed rounds without repeated tasks",()=>{
    expect(makeRound(QUICK_QUIZ_ITEMS,"mixed",20)).toHaveLength(20);
    expect(ids(makeRound(TRUE_FALSE_ITEMS,"mixed",20)).size).toBe(20);
    expect(ids(makeRound(MATCH_PAIRS,"mixed",10)).size).toBe(10);
  });
  it("does not mutate question banks when shuffling and handles invalid count safely",()=>{
    const before=[...QUICK_QUIZ_ITEMS];
    const r=makeRound(QUICK_QUIZ_ITEMS,"math",10,()=>0);
    expect(QUICK_QUIZ_ITEMS).toEqual(before);
    expect(ids(r).size).toBe(10);
    expect(shuffle([1,2,3,4],()=>0)).toEqual([2,3,4,1]);
    expect(resultPercent(7,10)).toBe(70);
    expect(resultPercent(0,0)).toBe(0);
  });
});

describe("mini-game UI and persistence",()=>{
  it("locks true/false answers, explains immediately and advances without double scoring",()=>{
    render(<TrueFalseGame subject="biology"/>);
    const question=screen.getByRole("heading",{level:2}).textContent;
    const item=TRUE_FALSE_ITEMS.find(q=>q.statement===question);
    expect(item).toBeDefined();
    fireEvent.click(screen.getByRole("button",{name:item!.truth?"Ճիշտ է":"Սխալ է"}));
    expect(screen.getByText(item!.reason)).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Ճիշտ է"})).toBeDisabled();
    fireEvent.click(screen.getByRole("button",{name:"Հաջորդ հարցը"}));
    expect(screen.queryByText(item!.reason)).not.toBeInTheDocument();
  });
  it("matches by stable IDs and does not mark a wrong pair as correct",()=>{
    render(<MatchingGame subject="russian"/>);
    const pair=MATCH_PAIRS.find(q=>q.subject==="russian")!;
    // In a shuffled round all subject cards are present.
    fireEvent.click(screen.getByRole("button",{name:pair.left}));
    const wrong=MATCH_PAIRS.find(q=>q.subject==="russian"&&q.id!==pair.id)!;
    fireEvent.click(screen.getByRole("button",{name:wrong.right}));
    expect(screen.getByText(/Սխալ զույգ է/)).toBeInTheDocument();
    expect(screen.getByText(/Սխալ փորձեր/)).toHaveTextContent("1");
    fireEvent.click(screen.getByRole("button",{name:pair.right}));
    expect(screen.getByRole("button",{name:pair.left})).toBeDisabled();
  });
  it("flip cards reveal definitions and advance only after self-assessment",()=>{
    render(<FlashcardsGame subject="armenian"/>);
    expect(screen.getByRole("button",{name:"Տեսնել պատասխանը"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Տեսնել պատասխանը"}));
    expect(screen.getByRole("button",{name:"Գիտեի"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Գիտեի"}));
    expect(screen.getByRole("progressbar",{name:"Հիշողության քարտեր"})).toHaveAttribute("aria-valuenow","1");
  });
  it("saves only higher best-score percentages and does not crash on malformed localStorage",()=>{
    expect(bestResult("quiz","math")).toBeNull();
    expect(recordResult("quiz","math",4,10)?.correct).toBe(4);
    expect(recordResult("quiz","math",3,10)?.correct).toBe(4);
    expect(recordResult("quiz","math",9,10)?.correct).toBe(9);
    expect(recordResult("quiz","math",99,10)).toBeNull();
    expect(bestResult("quiz","math")?.correct).toBe(9);
    window.localStorage.setItem("shtemarm-mini-games-v3","{broken");
    expect(bestResult("quiz","math")).toBeNull();
  });
});
