import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, ExternalLink, MonitorDown, Smartphone } from "lucide-react";
import { PRIVATE_BETA_URL, LATEST_ANDROID_VERSION, PUBLIC_ANDROID_VERSION, safePublicApkUrl } from "@/lib/app-download";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/download")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Shtemarm · Ներբեռնել հավելվածը" },
      { name: "description", content: "Տեղադրիր Shtemarm-ը հեռախոսում։ Android-ի փորձնական տարբերակ և կայքի տեղադրման տարբերակներ։" },
    ],
  }),
  component: DownloadPage,
});

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function DownloadPage() {
  const lang = useLang();
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [publishedApk, setPublishedApk] = useState<string | null>(null);
  const [publishedVersion, setPublishedVersion] = useState<string | null>(null);
  const promptRef = useRef<InstallPrompt | null>(null);

  useEffect(() => {
    // Only the browser can detect a platform-specific install prompt.
    const updateStandalone = () => {
      setInstalled(window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)));
    };
    const onPrompt = (event: Event) => {
      const prompt = event as InstallPrompt;
      if (typeof prompt.prompt !== "function") return;
      event.preventDefault();
      promptRef.current = prompt;
      setInstallable(true);
    };
    const onInstalled = () => {
      promptRef.current = null;
      setInstallable(false);
      setInstalled(true);
    };
    updateStandalone();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // A manually approved release workflow can publish this static manifest.
  // Missing files may receive the SPA HTML fallback; those simply fail JSON
  // parsing and the page continues to show the private-tester option.
  useEffect(() => {
    if (safePublicApkUrl(import.meta.env.VITE_ANDROID_APK_URL)) return;
    const controller = new AbortController();
    fetch("/downloads/android-release.json", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => response.ok ? response.json() : null)
      .then((value: unknown) => {
        if (!value || typeof value !== "object" || !("path" in value)) return;
        const candidate = (value as { path?: unknown }).path;
        if (typeof candidate !== "string") return;
        const url = safePublicApkUrl(candidate);
        if (url?.startsWith("/downloads/")) {
          setPublishedApk(url);
          if ("version" in value && typeof value.version === "string") {
            setPublishedVersion(value.version);
          }
        }
      })
      .catch(() => { /* No public APK yet: continue with private beta. */ });
    return () => controller.abort();
  }, []);

  const launchInstall = async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    // The prompt must be invoked from a direct user interaction.
    promptRef.current = null;
    setInstallable(false);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      // Fall back to browser-menu instructions below.
    }
  };

  const text = lang === "en" ? {
    home: "Home", badge: "SHTEMARM · ANDROID", title: "Take Shtemarm with you",
    description: "Study through the Android app or add the website to your home screen.",
    android: "Android application", native: "Native Android · Early beta",
    versionLabel: "Available download", upcoming: "Update being prepared", updateNote: "Important: earlier test APKs may use a different signing key. If Android refuses an update, uninstalling the old app can delete your saved progress.",
    apkAvailable: "Download Android APK", apkPrivate: "Android beta for invited testers",
    privateNote: "The beta APK is currently hosted in a private GitHub repository. Only invited collaborators can access it. A public download will be enabled after the release and distribution review.",
    appNote: "Beta app: some textbooks and examination modes are still incomplete. Only install an APK you trust.",
    publicNote: "The download below points to a public APK configured by the website administrator.",
    web: "Install the website", webInfo: "A quick home-screen shortcut that opens Shtemarm like an app. It requires an internet connection for most content.",
    install: "Install website", installed: "Already installed", manual: "Add to home screen",
    androidSteps: "On Android Chrome: open the ⋮ menu → Install app or Add to Home screen.",
    iosSteps: "On iPhone Safari: tap Share → Add to Home Screen.",
    noPrompt: "If your browser doesn't offer an install button, use the browser menu.",
    onlyAuthorized: "Open private beta release", available: "Available for Android",
  } : lang === "ru" ? {
    home: "Главная", badge: "SHTEMARM · ANDROID", title: "Shtemarm всегда с собой",
    description: "Учитесь в Android-приложении или добавьте сайт на главный экран.",
    android: "Приложение для Android", native: "Нативный Android · Бета-версия",
    versionLabel: "Доступная версия", upcoming: "Готовится обновление", updateNote: "Важно: предыдущий тестовый APK мог быть подписан другим ключом. Если обновление не устанавливается, удаление старого приложения может стереть сохранённый прогресс.",
    apkAvailable: "Скачать Android APK", apkPrivate: "Android-бета для приглашённых участников",
    privateNote: "APK находится в закрытом репозитории GitHub. Доступ есть только у приглашённых участников. Публичная загрузка появится после проверки релиза и прав на материалы.",
    appNote: "Бета-версия: некоторые сборники и форматы экзаменов ещё не завершены. Устанавливайте только доверенные APK.",
    publicNote: "Файл загружается по публичной ссылке, настроенной администратором сайта.",
    web: "Установить сайт", webInfo: "Ярлык на главном экране, открывающий Shtemarm как приложение. Для большинства материалов нужен интернет.",
    install: "Установить сайт", installed: "Уже установлено", manual: "Добавить на главный экран",
    androidSteps: "Android Chrome: меню ⋮ → Установить приложение или Добавить на главный экран.",
    iosSteps: "iPhone Safari: Поделиться → На экран «Домой».",
    noPrompt: "Если кнопки установки нет, используйте меню браузера.",
    onlyAuthorized: "Открыть закрытый бета-релиз", available: "Для Android",
  } : {
    home: "Գլխավոր էջ", badge: "SHTEMARM · ANDROID", title: "Shtemarm-ը՝ քո հեռախոսում",
    description: "Սովորիր Android հավելվածով կամ տեղադրիր կայքը հեռախոսի գլխավոր էկրանին։",
    android: "Android հավելված", native: "Իրական Android հավելված · Փորձնական տարբերակ",
    versionLabel: "Ներբեռնվող տարբերակ", upcoming: "Պատրաստվող թարմացում", updateNote: "Կարևոր․ նախորդ փորձնական APK-ն կարող է ունենալ այլ ստորագրություն։ Եթե թարմացումը չի տեղադրվում, հին հավելվածը հեռացնելիս հնարավոր է կորցնես պահպանված առաջընթացը։",
    apkAvailable: "Ներբեռնել Android APK-ն", apkPrivate: "Android-ի փորձնական տարբերակը՝ հրավիրված մասնակիցների համար",
    privateNote: "APK-ն այժմ պահվում է GitHub-ի փակ պահոցում։ Այն հասանելի է միայն հրավիրված մասնակիցներին։ Հանրային ներբեռնումը հասանելի կդառնա թողարկման և նյութերի տարածման իրավունքների ստուգումից հետո։",
    appNote: "Փորձնական տարբերակ․ որոշ շտեմարաններ և քննական ռեժիմներ դեռ ամբողջական չեն։ Տեղադրիր միայն վստահելի աղբյուրից ստացված APK։",
    publicNote: "Այս հղումը տանում է կայքի կառավարչի կարգավորած հանրային APK-ին։",
    web: "Տեղադրել կայքը", webInfo: "Գլխավոր էկրանի հարմար պատկերակ, որը բացում է Shtemarm-ը հավելվածի նման։ Նյութերի մեծ մասի համար անհրաժեշտ է ինտերնետ։",
    install: "Տեղադրել կայքը", installed: "Արդեն տեղադրված է", manual: "Ավելացնել գլխավոր էկրանին",
    androidSteps: "Android Chrome-ում բացիր ⋮ ընտրացանկը և ընտրիր «Տեղադրել հավելվածը» կամ «Ավելացնել գլխավոր էկրանին»։",
    iosSteps: "iPhone-ի Safari-ում սեղմիր «Կիսվել» → «Ավելացնել գլխավոր էկրանին»։",
    noPrompt: "Եթե տեղադրման կոճակ չի երևում, օգտվիր դիտարկչի ընտրացանկից։",
    onlyAuthorized: "Բացել փակ փորձնական թողարկումը", available: "Android-ի համար",
  };

  const apkUrl = safePublicApkUrl(import.meta.env.VITE_ANDROID_APK_URL) ?? publishedApk;
  return (
    <div className="mx-auto max-w-5xl space-y-6 py-3 sm:space-y-8">
      <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />{text.home}
      </Link>
      <header className="academy-hero overflow-hidden rounded-[1.75rem] px-5 py-9 text-white sm:px-9 sm:py-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide">
          <Smartphone className="size-4" />{text.badge}
        </span>
        <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">{text.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">{text.description}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="academy-bento space-y-4 p-5 sm:p-7" aria-labelledby="android-app-title">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Smartphone className="size-6" /></span>
          <div>
            <h2 id="android-app-title" className="text-xl font-black">{text.android}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text.native}</p>
            <p className="mt-1 text-sm font-bold text-primary">
              {text.versionLabel}: {apkUrl ? (publishedVersion ?? PUBLIC_ANDROID_VERSION) : PUBLIC_ANDROID_VERSION}
            </p>
            <p className="mt-1 text-sm font-bold text-muted-foreground">{text.upcoming}: {LATEST_ANDROID_VERSION}</p>
          </div>
          {apkUrl ? (
            <a href={apkUrl} download={apkUrl.startsWith("/") ? "Shtemarm-Android.apk" : undefined} rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90">
              <Download className="size-5" />{text.apkAvailable}
            </a>
          ) : (
            <a href={PRIVATE_BETA_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-bold text-primary hover:bg-primary/15">
              <ExternalLink className="size-5" />{text.onlyAuthorized}
            </a>
          )}
          <p className="text-sm leading-6 text-muted-foreground">{apkUrl ? text.publicNote : text.privateNote}</p>
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">{text.appNote}</p>
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">{text.updateNote}</p>
        </section>
        <section className="academy-bento space-y-4 p-5 sm:p-7" aria-labelledby="web-app-title">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><MonitorDown className="size-6" /></span>
          <div>
            <h2 id="web-app-title" className="text-xl font-black">{text.web}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text.webInfo}</p>
          </div>
          {installable && !installed ? (
            <button
              type="button"
              onClick={launchInstall}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-5" />{text.install}
            </button>
          ) : (
            <p className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary">
              {installed ? <CheckCircle2 className="size-5" /> : <MonitorDown className="size-5" />}
              {installed ? text.installed : text.manual}
            </p>
          )}
          <p className="text-sm leading-6 text-muted-foreground">{text.noPrompt}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>{text.androidSteps}</li>
            <li>{text.iosSteps}</li>
          </ul>
        </section>
      </div>
      <Link to="/" className="inline-flex min-h-11 items-center gap-2 font-bold text-primary">
        {text.home}<ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
