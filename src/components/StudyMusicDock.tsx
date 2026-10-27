import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Headphones, Music2, Pause, Play, Settings2, Volume2, X } from "lucide-react";
import { useLang } from "@/lib/lang";
import {
  STUDY_MUSIC_CHANNELS, STUDY_MUSIC_OPEN_EVENT,
  readStudyMusicPreference, saveStudyMusicPreference, studyMusicEmbedUrl, studyMusicSpotifyUrl,
  type StudyMusicChannelId, type StudyMusicCategory,
} from "@/lib/study-music";

const copy = {
  hy: {
    open: "Ուսումնական երաժշտություն", heading: "Երաժշտություն՝ սովորելիս",
    description: "Ընտրիր Spotify-ի lo-fi կամ միջավայրային ձայները, կամ լսիր Naré-ի «BOO!» երգը։",
    lofi: "Lo-fi", ambient: "Միջավայրային ձայներ", featured: "BOO!",
    on: "Բացել Spotify նվագարկիչը", off: "Անջատել երաժշտությունը",
    collapse: "Փոքրացնել ընտրացանկը", expand: "Բացել երաժշտության ընտրացանկը",
    close: "Փակել երաժշտության ընտրացանկը",
    selected: "Ընտրված է", spotify: "Բացել Spotify-ում", 
    userControl: "Նվագարկումը և ձայնի ուժգնությունը կառավարիր Spotify նվագարկիչում կամ սարքում։",
    note: "Երաժշտությունը ինքնաբերաբար չի սկսվում։ Spotify-ի հասանելիությունը կարող է կախված լինել հաշվի և տարածաշրջանի սահմանափակումներից։",
    active: "Spotify նվագարկիչը միացված է", standby: "Երաժշտությունն անջատված է",
    winner: "Մանկական Եվրատեսիլ 2026 · հաղթող",
  },
  en: {
    open: "Study music", heading: "Music for studying",
    description: "Choose Spotify lo-fi, ambient sounds, or Naré’s “BOO!”.",
    lofi: "Lo-fi", ambient: "Ambient sounds", featured: "BOO!",
    on: "Open Spotify player", off: "Turn off music",
    collapse: "Minimize the picker", expand: "Open music options",
    close: "Close music options",
    selected: "Selected", spotify: "Open in Spotify",
    userControl: "Control playback and volume in the Spotify player or on your device.",
    note: "Music never starts automatically. Availability may depend on your Spotify account and location.",
    active: "Spotify player enabled", standby: "Music is off",
    winner: "Junior Eurovision 2026 winner",
  },
  ru: {
    open: "Музыка для учёбы", heading: "Музыка во время учёбы",
    description: "Выбирайте lo-fi, фоновые звуки Spotify или песню Naré «BOO!».",
    lofi: "Lo-fi", ambient: "Фоновые звуки", featured: "BOO!",
    on: "Открыть плеер Spotify", off: "Выключить музыку",
    collapse: "Свернуть список", expand: "Показать выбор музыки",
    close: "Закрыть список музыки",
    selected: "Выбрано", spotify: "Открыть в Spotify",
    userControl: "Управляйте воспроизведением и громкостью в Spotify или на устройстве.",
    note: "Музыка не запускается автоматически. Доступ зависит от аккаунта Spotify и региона.",
    active: "Плеер Spotify включён", standby: "Музыка выключена",
    winner: "Победитель Детского Евровидения 2026",
  },
} as const;

const categories: readonly StudyMusicCategory[] = ["lofi", "ambient", "featured"];

