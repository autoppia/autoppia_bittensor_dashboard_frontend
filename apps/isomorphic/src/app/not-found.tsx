import Link from "next/link";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-12rem] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-24 left-[-6rem] h-48 w-48 rounded-full bg-pink-400/25 blur-3xl" />
      </div>
      <div className="relative isolate max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100">
          404
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
          That subnet waypoint doesn&apos;t exist anymore. Double-check the URL
          or jump back into the dashboard to keep exploring validator stats.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={routes.home}
            className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/40"
          >
            <FiHome className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Dashboard
          </Link>
          <Link
            href={routes.rounds}
            className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white/90"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Browse Rounds
          </Link>
        </div>
      </div>
    </main>
  );
}
