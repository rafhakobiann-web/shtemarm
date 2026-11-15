import { useEffect, useState } from "react";
import { Accessibility, Check, Laptop, MonitorCog, Moon, Settings2, Sun, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { resetAppearance, setAppearance, useAppearance, type ColorMode, type SurfaceTheme } from "@/lib/theme";
import { ACCENT_SWATCHES, DEFAULT_ACCENT, DISPLAY_PREFERENCES_KEY, applyAccent, normalizeAccent, type Accent } from "@/lib/accent";
import { setLang, useLang, type Lang } from "@/lib/lang";

type Dock = "left" | "right";
type Preferences = { username: string; textScale: number; highContrast: boolean; reduceMotion: boolean; dock: Dock; accent: Accent };
const KEY = DISPLAY_PREFERENCES_KEY;
const defaults: Preferences = { username: "", textScale: 100, highContrast: false, reduceMotion: false, dock: "right", accent: DEFAULT_ACCENT };
const accents = ACCENT_SWATCHES;
const copy = {
  hy: {
    accessibility: "Մատչելիություն", settings: "Կարգավորումներ", textSize: "Տեքստի չափ", contrast: "Բարձր հակադրություն",
    motion: "Նվազեցնել անիմացիաները", dock: "Կոճակների դիրքը", left: "Ձախ", right: "Աջ", appearance: "Արտաքին տեսք",
    language: "Լեզու", accent: "Շեշտադրման գույն", theme: "Գունային ռեժիմ", light: "Բաց", dark: "Մութ", system: "Համակարգային", themes: "Կայքի ոճը", liquid: "Liquid Glass", classic: "Դասական", soft: "Ակադեմիական", atlas: "Atlas", glassStrength: "Ապակու էֆեկտ", adaptive: "Ավտոմատ", subtle: "Մեղմ", balanced: "Հավասարակշռված", vivid: "Արտահայտիչ", blur: "Թափանցիկության մշուշում", glassHelp: "Liquid Glass-ը ստեղծում է լուսավորված, կիսաթափանցիկ մակերեսներ։ Էֆեկտը կարող ես նվազեցնել թույլ սարքերի կամ ընթերցման հարմարավետության համար։",
    username: "Իմ օգտանունը", usernameHelp: "Պահպանվում է այս սարքում։ Հանրային վարկանիշում դեռ չի հրապարակվում։", reset: "Վերականգնել լռելյայնը", close: "Փակել", subtitle: "Անհատականացրու քո ուսումնական միջավայրը",
    small: "Փոքր", normal: "Սովորական", large: "Մեծ", extraLarge: "Շատ մեծ", on: "Միացված", off: "Անջատված",
  },
  en: {
    accessibility: "Accessibility", settings: "Settings", textSize: "Text size", contrast: "High contrast",
    motion: "Reduce animations", dock: "Floating buttons position", left: "Left", right: "Right", appearance: "Appearance",
    language: "Language", accent: "Accent color", theme: "Color mode", light: "Light", dark: "Dark", system: "System", themes: "Website style", liquid: "Liquid Glass", classic: "Classic", soft: "Academy", atlas: "Atlas", glassStrength: "Glass strength", adaptive: "Adaptive", subtle: "Subtle", balanced: "Balanced", vivid: "Vivid", blur: "Backdrop blur", glassHelp: "Liquid Glass uses luminous translucent surfaces. Reduce the effect for lower-powered devices or easier reading.",
    username: "My username", usernameHelp: "Saved on this device only. Not published to a public leaderboard yet.", reset: "Reset to defaults", close: "Close", subtitle: "Make your study space feel like yours",
    small: "Small", normal: "Default", large: "Large", extraLarge: "Extra large", on: "On", off: "Off",
  },
  ru: {
    accessibility: "Специальные возможности", settings: "Настройки", textSize: "Размер текста", contrast: "Высокая контрастность",
    motion: "Меньше анимаций", dock: "Положение кнопок", left: "Слева", right: "Справа", appearance: "Внешний вид",
    language: "Язык", accent: "Цветовой акцент", theme: "Цветовая тема", light: "Светлая", dark: "Тёмная",
    system: "Системная", themes: "Стиль сайта", liquid: "Liquid Glass", classic: "Классика", soft: "Учебный", atlas: "Atlas",
    glassStrength: "Интенсивность стекла", adaptive: "Авто", subtle: "Низкая", balanced: "Средняя", vivid: "Высокая",
    blur: "Размытие фона", glassHelp: "Для более быстрой работы можно уменьшить эффект размытия или отключить его.",
    username: "Мой никнейм", usernameHelp: "Хранится только на устройстве. Пока не публикуется в общем рейтинге.", reset: "Сбросить настройки", close: "Закрыть", subtitle: "Настройте удобную учебную среду",
    small: "Маленький", normal: "Обычный", large: "Большой", extraLarge: "Очень большой", on: "Вкл.", off: "Выкл.",
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
  applyAccent(value.accent);
}
function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Preferences> | null;
    if (saved) return { ...defaults, ...saved, accent: normalizeAccent(saved.accent), username: typeof saved.username === "string" ? saved.username.slice(0, 24) : "" };
  } catch { /* ignore invalid stored settings */ }
  return defaults;
}

