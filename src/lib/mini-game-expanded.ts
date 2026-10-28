import {
  QUICK_QUIZ_ITEMS, makeRound, shuffle, type QuizItem, type GameSubject,
  type GameSubjectId,
} from "@/lib/mini-game-data";

/** Offline original exercises with answers computed from the numeric givens.
 * They are not official GTC questions, and explanations are deterministic. */
function numeric(
  subject:GameSubject,id:string,prompt:string,result:number,
  explanation:string,step=1,
):QuizItem {
  const wrong=[result+step,result-step,result+2*step,result-2*step,
    result+3*step,result+4*step].filter(x=>x>=0 && x!==result);
  const choices=[String(result),...new Set(wrong.map(String))].slice(0,4);
  if(choices.length!==4)throw new Error("Not enough unique choices.");
  const rotate=Array.from(id).reduce((n,c)=>n+c.charCodeAt(0),0)%4;
  const ordered=[...choices.slice(rotate),...choices.slice(0,rotate)] as [string,string,string,string];
  return {id:"generated-"+id,subject,prompt,choices:ordered,
    answer:String(result),explanation};
}
export function generateMathPractice():QuizItem[]{
  const result:QuizItem[]=[];
  for(let a=3;a<=14;a++)for(let b=2;b<=13;b++){
    const answer=a*b;
    result.push(numeric("math","multiply-"+a+"-"+b,
      "Որքա՞ն է "+a+" × "+b+"։",answer,
      a+" × "+b+" = "+answer+"։ Բազմապատկումը "+b+" անգամ "+a+"-ի գումարումն է։",Math.max(1,a)));
  }
  for(let x=2;x<=40;x++){
    const multiplier=2+(x%8),constant=3+(x%19),right=multiplier*x+constant;
    result.push(numeric("math","linear-"+x,
      "Լուծի՛ր հավասարումը՝ "+multiplier+"x + "+constant+" = "+right+"։",x,
      "Հավասարման երկու կողմերից հանում ենք "+constant+" և բաժանում "+multiplier+"-ի. x = ("+right+" − "+constant+") / "+multiplier+" = "+x+"։"));
  }
  for(let x=5;x<=34;x++){
    const squared=x*x;
    result.push(numeric("math","square-"+x,
      "Որքա՞ն է "+x+"²-ը։",squared,x+"² = "+x+" × "+x+" = "+squared+"։",x));
  }
  for(let p=10;p<=90;p+=10)for(let n=2;n<=14;n++){
    const base=n*100,answer=n*p;
    result.push(numeric("math","percentage-"+p+"-"+n,
      "Որքա՞ն է "+base+"-ի "+p+"%-ը։",answer,
      p+"% = "+p+"/100, հետևաբար "+base+" × "+p+"/100 = "+answer+"։",n));
  }
  return result;
}
export function generatePhysicsPractice():QuizItem[]{
  const result:QuizItem[]=[];
  for(let speed=2;speed<=12;speed+=2)for(let time=3;time<=14;time++){
    const distance=speed*time;
    result.push(numeric("physics","motion-"+speed+"-"+time,
      "Մարմինը շարժվում է "+speed+" մ/վ արագությամբ "+time+" վայրկյան։ Քանի՞ մետր ճանապարհ կանցնի։",
      distance,"Հավասարաչափ շարժման դեպքում s = vt = "+speed+" × "+time+" = "+distance+" մ։",speed));
  }
  for(let mass=2;mass<=10;mass+=2)for(let accel=2;accel<=10;accel+=2){
    const force=mass*accel;
    result.push(numeric("physics","force-"+mass+"-"+accel,
      "Մարմնի զանգվածը "+mass+" կգ է, արագացումը՝ "+accel+" մ/վ²։ Որքա՞ն է ուժը (Ն)։",
      force,"Նյուտոնի երկրորդ օրենքով F = ma = "+mass+" × "+accel+" = "+force+" Ն։",mass));
  }
  for(let current=1;current<=7;current++)for(let resistance=2;resistance<=9;resistance++){
    const voltage=current*resistance;
    result.push(numeric("physics","voltage-"+current+"-"+resistance,
      "Շղթայում հոսանքը "+current+" Ա է, դիմադրությունը՝ "+resistance+" Օհմ։ Գտի՛ր լարումը (Վ)։",
      voltage,"Օհմի օրենքով U = IR = "+current+" × "+resistance+" = "+voltage+" Վ։",current));
  }
  return result;
}
const ELEMENTS=[
  ["H","ջրածին",1],["He","հելիում",2],["Li","լիթիում",3],
  ["Be","բերիլիում",4],["B","բոր",5],["C","ածխածին",6],
  ["N","ազոտ",7],["O","թթվածին",8],["F","ֆտոր",9],["Ne","նեոն",10],
  ["Na","նատրիում",11],["Mg","մագնեզիում",12],["Al","ալյումին",13],
  ["Si","սիլիցիում",14],["P","ֆոսֆոր",15],["S","ծծումբ",16],
  ["Cl","քլոր",17],["Ar","արգոն",18],["K","կալիում",19],["Ca","կալցիում",20],
] as const;
export function generateChemistryPractice():QuizItem[]{
  return ELEMENTS.flatMap(([symbol,name,protons])=>[
    numeric("chemistry","atomic-"+symbol,
      "Քանի՞ պրոտոն ունի "+symbol+" ("+name+") տարրի ատոմի կորիզը։",protons,
      symbol+" ("+name+") տարրի ատոմային համարը "+protons+" է։ Այն հավասար է պրոտոնների թվին։"),
    numeric("chemistry","electrons-"+symbol,
      "Քանի՞ էլեկտրոն ունի չեզոք "+symbol+" ("+name+") ատոմը։",protons,
      "Չեզոք ատոմում էլեկտրոնների և պրոտոնների թվերը հավասար են՝ "+protons+"։"),
  ]);
}
export const GENERATED_QUIZ_ITEMS:readonly QuizItem[]=[
  ...generateMathPractice(),...generatePhysicsPractice(),...generateChemistryPractice(),
];
export const EXTENDED_QUIZ_ITEMS:readonly QuizItem[]=[
  ...QUICK_QUIZ_ITEMS,...GENERATED_QUIZ_ITEMS,
];
/** Interleave subjects so maths cannot drown out other subjects in mixed rounds. */
export function makeBalancedGameRound(
  pool:readonly QuizItem[],subject:GameSubjectId,count:number,random:()=>number=Math.random,
):QuizItem[]{
  if(subject!=="mixed")return makeRound(pool,subject,count,random);
  const subjects=[...new Set(pool.map(q=>q.subject))];
  const groups=subjects.map(s=>shuffle(pool.filter(q=>q.subject===s),random));
  const result:QuizItem[]=[],seen=new Set<string>();
  while(result.length<count && groups.some(g=>g.length)){
    for(const group of groups){
      const question=group.shift();
      if(question&&!seen.has(question.id)){
        seen.add(question.id);result.push(question);
        if(result.length===count)break;
      }
    }
  }
  return result;
}
export function gameBankStats(){
  const out:Record<string,number>={};
  for(const question of EXTENDED_QUIZ_ITEMS)out[question.subject]=(out[question.subject]??0)+1;
  return out;
}
