import {createFileRoute,Link} from "@tanstack/react-router";
import {useEffect,useState} from "react";
import {useLang} from "@/lib/lang";
const KEY="shtemarm:study-accessibility:v1";
type Prefs={largeText:boolean;reduceMotion:boolean;compact:boolean};
const defaults:Prefs={largeText:false,reduceMotion:false,compact:false};
function readPrefs():Prefs{if(typeof window==="undefined")return defaults;try{const v=JSON.parse(localStorage.getItem(KEY)??"{}");return {largeText:v.largeText===true,reduceMotion:v.reduceMotion===true,compact:v.compact===true};}catch{return defaults;}}
function applyPrefs(v:Prefs){if(typeof document==="undefined")return;document.documentElement.dataset.studyText=v.largeText?"large":"normal";document.documentElement.dataset.studyMotion=v.reduceMotion?"reduced":"normal";document.documentElement.dataset.studyDensity=v.compact?"compact":"normal";}
export const Route=createFileRoute("/study-preferences")({staticData:{sitemap:false},component:StudyPreferencesPage});
function StudyPreferencesPage(){
 const lang=useLang(),tr=(hy:string,en:string,ru:string)=>lang==="en"?en:lang==="ru"?ru:hy;
 const [prefs,setPrefs]=useState<Prefs>(defaults);
 useEffect(()=>{const saved=readPrefs();setPrefs(saved);applyPrefs(saved);},[]);
 const change=(key:keyof Prefs,checked:boolean)=>{const next={...prefs,[key]:checked};setPrefs(next);applyPrefs(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{/* storage unavailable */}};
 return <main className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">
 <h1 className="text-3xl font-black">{tr("Ուսման հարմարեցումներ","Study preferences","Настройки обучения")}</h1>
 <p className="text-sm text-muted-foreground">{tr("Կարգավորումները պահպանվում են այս դիտարկչում։","Preferences are saved in this browser.","Настройки сохраняются в этом браузере.")}</p>
 {([["largeText",tr("Մեծ տառաչափ","Larger text","Крупный текст")],["reduceMotion",tr("Նվազեցնել անիմացիաները","Reduce animations","Уменьшить анимацию")],["compact",tr("Կոմպակտ դասավորություն","Compact layout","Компактный вид")]] as const).map(([key,label])=><label key={key} className="flex min-h-14 items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm font-semibold"><span>{label}</span><input type="checkbox" className="size-5 accent-primary" checked={prefs[key]} onChange={e=>change(key,e.target.checked)}/></label>)}
 <Link to="/dashboard" className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-bold text-primary">{tr("Վերադառնալ Dashboard","Back to dashboard","Вернуться к панели")}</Link>
 </main>;
}
