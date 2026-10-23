/** Safe evaluator for the scientific calculator. No eval: a small recursive-descent parser. */

type Tok = { k: "num"; v: number } | { k: "id"; v: string } | { k: "op"; v: string } | { k: "(" } | { k: ")" };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const s = src.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").replace(/√/g, "sqrt");
  while (i < s.length) {
    const c = s[i]!;
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) throw new Error("num");
      out.push({ k: "num", v });
      i = j;
    } else if (/[a-z]/i.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/i.test(s[j]!)) j++;
      out.push({ k: "id", v: s.slice(i, j).toLowerCase() });
      i = j;
    } else if ("+-*/^!".includes(c)) {
      out.push({ k: "op", v: c });
      i++;
    } else if (c === "(") {
      out.push({ k: "(" });
      i++;
    } else if (c === ")") {
      out.push({ k: ")" });
      i++;
    } else {
      throw new Error("char");
    }
  }
  return out;
}

const FUNCS: Record<string, (x: number, deg: boolean) => number> = {
  sin: (x, d) => Math.sin(d ? (x * Math.PI) / 180 : x),
  cos: (x, d) => Math.cos(d ? (x * Math.PI) / 180 : x),
  tan: (x, d) => Math.tan(d ? (x * Math.PI) / 180 : x),
  asin: (x, d) => (d ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
  acos: (x, d) => (d ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
  atan: (x, d) => (d ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  sqrt: (x) => Math.sqrt(x),
  abs: (x) => Math.abs(x),
};
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

export function evaluate(src: string, deg: boolean): number {
  const t = tokenize(src);
  let p = 0;
  const peek = () => t[p];
  const eat = (k: Tok["k"], v?: string) => {
    const tok = t[p];
    if (!tok || tok.k !== k || (v !== undefined && (tok as { v?: string }).v !== v)) throw new Error("syntax");
    p++;
    return tok;
  };

  const expr = (): number => {
    let v = term();
    for (;;) {
      const tok = peek();
      if (tok?.k === "op" && (tok.v === "+" || tok.v === "-")) {
        p++;
        const r = term();
        v = tok.v === "+" ? v + r : v - r;
      } else return v;
    }
  };
  const term = (): number => {
    let v = unary();
    for (;;) {
      const tok = peek();
      if (tok?.k === "op" && (tok.v === "*" || tok.v === "/")) {
        p++;
        const r = unary();
        v = tok.v === "*" ? v * r : v / r;
      } else return v;
    }
  };
  const unary = (): number => {
    const tok = peek();
    if (tok?.k === "op" && (tok.v === "-" || tok.v === "+")) {
      p++;
      const v = unary();
      return tok.v === "-" ? -v : v;
    }
    return power();
  };
  const power = (): number => {
    const base = postfix();
    const tok = peek();
    if (tok?.k === "op" && tok.v === "^") {
      p++;
      return Math.pow(base, unary());
    }
    return base;
  };
  const postfix = (): number => {
    let v = primary();
    while (peek()?.k === "op" && (peek() as { v: string }).v === "!") {
      p++;
      if (v < 0 || v > 170 || !Number.isInteger(v)) throw new Error("fact");
      let f = 1;
      for (let i = 2; i <= v; i++) f *= i;
      v = f;
    }
    return v;
  };
  const primary = (): number => {
    const tok = peek();
    if (!tok) throw new Error("syntax");
    if (tok.k === "num") {
      p++;
      return tok.v;
    }
    if (tok.k === "(") {
      p++;
      const v = expr();
      eat(")");
      return v;
    }
    if (tok.k === "id") {
      p++;
      if (tok.v in CONSTS) return CONSTS[tok.v]!;
      const f = FUNCS[tok.v];
      if (!f) throw new Error("unknown");
      eat("(");
      const arg = expr();
      eat(")");
      return f(arg, deg);
    }
    throw new Error("syntax");
  };

  if (t.length === 0) throw new Error("empty");
  const v = expr();
  if (p !== t.length) throw new Error("syntax");
  if (!Number.isFinite(v)) throw new Error("nan");
  return v;
}
