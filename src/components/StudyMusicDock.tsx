import { useEffect, useState } from "react";
import { ExternalLink, Headphones, Music2, Power, Volume2, X } from "lucide-react";
import { useTx } from "@/lib/lang";
import { channelDetails, initStudyMusic, setStudyMusic, spotifyContentUrl,
  spotifyEmbedSrc, STUDY_MUSIC_CHANNELS, useStudyMusic,
  type StudyMusicChannel } from "@/lib/study-music";

/**
 * Remains mounted at the app root when navigating between books and tests:
 * one Spotify embed, never a separate audio stream or duplicated player.
 * The iframe is created only after an explicit user choice, not on page load
 * for a new student. The Spotify player owns its play/pause and repeat controls.
 */
export function StudyMusicDock() {
  const tx = useTx();
  const { channel, enabled } = useStudyMusic();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => initStudyMusic(), []);
  const selected = channelDetails(channel);

  const switchChannel = (next: StudyMusicChannel) => {
    setStudyMusic({ channel: next, enabled: true });
    setExpanded(true);
  };
  return (
    <aside className="study-music-dock fixed bottom-[calc(6.6rem+env(safe-area-inset-bottom))] left-3 z-40 w-[min(21.5rem,calc(100vw-1.5rem))] sm:bottom-4 sm:left-4"
      aria-label={tx("Ուսման երաժշտություն")}>
      {enabled && expanded && <div className="mb-2 space-y-3 rounded-2xl border bg-card p-3 shadow-xl">
        <div className="flex items-start gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Headphones className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black">{tx("Ուսման երաժշտություն")}</p>
            <p className="truncate text-xs text-muted-foreground">{selected.title}</p>
          </div>
          <button type="button" className="grid size-9 place-items-center rounded-lg hover:bg-muted"
            aria-label={tx("Փակել նվագարկչի պատուհանը")} onClick={() => setExpanded(false)}><X className="size-4"/></button>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold">{tx("Ընտրել ձայնային միջավայրը")}</span>
          <select className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm font-semibold"
            value={channel} onChange={event => switchChannel(event.target.value as StudyMusicChannel)}>
            {STUDY_MUSIC_CHANNELS.map(item => <option key={item.id} value={item.id}>{tx(item.label)}</option>)}
          </select>
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tx(channel === "boo"
            ? "BOO!-ն այս Spotify երգացանկի առաջին երգն է։ Կրկնությունը կառավարում է Spotify-ն․ ավտոմատ անվերջ կրկնությունը երաշխավորված չէ։"
            : "Սեղմիր Play Spotify-ի նվագարկչում։ Ձայնի կառավարումն ու երգերի հերթականությունը Spotify-ում են։")}
        </p>
        <div className="overflow-hidden rounded-xl">
          <iframe title={tx("Spotify · {name}",{name:selected.title})}
            src={spotifyEmbedSrc(channel)} width="100%" height="240"
            loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="block w-full rounded-xl border-0" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <a href={spotifyContentUrl(channel)} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            {tx("Բացել Spotify-ում")}<ExternalLink className="size-3.5"/>
          </a>
          <button type="button" onClick={()=>setStudyMusic({enabled:false})}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold hover:bg-muted">
            <Power className="size-4"/>{tx("Անջատել երաժշտությունը")}
          </button>
        </div>
      </div>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-expanded={expanded && enabled}
          className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-black shadow-md transition-colors hover:border-primary/40 hover:bg-muted"
          onClick={()=>{
            if (!enabled) { setStudyMusic({enabled:true});setExpanded(true); }
            else setExpanded(v=>!v);
          }}>
          {enabled?<Volume2 className="size-5 text-primary"/>:<Music2 className="size-5 text-primary"/>}
          <span className="max-w-[11rem] truncate">{enabled?selected.title:tx("Երաժշտություն")}</span>
          <span className={"size-2 rounded-full "+(enabled?"bg-emerald-500":"bg-muted-foreground/40")} aria-hidden="true"/>
        </button>
        {enabled && <button type="button" aria-label={tx("Անջատել երաժշտությունը")}
          onClick={()=>setStudyMusic({enabled:false})}
          className="grid size-11 place-items-center rounded-full border bg-card shadow-md hover:bg-muted"><Power className="size-4"/></button>}
      </div>
    </aside>
  );
}

/** User settings in the existing Focus Mode / Study Tools menu. */
export function StudyMusicSettings() {
  const tx = useTx();
  const { channel, enabled } = useStudyMusic();
  return <section className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6" aria-label={tx("Ուսման երաժշտություն")}>
    <div className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Headphones className="size-5"/></span>
      <div className="space-y-1">
        <h2 className="text-lg font-black">{tx("Ուսման երաժշտություն")}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tx("Ընտրիր lo-fi երաժշտություն, բնության կամ անձրևի ձայներ, կամ Naré-ի «BOO!» երգը։ Ընտրությունը հիշվում է այս սարքում։")}
        </p>
      </div>
    </div>
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="mb-2 text-sm font-bold">{tx("Ընտրել ձայնային միջավայրը")}</legend>
      {STUDY_MUSIC_CHANNELS.map(item=><button key={item.id} type="button"
        aria-pressed={channel===item.id} onClick={()=>setStudyMusic({channel:item.id,enabled:true})}
        className={"min-h-20 rounded-2xl border-2 p-3 text-left transition-colors "+
          (channel===item.id?"border-primary bg-primary/5":"border-border hover:border-primary/40")}>
        <span className="block text-sm font-black">{tx(item.label)}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{tx(item.description)}</span>
      </button>)}
    </fieldset>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={()=>setStudyMusic({enabled:!enabled})}
        className={"inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold "+
          (enabled?"border bg-card text-foreground":"bg-primary text-primary-foreground")}>
        {enabled?<Power className="size-4"/>:<Headphones className="size-4"/>}
        {tx(enabled?"Անջատել երաժշտությունը":"Միացնել նվագարկիչը")}
      </button>
      <a href={spotifyContentUrl(channel)} target="_blank" rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-bold hover:bg-muted">
        <ExternalLink className="size-4"/>{tx("Բացել Spotify-ում")}
      </a>
    </div>
    <p className="text-xs leading-relaxed text-muted-foreground">
      {tx("Սկզբում ձայնն անջատված է։ Spotify-ում սեղմիր Play։ Որոշ սարքերում կամ առանց Spotify մուտքի կարող է հասանելի լինել միայն նախադիտումը։ Անվերջ կրկնությունը և ավտոմատ նվագարկումը կախված են Spotify-ից ու դիտարկիչից։")}
    </p>
  </section>;
}
