type Locale="hy"|"en"|"ru";
export type OfflineMathInput={kind:"choice"|"tf"|"open";question:string;correct:string;chosen:string|null;options:string[]};
const UI={
hy:{given:"Տրված է",step:"Լուծում",check:"Ստուգում",answer:"Պատասխան",key:"Պատասխանների բանալու համաձայն",missing:"Այս հարցի համար դեռ չկա ստուգված անհատական լուծում։ Առանց բավարար պայմանների ճիշտ չէ հորինել միջանկյալ քայլեր։ Օգտվիր նույն բաժնի բանաձևերի ձեռնարկից։",choice:"Ընտրված տարբերակը",reason:"Տարբերակների ճշգրտությունը պետք է ստուգել հենց խնդրի պայմանով։"},
en:{given:"Given",step:"Solution",check:"Check",answer:"Answer",key:"According to the answer key",missing:"A verified step-by-step solution is not available for this exact question. It would be misleading to invent steps without sufficient source information. Review the linked section handbook.",choice:"Selected option",reason:"Verify the options against the actual question."},
ru:{given:"Дано",step:"Решение",check:"Проверка",answer:"Ответ",key:"Согласно ключу ответов",missing:"Для этого задания пока нет проверенного пошагового решения. Без достаточного условия нельзя придумывать шаги. Изучите справочник раздела.",choice:"Выбранный вариант",reason:"Проверяйте варианты по условию задания."}
};
function format(n:number){return Number.isInteger(n)?String(n):String(Number(n.toFixed(8)))}
function parseLinear(question:string){
 // Accept only a complete, standalone single-variable equation with numeric coefficients.
 // Avoid interpreting multi-equation, geometry, inequality, or prose problems as simple equations.
 const raw=question.trim().replace(/\s+/g,"").replace(/−/g,"-").replace(/×/g,"*").replace(/,/g,".");
 const m=/^(?<a>[+-]?(?:\d+(?:\.\d+)?\*?)?)x(?<sign>[+-])(?<b>\d+(?:\.\d+)?)=(?<c>[+-]?\d+(?:\.\d+)?)\.?$/.exec(raw);
 if(!m?.groups)return null;
 const aRaw=m.groups.a.replace(/\*$/,"");
 const a=aRaw===""||aRaw==="+"?1:aRaw==="-"?-1:Number(aRaw);
 const b=Number(m.groups.b)*(m.groups.sign==="-"?-1:1);
 const c=Number(m.groups.c);
 if(![a,b,c].every(Number.isFinite)||a===0)return null;
 const x=(c-b)/a;
 if(!Number.isFinite(x)||Math.abs(x)>1e9)return null;
 return {a,b,c,x};
}
export function reliableMathFallback(data:OfflineMathInput,locale:Locale="hy"){
 const t=UI[locale];
 const parsed=data.kind==="open"?parseLinear(data.question):null;
 if(parsed){
   const {a,b,c,x}=parsed;
   // Do not present a conflicting result as correct when answer key differs.
   const normalized=Number(data.correct.trim().replace(",","."));
   if(data.correct.trim() && Number.isFinite(normalized) && Math.abs(normalized-x)<1e-7){
     return `1. **${t.given}:** $${format(a)}x ${b<0?"-":"+"} ${format(Math.abs(b))} = ${format(c)}$\n\n2. **${t.step}:** $${format(a)}x = ${format(c)} - (${format(b)}) = ${format(c-b)}$; $x = \\frac{${format(c-b)}}{${format(a)}} = ${format(x)}$\n\n3. **${t.check}:** $${format(a)}\\cdot(${format(x)}) + (${format(b)}) = ${format(c)}$\n\n4. **${t.answer}:** $x=${format(x)}$.`;
   }
 }
 const lines=[`${t.key}: **${data.correct}**.`];
 if(data.chosen!==null)lines.push(`${t.choice}: **${data.chosen}**.`);
 lines.push(t.missing);
 if(data.kind==="choice")lines.push(t.reason);
 return lines.join("\n\n");
}
