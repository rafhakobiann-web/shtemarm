import { useEffect, useState } from "react";
import { Accessibility, Check, MonitorCog, Settings2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { applyTheme, readTheme, saveTheme, type Theme } from "@/lib/theme";
import { setLang, useLang, type Lang } from "@/lib/lang";

type Dock = "left" | "right";
type Accent = "blue" | "violet" | "emerald" | "rose" | "amber" | "teal";
type Preferences = { textScale: number; highContrast: boolean; reduceMotion: boolean; dock: Dock; accent: Accent };
const KEY = "shtemarm-display-preferences-v1";
const defaults: Preferences = { textScale: 100, highContrast: false, reduceMotion: false, dock: "right", accent: "blue" };
const accents: { id: Accent; label: string; color: string }[] = [
  { id: "blue", label: "Blue", color: "#4263eb" },
  { id: "violet", label: "Violet", color: "#7c3aed" },
  { id: "emerald", label: "Emerald", color: "#059669" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "amber", label: "Amber", color: "#b7791f" },
  { id: "teal", label: "Teal", color: "#0d9488" },
];
const copy = {
  hy: {
    accessibility: "Մատչելիություն", settings: "Կարգավորումներ", textSize: "Տեքստի չափ", contrast: "Բարձր հակադրություն",
    motion: "Նվազեցնել անիմացիաները", dock: "Կոճակների դիրքը", left: "Ձախ", right: "Աջ", appearance: "Արտաքին տեսք",
    language: "Լեզու", accent: "Շեշտադրման գույն", theme: "Մութ ռեժիմ", light: "Բաց", dark: "Մութ",
    reset: "Վերականգնել լռելյայնը", close: "Փակել", subtitle: "Անհատականացրու քո ուսումնական միջավայրը",
    small: "Փոքր", normal: "Սովորական", large: "Մեծ", extraLarge: "Շատ մեծ", on: "Միացված", off: "Անջատված",
  },
  en: {
    accessibility: "Accessibility", settings: "Settings", textSize: "Text size", contrast: "High contrast",
    motion: "Reduce animations", dock: "Floating buttons position", left: "Left", right: "Right", appearance: "Appearance",
    language: "Language", accent: "Accent color", theme: "Dark mode", light: "Light", dark: "Dark",
    reset: "Reset to defaults", close: "Close", subtitle: "Make your study space feel like yours",
    small: "Small", normal: "Default", large: "Large", extraLarge: "Extra large", on: "On", off: "Off",
  },
} as const;

function savePreferences(value: Preferences) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* keep current-session preferences */ }
}
function applyPreferences(value: Preferences) {
  const root = document.documentElement;
  root.style.fontSize = `${value.textScale}%`;
  root.classList.toggle("user-high-contrast", value.highContrast);
  root.classList.toggle("user-reduced-motion", value.reduceMotion);
  const accent = accents.find((item) => item.id === value.accent) ?? accents[0];
  root.style.setProperty("--primary", accent.color);
  root.style.setProperty("--ring", accent.color);
  root.style.setProperty("--primary-foreground", "#ffffff");
}
function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Preferences> | null;
    if (saved) return { ...defaults, ...saved };
  } catch { /* ignore invalid stored settings */ }
  return defaults;
}

