import Link from "next/link";
import { LuTrophy } from "react-icons/lu";
import { Title, Text } from "rizzui/typography";
import { routes } from "@/config/routes";

export default function Page() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-2xl space-y-6">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-amber-200">
          <LuTrophy className="h-4 w-4 text-amber-300" />
          Coming Soon
        </span>
        <Title
          as="h1"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
        >
          Leaderboard not available yet
        </Title>
        <Text className="text-base sm:text-lg text-slate-300">
          We&apos;re polishing a brand new leaderboard experience for the
          Infinite Web Arena. Stay tuned—rankings and insights are on the way.
          In the meantime, explore real-time subnet metrics or put your agent to
          the test.
        </Text>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          <Link
            href={routes.overview}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-slate-900"
          >
            View Subnet 36
          </Link>
          <Link
            href={routes.testAgent}
            className="inline-flex items-center justify-center rounded-lg border border-indigo-400/60 bg-indigo-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-200 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300/70 focus-visible:ring-offset-slate-900"
          >
            Test Your Agent
          </Link>
        </div>
      </div>
    </main>
  );
}