export function PersonalizationControls({ inline = false }: { inline?: boolean }) {
  const lang = useLang();
  const t = copy[lang];
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [accessOpen, setAccessOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const appearance = useAppearance();

  useEffect(() => {
    const next = readPreferences();
    setPrefs(next);
    applyPreferences(next);
  }, []);

  const update = (patch: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      applyPreferences(next);
      savePreferences(next);
      return next;
    });
  };
  const changeLanguage = (next: Lang) => setLang(next);
  const floatingSide = prefs.dock === "left" ? "left-3 sm:left-4" : "right-3 sm:right-4";

  return (
    <>
      <div className={inline ? "site-inline-controls mx-auto flex w-full max-w-7xl justify-end gap-2 px-4 pt-3 sm:px-6 lg:px-8" : `site-floating-controls fixed ${floatingSide} bottom-[calc(6.35rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-2 md:bottom-6`}>
        <Button type="button" variant="outline" size="icon" className="size-10 shrink-0 rounded-xl border bg-card shadow-md transition-colors hover:border-primary/40 hover:bg-muted md:size-12" aria-label={t.accessibility} title={t.accessibility} onClick={() => setAccessOpen((v) => !v)}>
          <Accessibility className="size-5" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="size-10 shrink-0 rounded-xl border bg-background/95 shadow-lg transition-colors hover:bg-muted md:size-12" aria-label={t.settings} title={t.settings} onClick={() => setSettingsOpen(true)}>
          <Settings2 className="size-5" />
        </Button>
      </div>

      {accessOpen && (
        <section aria-label={t.accessibility} className={`fixed ${floatingSide} bottom-52 z-40 w-[min(21rem,calc(100vw-2rem))] sm:bottom-32 rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur-xl animate-pop`}>
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
        <SheetContent side="right" className="site-settings-sheet flex w-[min(26rem,96vw)] flex-col gap-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-display text-xl font-black"><MonitorCog className="size-5 text-primary" />{t.settings}</SheetTitle>
            <SheetDescription>{t.subtitle}</SheetDescription>
          </SheetHeader>
          <section className="space-y-2">
            <label htmlFor="personal-username" className="text-sm font-bold">{t.username}</label>
            <input id="personal-username" type="text" maxLength={24} autoComplete="nickname"
              value={prefs.username} onChange={(event) => update({ username: event.target.value.replace(/[^\p{L}\p{N}_-]/gu, "").slice(0, 24) })}
              className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm" placeholder="student_01" />
            <p className="text-xs leading-relaxed text-muted-foreground">{t.usernameHelp}</p>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.appearance}</h3>
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">{t.themes}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["classic", "soft", "atlas"] as SurfaceTheme[]).map((surface) => (
                  <button key={surface} type="button" aria-pressed={appearance.surface === surface}
                    onClick={() => setAppearance({ surface })}
                    className={"group rounded-2xl border-2 p-1.5 text-left transition-colors " +
                      (appearance.surface === surface ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                    <span aria-hidden="true" className={"relative block h-16 overflow-hidden rounded-xl " +
                      (surface === "classic" ? "bg-slate-100" : surface === "soft" ? "bg-amber-50" : "bg-[#202b29]")}>
                      <span className={"absolute left-2 right-2 top-2 h-3 rounded-lg " +
                        (surface === "atlas" ? "bg-[#dce986]" : surface === "soft" ? "bg-white/95" : "bg-white")} />
                      <span className={"absolute bottom-2 left-2 h-8 w-[45%] rounded-lg " +
                        (surface === "atlas" ? "bg-[#f5f1e7]" : surface === "classic" ? "bg-white shadow" : "bg-white/95")} />
                      <span className={"absolute bottom-2 right-2 h-8 w-[35%] rounded-lg " +
                        (surface === "atlas" ? "bg-[#b94d37]" : surface === "soft" ? "bg-white/95" : "bg-white")} />
                    </span>
                    <span className="mt-2 flex items-center justify-center gap-1 text-xs font-bold">
                      {t[surface]}
                      {appearance.surface === surface && <Check className="size-3.5 shrink-0 text-primary" />}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">{t.theme}</legend>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["system", t.system, Laptop],
                  ["light", t.light, Sun],
                  ["dark", t.dark, Moon],
                ] as const).map(([mode, label, Icon]) => (
                  <Button type="button" key={mode} size="sm"
                    className="min-w-0 gap-1 px-2 text-xs"
                    aria-pressed={appearance.mode === mode}
                    variant={appearance.mode === mode ? "default" : "outline"}
                    onClick={() => setAppearance({ mode: mode as ColorMode })}>
                    <Icon className="size-3.5" />{label}
                  </Button>
                ))}
              </div>
            </fieldset>
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
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" size="sm" variant={lang === "hy" ? "default" : "outline"} aria-pressed={lang === "hy"} onClick={() => changeLanguage("hy")}>Հայերեն</Button>
              <Button type="button" size="sm" variant={lang === "en" ? "default" : "outline"} aria-pressed={lang === "en"} onClick={() => changeLanguage("en")}>English</Button>
              <Button type="button" size="sm" variant={lang === "ru" ? "default" : "outline"} aria-pressed={lang === "ru"} onClick={() => changeLanguage("ru")}>Русский</Button>
            </div>
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Question-book content remains in its original language." : lang === "ru" ? "Тексты заданий в сборниках сохраняют язык оригинала. Непереведённые элементы интерфейса временно отображаются на армянском." : "Շտեմարանների առաջադրանքները պահպանվում են բնօրինակ լեզվով։"}</p>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.accessibility}</h3>
            <Button type="button" variant="outline" className="w-full" onClick={() => { setSettingsOpen(false); setAccessOpen(true); }}><Accessibility className="mr-2 size-4" />{t.accessibility}</Button>
          </section>
          <Button type="button" variant="outline" className="mt-auto w-full" onClick={() => { update(defaults); resetAppearance(); setLang("hy"); }}>{t.reset}</Button>
        </SheetContent>
      </Sheet>
    </>
  );
}

