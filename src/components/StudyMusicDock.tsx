import { useEffect, useRef, useState } from "react";
import {
  AudioLines, ExternalLink, Headphones, Music2, Pause, Play,
  Power, Volume2, Waves, X,
} from "lucide-react";
import { useTx } from "@/lib/lang";
import {
  channelDetails, initStudyMusic, setStudyMusic, youtubeContentUrl,
  youtubeEmbedSrc, STUDY_MUSIC_CHANNELS, STUDY_AMBIENCE, useStudyMusic,
  type StudyMusicChannel, type AmbientScene,
} from "@/lib/study-music";
import { ambientWavUrl, loadHowler, type HowlPlayer } from "@/lib/study-ambience";

function AmbientEngine(){
  const tx=useTx();
  const { ambience, ambientEnabled, ambientVolume }=useStudyMusic();
  const player=useRef<HowlPlayer|null>(null);
  const volume=useRef(ambientVolume);
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  volume.current=ambientVolume;
  useEffect(()=>{
    player.current?.volume(ambientVolume/100);
  },[ambientVolume]);
  useEffect(()=>{
    if(!ambientEnabled||ambience==="off"){setError("");return;}
    let cancelled=false;
    let sound:HowlPlayer|null=null;
    let url:string|null=null;
    setError("");
    // Howler is loaded only after the user explicitly starts ambience.
    void loadHowler().then(Howl=>{
      if(cancelled)return;
      url=ambientWavUrl(ambience);
      sound=new Howl({
        src:[url],format:["wav"],loop:true,volume:volume.current/100,
        onloaderror:()=>{
          if(!cancelled)setError(tx("Միջավայրային ձայնը չհաջողվեց բեռնել։"));
        },
        onplayerror:()=>{
          if(!cancelled)setError(tx("Դիտարկիչը թույլ չտվեց ձայնը սկսել․ կրկին սեղմիր միացնել։"));
        },
      });
      player.current=sound;
      sound.play();
    }).catch(()=>{
      if(!cancelled)setError(tx("Howler.js ձայնային համակարգը չհաջողվեց բացել։"));
    });
    return()=>{
      cancelled=true;
      if(sound){sound.stop();sound.unload();}
      if(player.current===sound)player.current=null;
      if(url)URL.revokeObjectURL(url);
    };
  // tx() is recreated by useTx on each render: do NOT depend on its identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[ambience,ambientEnabled,retry]);
  return error?<p className="mt-2 text-xs text-destructive" role="alert">{error}{" "}
    <button type="button" className="font-bold underline"
      onClick={()=>setRetry(n=>n+1)}>
      {tx("Կրկին փորձել")}
    </button>
  </p>:null;
}
function VolumeControl(){
  const tx=useTx();
  const { ambientVolume }=useStudyMusic();
  return <label className="block space-y-2">
    <span className="flex items-center justify-between gap-2 text-xs font-bold">
      <span className="inline-flex items-center gap-2"><Volume2 className="size-4"/>{tx("Միջավայրային ձայնի ուժգնությունը")}</span>
      <span className="tabular-nums">{ambientVolume}%</span>
    </span>
    <input type="range" min={0} max={100} step={5} value={ambientVolume}
      onChange={e=>setStudyMusic({ambientVolume:Number(e.target.value)})}
      className="h-7 w-full cursor-pointer accent-primary"
      aria-label={tx("Միջավայրային ձայնի ուժգնությունը")}/>
  </label>;
}
/**
 * One persistent mixer at the app root. It never creates more than one YouTube
 * iframe or one Howler sound. Closing the panel stops the YouTube embed to
 * avoid invisible video playback, while the separately opted-in ambience stays.
 */
export function StudyMusicDock(){
  const tx=useTx();
  const settings=useStudyMusic();
  const { channel, ambience, youtubeEnabled, ambientEnabled }=settings;
  const [expanded,setExpanded]=useState(false);
  useEffect(()=>initStudyMusic(),[]);
  useEffect(()=>{if(youtubeEnabled)setExpanded(true);},[youtubeEnabled]);
  const selected=channelDetails(channel);
  const anyOn=youtubeEnabled||ambientEnabled;
  const close=()=>{
    if(youtubeEnabled)setStudyMusic({youtubeEnabled:false});
    setExpanded(false);
  };
  return <aside aria-label={tx("Ուսման ձայնային միջավայր")}
    className="study-music-dock fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-3 z-40 w-[min(22rem,calc(100vw-1.5rem))] sm:bottom-4 sm:left-4">
    <AmbientEngine/>
    {expanded&&<div className="mb-2 max-h-[min(74vh,43rem)] space-y-4 overflow-y-auto rounded-2xl border bg-card p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Headphones className="size-5"/>
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-black">{tx("Ուսման ձայնային միջավայր")}</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tx("YouTube-ի lo-fi երաժշտություն + առանձին կարգավորվող Howler.js ձայներ")}
          </p>
        </div>
        <button type="button" className="grid size-10 place-items-center rounded-xl hover:bg-muted"
          aria-label={tx("Փակել պատուհանը")} onClick={close}>
          <X className="size-5"/>
        </button>
      </div>
      <section className="space-y-2" aria-label={tx("YouTube երաժշտություն")}>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="study-youtube-channel" className="text-sm font-black">{tx("YouTube երաժշտություն")}</label>
          <button type="button" aria-pressed={youtubeEnabled}
            onClick={()=>setStudyMusic({youtubeEnabled:!youtubeEnabled})}
            className={"inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold "+
              (youtubeEnabled?"border bg-card":"bg-primary text-primary-foreground")}>
            {youtubeEnabled?<Pause className="size-4"/>:<Play className="size-4"/>}
            {tx(youtubeEnabled?"Անջատել YouTube-ը":"Միացնել YouTube-ը")}
          </button>
        </div>
        <select id="study-youtube-channel" className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm"
          value={channel} onChange={e=>setStudyMusic({channel:e.target.value as StudyMusicChannel})}>
          {STUDY_MUSIC_CHANNELS.map(item=><option key={item.id} value={item.id}>{tx(item.label)}</option>)}
        </select>
        {youtubeEnabled&&<div className="space-y-2">
          <iframe key={channel} title={tx("YouTube · {name}",{name:selected.title})}
            src={youtubeEmbedSrc(channel)} width="100%" height="220" loading="lazy"
            className="block min-h-[220px] w-full rounded-xl border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tx("Երաժշտության ձայնը և նվագարկումը կարգավորիր YouTube-ի պաշտոնական նվագարկչում։ Եթե ավտոմատ մեկնարկը արգելափակվում է, սեղմիր Play այնտեղ։")}
          </p>
        </div>}
        <a href={youtubeContentUrl(channel)} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          {tx("Բացել YouTube-ում")}<ExternalLink className="size-4"/>
        </a>
      </section>
      <section className="space-y-3 border-t pt-3" aria-label={tx("Միջավայրային ձայներ")}>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="study-ambient-channel" className="text-sm font-black">{tx("Միջավայրային ձայներ")}</label>
          <button type="button" aria-pressed={ambientEnabled} disabled={ambience==="off"}
            onClick={()=>setStudyMusic({ambientEnabled:!ambientEnabled})}
            className={"inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold disabled:opacity-40 "+
              (ambientEnabled?"border bg-card":"bg-primary text-primary-foreground")}>
            {ambientEnabled?<Pause className="size-4"/>:<Play className="size-4"/>}
            {tx(ambientEnabled?"Անջատել ձայները":"Միացնել ձայները")}
          </button>
        </div>
        <select id="study-ambient-channel" className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm"
          value={ambience} onChange={e=>setStudyMusic({ambience:e.target.value as AmbientScene})}>
          {STUDY_AMBIENCE.map(item=><option key={item.id} value={item.id}>{tx(item.label)}</option>)}
        </select>
        <VolumeControl/>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tx("Ձայները ստեղծվում են անմիջապես սարքում և անվերջ կրկնվում են Howler.js-ով։ Դրանք չեն փոխանցվում որևէ սերվերի։")}
        </p>
      </section>
      <button type="button" onClick={()=>setStudyMusic({
          youtubeEnabled:true,ambientEnabled:ambience!=="off",
        })} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
        <Waves className="size-4"/>{tx("Միացնել երաժշտությունն ու ֆոնը միասին")}
      </button>
      <div className="flex items-center justify-between gap-2 border-t pt-3">
        <p className="text-xs text-muted-foreground">{tx("Սկզբում ամեն ինչ անջատված է։ Ընտրությունն ու ձայնի ուժգնությունը հիշվում են այս սարքում։")}</p>
        {anyOn&&<button type="button" onClick={()=>setStudyMusic({youtubeEnabled:false,ambientEnabled:false})}
          className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl border px-3 text-xs font-bold hover:bg-muted">
          <Power className="size-4"/>{tx("Անջատել բոլորը")}
        </button>}
      </div>
    </div>}
    <button type="button" aria-expanded={expanded}
      aria-label={tx("Ուսման ձայնային միջավայր")}
      onClick={()=>{ if(expanded) close(); else setExpanded(true); }}
      className="inline-flex min-h-12 max-w-full items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-bold shadow-lg transition-colors hover:border-primary/40 hover:bg-muted">
      {anyOn?<AudioLines className="size-5 text-primary"/>:<Music2 className="size-5 text-primary"/>}
      <span className="min-w-0 truncate">{tx("Ուսման ձայներ")}</span>
      <span aria-hidden="true" className={"size-2 shrink-0 rounded-full "+(anyOn?"bg-emerald-500":"bg-muted-foreground/40")}/>
    </button>

  </aside>;
}

/** Configuration lives in Focus Mode. The dock above is the only player. */
export function StudyMusicSettings(){
  const tx=useTx();
  const {channel,ambience,ambientVolume,youtubeEnabled,ambientEnabled}=useStudyMusic();
  return <section className="space-y-5 rounded-3xl border bg-card p-5 sm:p-6"
    aria-label={tx("Ուսման ձայնային միջավայր")}>
    <div className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Headphones className="size-5"/>
      </span>
      <div>
        <h2 className="text-lg font-black">{tx("Ուսման ձայնային միջավայր")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {tx("Ընտրիր lo-fi երաժշտությունն ու միջավայրային ձայնը առանձին։ Կարող ես միացնել երկուսն էլ և փոխել ֆոնի ձայնի ուժգնությունը։")}
        </p>
      </div>
    </div>
    <fieldset className="space-y-2">
      <legend className="text-sm font-bold">{tx("YouTube lo-fi")}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {STUDY_MUSIC_CHANNELS.map(item=><button type="button" key={item.id}
          aria-pressed={channel===item.id} onClick={()=>setStudyMusic({channel:item.id})}
          className={"min-h-16 rounded-xl border-2 p-3 text-left text-sm font-semibold transition-colors "+
            (channel===item.id?"border-primary bg-primary/5":"hover:border-primary/40")}>
          {tx(item.label)}
        </button>)}
      </div>
      <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
        onClick={()=>setStudyMusic({youtubeEnabled:!youtubeEnabled})}>
        {youtubeEnabled?<Pause className="size-4"/>:<Play className="size-4"/>}
        {tx(youtubeEnabled?"Անջատել YouTube-ը":"Միացնել YouTube-ը")}
      </button>
    </fieldset>
    <fieldset className="space-y-3 border-t pt-4">
      <legend className="text-sm font-bold">{tx("Howler.js · միջավայրային ձայներ")}</legend>
      <div className="flex flex-wrap gap-2">
        {STUDY_AMBIENCE.map(item=><button type="button" key={item.id}
          aria-pressed={ambience===item.id} onClick={()=>setStudyMusic({ambience:item.id})}
          className={"min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors "+
            (ambience===item.id?"border-primary bg-primary/10":"hover:border-primary/40")}>
          {tx(item.label)}
        </button>)}
      </div>
      <VolumeControl/>
      <button type="button" disabled={ambience==="off"}
        className={"inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-40 "+
          (ambientEnabled?"border bg-card":"bg-primary text-primary-foreground")}
        onClick={()=>setStudyMusic({ambientEnabled:!ambientEnabled})}>
        {ambientEnabled?<Pause className="size-4"/>:<Play className="size-4"/>}
        {tx(ambientEnabled?"Անջատել ձայները":"Միացնել ձայները")}
      </button>
    </fieldset>
    <p className="text-xs leading-relaxed text-muted-foreground">
      {tx("YouTube-ը օգտագործում է իր պաշտոնական նվագարկիչը։ Howler.js-ը կառավարում է միայն տեղում գեներացված ֆոնային ձայները։ Ավտոմատ նվագարկումը կարող է սահմանափակվել դիտարկիչով։")}
    </p>
  </section>;
}
