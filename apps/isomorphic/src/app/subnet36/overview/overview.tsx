"use client";

import { useEffect, useRef, useState } from "react";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import OverviewRecentActivity from "./overview-recent-activity";
import { Title } from "rizzui/typography";
import Link from "next/link";
import Image from "next/image";
import { PiGithubLogoDuotone, PiInfoDuotone, PiXBold } from "react-icons/pi";
import { useOverviewMetrics, useRecentActivity } from "@/services/hooks/useOverview";
import { useModal } from "@/app/shared/modal-views/use-modal";

export default function Overview() {
  const metricsColumnRef = useRef<HTMLDivElement | null>(null);
  const [metricsHeight, setMetricsHeight] = useState<number | undefined>(
    undefined
  );
  const subnetGithubUrl = "https://github.com/autoppia/autoppia_web_agents_subnet";
  const { openModal } = useModal();

  // Only load metrics for the "Latest finished round" label
  const {
    data: metrics,
    loading,
    refetch: refetchMetrics,
  } = useOverviewMetrics();
  const { data: recentData } = useRecentActivity(5);
  const latestActivity = (recentData?.activities ?? [])[0] ?? null;
  const hasFinishedRound = Boolean(
    metrics?.hasFinishedRound ??
      (metrics?.season !== null &&
        metrics?.season !== undefined &&
        metrics?.round !== null &&
        metrics?.round !== undefined)
  );
  // Last FINISHED round — drives the metric cards and "Latest finished" label
  const metricsRound = metrics?.round ?? null;
  const metricsSeason = metrics?.season ?? null;
  // Currently active round — drives the title badge and validator list
  const currentSeason = metrics?.currentSeason ?? metrics?.season ?? null;
  const currentRoundInSeason = metrics?.currentRound ?? metrics?.round ?? null;
  const metricsRoundLabel = hasFinishedRound
    ? metricsSeason !== null &&
      metricsSeason !== undefined &&
      metricsRound !== null &&
      metricsRound !== undefined
      ? `Season ${metricsSeason} · Round ${metricsRound}`
      : "—"
    : currentSeason !== null &&
        currentSeason !== undefined &&
        currentRoundInSeason !== null &&
        currentRoundInSeason !== undefined
      ? `Season ${currentSeason} · Round ${currentRoundInSeason}`
      : "—";
  const metricsRoundPrefix = hasFinishedRound ? "Latest finished:" : "Current round:";
  const leaderGithubUrl = hasFinishedRound
    ? metrics?.leader?.minerGithubUrl?.trim() || null
    : null;
  const currentRoundSummary =
    currentSeason !== null &&
    currentSeason !== undefined &&
    currentRoundInSeason !== null &&
    currentRoundInSeason !== undefined
      ? `Season ${currentSeason} · Round ${currentRoundInSeason}`
      : "Round pending";
  const lastFinishedSummary = hasFinishedRound ? metricsRoundLabel : "No finished round yet";
  const subnetVersionLabel = metrics?.subnetVersion || "—";
  const headerTone = hasFinishedRound
    ? "Consensus locked from the last completed round."
    : "Round in progress. The overview is following live subnet activity until the first consensus lands.";
  const currentHeaderBadges = [
    currentSeason !== null && currentSeason !== undefined
      ? {
          label: "Current season",
          value: `${currentSeason}`,
        }
      : null,
    {
      label: "Current round",
      value:
        currentRoundInSeason !== null && currentRoundInSeason !== undefined
          ? `${currentRoundInSeason}`
          : "—",
    },
    {
      label: "Last finished",
      value: lastFinishedSummary,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const rulesHeaderBadges = [
    {
      label: "Subnet",
      value: subnetVersionLabel,
    },
    metrics?.seasonRounds !== null && metrics?.seasonRounds !== undefined
      ? {
          label: "Season rounds",
          value: `${metrics.seasonRounds}`,
        }
      : null,
    metrics?.roundDurationMinutes !== null && metrics?.roundDurationMinutes !== undefined
      ? {
          label: "Round time",
          value:
            metrics.roundDurationMinutes >= 60
              ? `${(metrics.roundDurationMinutes / 60).toFixed(
                  Number.isInteger(metrics.roundDurationMinutes / 60) ? 0 : 1
                )}h`
              : `${metrics.roundDurationMinutes}m`,
        }
      : null,
    metrics?.seasonDurationMinutes !== null && metrics?.seasonDurationMinutes !== undefined
      ? {
          label: "Season time",
          value:
            metrics.seasonDurationMinutes >= 60
              ? `${(metrics.seasonDurationMinutes / 60).toFixed(
                  Number.isInteger(metrics.seasonDurationMinutes / 60) ? 0 : 1
                )}h`
              : `${metrics.seasonDurationMinutes}m`,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMetrics();
    }, 120000); // 120 seconds (2 minutes) - reduced from 30s for performance

    return () => clearInterval(interval);
  }, [refetchMetrics]);

  useEffect(() => {
    const element = metricsColumnRef.current;
    if (!element) {
      return;
    }

    setMetricsHeight(element.getBoundingClientRect().height);

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (!entry) {
        return;
      }
      setMetricsHeight(entry.contentRect.height);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [loading]);

  const openSubnetInfoModal = () => {
    openModal({
      view: (
        <SubnetInfoModal
          headerTone={headerTone}
          currentHeaderBadges={currentHeaderBadges}
          rulesHeaderBadges={rulesHeaderBadges}
          leaderGithubUrl={leaderGithubUrl}
          subnetGithubUrl={subnetGithubUrl}
        />
      ),
      size: "xl",
      customSize: 720,
    });
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[rgb(4,6,14)] px-4 pt-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Compact top bar */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/10 dark:bg-gray-50/50 px-3 sm:px-5 py-3 sm:py-3.5 shadow-[0_12px_40px_rgba(2,6,23,0.3)]">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <Title
            as="h2"
            className="text-lg font-bold tracking-tight text-white sm:text-xl"
          >
            Subnet 36 · Web Agents
          </Title>
          <button
            type="button"
            onClick={openSubnetInfoModal}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
            title="Subnet info"
          >
            <PiInfoDuotone className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentHeaderBadges.map((badge) => (
            <div
              key={badge.label}
              className="rounded-full border border-sky-400/18 bg-sky-400/[0.08] px-2.5 py-1 text-[11px] text-slate-100"
            >
              <span className="mr-1.5 uppercase tracking-[0.18em] text-sky-200/55">
                {badge.label}
              </span>
              <span className="font-semibold text-white">{badge.value}</span>
            </div>
          ))}
          <Link
            href={subnetGithubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-sky-200 transition hover:border-sky-300/45 hover:text-white"
          >
            <PiGithubLogoDuotone className="h-3.5 w-3.5" />
            <span>Repo</span>
          </Link>
          {leaderGithubUrl && (
            <Link
              href={leaderGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-300/45 hover:text-white"
            >
              <PiGithubLogoDuotone className="h-3.5 w-3.5" />
              <span>Leader</span>
            </Link>
          )}
        </div>
      </div>

      {/* Chart + Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_430px] min-w-0">
        <div className="min-w-0">
          <OverviewMinerChart
            className="w-full min-w-0 flex-1"
            targetHeight={metricsHeight}
            season={metricsSeason ?? currentSeason}
          />
        </div>

        <div
          className="min-w-0 flex flex-col gap-4"
          ref={metricsColumnRef}
        >
          <OverviewMetrics
            className="w-full min-w-0 flex-1"
            metrics={metrics}
            loading={loading}
            error={null}
            onRefetch={refetchMetrics}
          />
        </div>
      </div>

      {/* Validators */}
      <section className="mt-8 sm:mt-12">
        <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h3 className="text-2xl sm:text-[32px] md:text-[40px] font-black tracking-tight text-white">
            Validators <span className="text-slate-500">—</span> <span className="text-slate-400 text-lg sm:text-2xl md:text-[32px]">What&apos;s happening right now</span>
          </h3>
          {latestActivity ? (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 shadow-sm max-w-full sm:max-w-[600px]">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="truncate text-slate-300">
                {latestActivity.message}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-500/40 bg-slate-900/60 px-3.5 py-1.5 text-sm font-semibold text-slate-200 shadow-sm">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              <span>Waiting for activity…</span>
            </div>
          )}
        </div>
        <OverviewValidators
          currentRound={currentRoundInSeason}
          currentSeason={currentSeason}
          className="min-w-0 content-start"
        />
      </section>

      {/* Recent Activity */}
      <section className="mt-8 sm:mt-12 pb-8">
        <h3 className="mb-4 sm:mb-5 text-2xl sm:text-[32px] md:text-[40px] font-black tracking-tight text-white">
          Recent activity <span className="text-slate-500">—</span>{" "}
          <span className="text-slate-400 text-lg sm:text-2xl md:text-[32px]">Live feed</span>
        </h3>
        <OverviewRecentActivity className="min-w-0" />
      </section>
    </div>
  );
}

function SubnetInfoModal({
  headerTone,
  currentHeaderBadges,
  rulesHeaderBadges,
  leaderGithubUrl,
  subnetGithubUrl,
}: Readonly<{
  headerTone: string;
  currentHeaderBadges: Array<{ label: string; value: string }>;
  rulesHeaderBadges: Array<{ label: string; value: string }>;
  leaderGithubUrl: string | null;
  subnetGithubUrl: string;
}>) {
  const { closeModal } = useModal();

  return (
    <div className="m-auto w-full max-w-[720px] rounded-[28px] border border-white/10 dark:bg-gray-50/50 px-6 py-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.55)] sm:px-7 sm:py-7">
      <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4">
          <Image
            src="/images/automata.png"
            alt="Automata artwork"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Subnet 36 · Web Agents
            </h3>
            <p className="mt-1 text-sm text-slate-400">{headerTone}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => closeModal()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Close"
        >
          <PiXBold className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Current state
          </p>
          <div className="flex flex-wrap gap-2">
            {currentHeaderBadges.map((badge) => (
              <div
                key={badge.label}
                className="rounded-full border border-sky-400/18 bg-sky-400/[0.08] px-3 py-1.5 text-xs text-slate-100"
              >
                <span className="mr-2 uppercase tracking-[0.22em] text-sky-200/55">
                  {badge.label}
                </span>
                <span className="font-semibold text-white">{badge.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Subnet parameters
          </p>
          <div className="flex flex-wrap gap-2">
            {rulesHeaderBadges.map((badge) => (
              <div
                key={badge.label}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
              >
                <span className="mr-2 uppercase tracking-[0.22em] text-slate-500">
                  {badge.label}
                </span>
                <span className="font-semibold text-white">{badge.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Links
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://autoppia.substack.com/p/dynamic-zero-the-overfitting-punisher"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:text-white"
            >
              IM: Dynamic Zero V1
            </Link>
            <Link
              href={subnetGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:border-sky-300/55 hover:text-white"
            >
              <PiGithubLogoDuotone className="h-4 w-4" />
              <span>Subnet repo</span>
            </Link>
            {leaderGithubUrl && (
              <Link
                href={leaderGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:text-white"
              >
                <PiGithubLogoDuotone className="h-4 w-4" />
                <span>Leader repo</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