export function PersonalizationControls() {
  const lang = useLang();
  const t = copy[lang];
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [accessOpen, setAccessOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = readPreferences();
    setPrefs(next);
    applyPreferences(next);
    const currentTheme = readTheme();
    setTheme(currentTheme);
  }, []);

  const update = (patch: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      applyPreferences(next);
      savePreferences(next);
      return next;
    });
  };
  const changeTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
    saveTheme(next);
  };
  const changeLanguage = (next: Lang) => setLang(next);
  const floatingSide = prefs.dock === "left" ? "left-4" : "right-4";

  return (
    <>
      <div className={`fixed ${floatingSide} bottom-4 z-40 flex flex-col gap-2 sm:bottom-6`}>
        <Button type="button" variant="outline" size="icon" className="size-12 rounded-2xl border bg-background/95 shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5" aria-label={t.accessibility} title={t.accessibility} onClick={() => setAccessOpen((v) => !v)}>
          <Accessibility className="size-5" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="size-12 rounded-2xl border bg-background/95 shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5" aria-label={t.settings} title={t.settings} onClick={() => setSettingsOpen(true)}>
          <Settings2 className="size-5" />
        </Button>
      </div>

      {accessOpen && (
        <section aria-label={t.accessibility} className={`fixed ${floatingSide} bottom-32 z-40 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur-xl animate-pop`}>
          <div className="mb-4 flex items-center gap-2">
            <Accessibility className="size-5 text-primary" />
            <h2 className="font-display font-black">{t.accessibility}</h2>
            <button type="button" className="ml-auto rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted" onClick={() => setAccessOpen(false)}>{t.close}</button>
          </div>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2"><label className="flex items-center gap-2 text-sm font-semibold"><Type className="size-4" />{t.textSize}</label><span className="text-xs font-bold tabular-nums text-muted-foreground">{prefs.textScale}%</span></div>
              <Slider min={80} max={140} step={10} value={[prefs.textScale]} onValueChange={(v) => update({ textScale: v[0] ?? 100 })} aria-label={t.textSize} />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{t.small}</span><span>{t.normal}</span><span>{t.extraLarge}</span></div>
            </div>
            <div className="flex items-center justify-between gap-3"><label htmlFor="a11y-contrast" className="text-sm font-medium">{t.contrast}</label><Switch id="a11y-contrast" checked={prefs.highContrast} onCheckedChange={(v) => update({ highContrast: v })} /></div>
            <div className="flex items-center justify-between gap-3"><label htmlFor="a11y-motion" className="text-sm font-medium">{t.motion}</label><Switch id="a11y-motion" checked={prefs.reduceMotion} onCheckedChange={(v) => update({ reduceMotion: v })} /></div>
            <div>
              <p className="mb-2 text-sm font-semibold">{t.dock}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={prefs.dock === "left" ? "default" : "outline"} aria-pressed={prefs.dock === "left"} onClick={() => update({ dock: "left" })}>{t.left}</Button>
                <Button type="button" variant={prefs.dock === "right" ? "default" : "outline"} aria-pressed={prefs.dock === "right"} onClick={() => update({ dock: "right" })}>{t.right}</Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="flex w-[min(24rem,94vw)] flex-col gap-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-display text-xl font-black"><MonitorCog className="size-5 text-primary" />{t.settings}</SheetTitle>
            <SheetDescription>{t.subtitle}</SheetDescription>
          </SheetHeader>
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.appearance}</h3>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-semibold">{t.theme}</span>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={theme === "light" ? "default" : "outline"} onClick={() => changeTheme("light")}>{t.light}</Button>
                <Button type="button" size="sm" variant={theme === "dark" ? "default" : "outline"} onClick={() => changeTheme("dark")}>{t.dark}</Button>
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <p className="mb-3 text-sm font-semibold">{t.accent}</p>
              <div className="grid grid-cols-6 gap-2">
                {accents.map((accent) => (
                  <button key={accent.id} type="button" title={accent.label} aria-label={accent.label} aria-pressed={prefs.accent === accent.id} onClick={() => update({ accent: accent.id })} className="grid size-9 place-items-center rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: accent.color, borderColor: prefs.accent === accent.id ? "var(--foreground)" : "transparent" }}>
                    {prefs.accent === accent.id && <Check className="size-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.language}</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={lang === "hy" ? "default" : "outline"} aria-pressed={lang === "hy"} onClick={() => changeLanguage("hy")}>Հայերեն</Button>
              <Button type="button" variant={lang === "en" ? "default" : "outline"} aria-pressed={lang === "en"} onClick={() => changeLanguage("en")}>English</Button>
            </div>
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Some subject content remains in its original language." : "Որոշ առարկայական նյութեր մնում են սկզբնական լեզվով։"}</p>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{lang === "en" ? "Accessibility" : "Մատչելիություն"}</h3>
            <Button type="button" variant="outline" className="w-full" onClick={() => { setSettingsOpen(false); setAccessOpen(true); }}><Accessibility className="mr-2 size-4" />{t.accessibility}</Button>
          </section>
          <Button type="button" variant="outline" className="mt-auto w-full" onClick={() => { update(defaults); changeTheme("light"); setLang("hy"); }}>{t.reset}</Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
