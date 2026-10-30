import { GraduationCap, BookOpen, Sparkles } from "lucide-react";

/** Enabled only when VITE_MAINTENANCE_MODE=true at build time.
 * Keep this unset on Vercel Preview deployments.
 */
export function RelaunchScreen() {
  return (
    <main lang="hy" className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#0b1825] px-5 py-12 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 right-[-8rem] size-[32rem] rounded-full bg-cyan-500/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-[-8rem] size-[32rem] rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative w-full max-w-2xl rounded-[2rem] border border-white/15 bg-white/[.055] p-7 text-center shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
          <GraduationCap aria-hidden="true" className="size-9 text-cyan-200" />
        </div>
        <p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-cyan-200">SHTEMARM · ՆՈՐ ՍԵՐՈՒՆԴ</p>
        <h1 className="text-balance text-3xl font-black leading-[1.4] tracking-normal sm:text-5xl">
          ՇՈՒՏՈՎ՝ ՆՈՐ ՏԵՍՔ, ՆՈՐ ՖՈՐՄԱՏ
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-pretty text-base leading-8 text-slate-300">
          Պատրաստում ենք ուսման նոր հարթակ՝ շտեմարաններ, քննություններ, բառարան,
          համալսարանների ուղեցույց և առաջընթացի խաղային համակարգ։
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-200">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><BookOpen className="size-4" /> Ուսում</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><GraduationCap className="size-4" /> Ընդունելություն</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><Sparkles className="size-4" /> Նոր հնարավորություններ</span>
        </div>
        <p className="mt-10 text-xs text-slate-400">Շնորհակալություն սպասելու համար։</p>
      </div>
    </main>
  );
}
