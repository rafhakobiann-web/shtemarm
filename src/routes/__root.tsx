import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppHeader } from "@/components/AppHeader";
import { RelaunchScreen } from "@/components/RelaunchScreen";
import { MobileNav } from "@/components/MobileNav";
import { TouchGlassEffects } from "@/components/TouchGlassEffects";
import { PersonalizationControls } from "@/components/PersonalizationControls";
import { Toaster } from "@/components/ui/sonner";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { pullAndMerge } from "@/lib/progress";
import { TranslationProvider } from "@/components/EnglishText";
import { THEME_INIT_SCRIPT, initAppearance } from "@/lib/theme";
import { useLang } from "@/lib/lang";

function NotFoundComponent() {
  const lang = useLang();
  const words = lang === "en" ? {
    title: "Page not found", help: "This page does not exist or may have moved.", home: "Back to home",
  } : lang === "ru" ? {
    title: "Страница не найдена", help: "Страница не существует или её адрес изменился.", home: "На главную",
  } : {
    title: "Էջը չի գտնվել", help: "Այս էջը գոյություն չունի կամ դրա հասցեն փոխվել է։", home: "Գլխավոր էջ",
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{words.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {words.help}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {words.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const lang = useLang();
  const words = lang === "en" ? {
    title: "This page didn't load", message: "Something went wrong. Please try again or return home.", retry: "Try again", home: "Go home",
  } : lang === "ru" ? {
    title: "Не удалось загрузить страницу", message: "Произошла ошибка. Попробуйте снова или вернитесь на главную.", retry: "Повторить", home: "На главную",
  } : {
    title: "Էջը չհաջողվեց բեռնել", message: "Տեղի է ունեցել սխալ։ Փորձիր կրկին կամ վերադարձիր գլխավոր էջ։", retry: "Կրկին փորձել", home: "Գլխավոր էջ",
  };
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {words.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {words.message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {words.retry}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {words.home}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b766b" },
      { name: "application-name", content: "Shtemarm" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/shtemarm-logo.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Serif+Armenian:wght@400;600&family=Literata:opsz,wght@7..72,400;7..72,600&family=JetBrains+Mono:wght@400;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hy">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true";

function RootComponent() {
  if (maintenanceMode) return <RelaunchScreen />;
  return <ActiveApp />;
}

function ActiveApp() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    return initAppearance();
  }, []);
  useEffect(() => {
    // Offline study pages are usable without a configured cloud account.
    if (!hasSupabaseConfig()) return;
    void pullAndMerge().catch((error) => console.warn("[Shtemarm] Progress sync unavailable", error));
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          void pullAndMerge().catch((error) => console.warn("[Shtemarm] Progress sync unavailable", error));
        }
      });
      return () => data.subscription.unsubscribe();
    } catch (error) {
      console.warn("[Shtemarm] Auth not available; offline library remains accessible", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <a className="skip-link" href="#main-content">Skip to content</a>
      <TouchGlassEffects />
      <AppHeader />
      <PersonalizationControls />
      <main id="main-content" tabIndex={-1} className="mx-auto box-border w-full min-w-0 max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <TranslationProvider><Outlet /></TranslationProvider>
      </main>
      <MobileNav />
      <Toaster />
    </QueryClientProvider>
  );
}