export function StudyMusicDock() {
  const lang = useLang();
  const t = copy[lang];
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [channelId, setChannelId] = useState<StudyMusicChannelId>("lofi");
  const [category, setCategory] = useState<StudyMusicCategory>("lofi");
  useEffect(() => {
    const saved = readStudyMusicPreference().channel;
    setChannelId(saved);
    setCategory(STUDY_MUSIC_CHANNELS.find(item => item.id === saved)?.category ?? "lofi");
    const handleOpen = () => setOpen(true);
    window.addEventListener(STUDY_MUSIC_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(STUDY_MUSIC_OPEN_EVENT, handleOpen);
  }, []);
  const channel = useMemo(() => STUDY_MUSIC_CHANNELS.find(item => item.id === channelId) ??
    STUDY_MUSIC_CHANNELS[0], [channelId]);
  const available = STUDY_MUSIC_CHANNELS.filter(item => item.category === category);
  const choose = (id: StudyMusicChannelId) => {
    setChannelId(id);
    saveStudyMusicPreference(id);
  };
  const turnOff = () => {
    setEnabled(false); // Unmount iframe to stop Spotify playback immediately.
  };
  const stopAndClose = () => {
    turnOff();
    setOpen(false);
  };

  return (
    <aside aria-label={t.open}
      className="study-music-dock pointer-events-none fixed bottom-[calc(5.8rem+env(safe-area-inset-bottom))] left-3 z-[45] w-[min(23rem,calc(100vw-1.5rem))] md:bottom-5 md:left-5">
      {!open && !enabled ? (
        <button type="button" aria-label={t.open} title={t.open} onClick={() => setOpen(true)}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-extrabold text-foreground shadow-card transition-colors hover:border-primary/40 hover:text-primary">
          <Headphones className="size-5 text-primary"/>{t.open}
        </button>
      ) : (
        <div className="pointer-events-auto overflow-hidden rounded-[1.3rem] border border-border bg-card shadow-[0_16px_48px_-26px_rgba(8,43,41,0.55)]">
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Music2 className="size-5" aria-hidden="true"/>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{t.heading}</p>
              <p role="status" className="truncate text-[11px] text-muted-foreground">
                {enabled ? t.active : t.standby}
              </p>
            </div>
            {enabled && <button type="button" aria-label={t.off} title={t.off} onClick={turnOff}
              className="grid size-9 shrink-0 place-items-center rounded-xl border bg-background text-foreground hover:text-destructive">
              <Pause className="size-4" />
            </button>}
            <button type="button" aria-label={open ? t.collapse : t.expand}
              title={open ? t.collapse : t.expand} onClick={() => setOpen(o => !o)}
              className="grid size-9 shrink-0 place-items-center rounded-xl border bg-background hover:bg-muted">
              <Settings2 className="size-4"/>
            </button>
            {!enabled && <button type="button" aria-label={t.close} title={t.close} onClick={stopAndClose}
              className="grid size-9 shrink-0 place-items-center rounded-xl border bg-background hover:bg-muted">
              <X className="size-4"/>
            </button>}
          </div>

          {open && <div className="max-h-[min(47dvh,370px)] space-y-3 overflow-y-auto p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">{t.description}</p>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={t.open}>
              {categories.map(id => (
                <button key={id} type="button" aria-pressed={category === id}
                  className={"min-h-10 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-colors "+
                    (category === id ? "border-primary bg-primary text-primary-foreground" :
                      "border-border bg-background hover:border-primary/35")}
                  onClick={() => setCategory(id)}>
                  {t[id]}
                </button>
              ))}
            </div>
            <div className="grid gap-1.5">
              {available.map(item => <button key={item.id} type="button"
                aria-pressed={channelId === item.id} onClick={() => choose(item.id)}
                className={"flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors "+
                  (channelId === item.id ? "border-primary bg-primary/10" :
                    "border-border bg-background hover:border-primary/35")}>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold">{item.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {item.id === "boo" ? t.winner : item.description}
                  </span>
                </span>
                {channelId === item.id && <span className="shrink-0 text-[10px] font-black text-primary">
                  {t.selected}
                </span>}
              </button>)}
            </div>
            {!enabled && <button type="button" onClick={() => setEnabled(true)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90">
              <Play className="size-4" aria-hidden="true"/>{t.on}
            </button>}
            {enabled && <button type="button" onClick={turnOff}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border bg-background px-3 text-xs font-bold hover:bg-muted">
              <Pause className="size-4"/>{t.off}
            </button>}
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t.note}</p>
          </div>}

          {/* Render one single embed at a time. Keep it mounted while the picker
              is collapsed so changing site routes won't reset the source. */}
          {enabled && <div className={open ? "space-y-2 border-t p-3" : "border-t p-3"}>
            <iframe
              key={channel.id} title={"Spotify · "+channel.name}
              src={studyMusicEmbedUrl(channel)}
              width="100%" height="152" loading="eager"
              className="block w-full rounded-xl border-0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
            {open && <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Volume2 className="size-3.5 shrink-0"/>{t.userControl}
              </p>
              <a href={studyMusicSpotifyUrl(channel)} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-primary underline-offset-2 hover:underline">
                <ExternalLink className="size-3.5"/>{t.spotify}
              </a>
            </div>}
          </div>}
          {!open && enabled && <div className="px-3 pb-2 text-[10px] text-muted-foreground">
            {channel.name}
          </div>}
        </div>
      )}
    </aside>
  );
}
