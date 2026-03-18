"use client";

import { useEffect, useRef, useState } from "react";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import OverviewRecentActivity from "./overview-recent-activity";
import { Title } from "rizzui/typography";
import Link from "next/link";
import Image from "next/image";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { useOverviewMetrics } from "@/services/hooks/useOverview";

export default function Overview() {
  const metricsColumnRef = useRef<HTMLDivElement | null>(null);
  const [metricsHeight, setMetricsHeight] = useState<number | undefined>(
    undefined
  );
  const subnetGithubUrl = "https://github.com/autoppia/autoppia_web_agents_subnet";

  // Only load metrics for the "Latest finished round" label
  const {
    data: metrics,
    loading,
    refetch: refetchMetrics,
  } = useOverviewMetrics();
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

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-[30px] border border-slate-700/60 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_80%_10%,_rgba(249,115,22,0.14),_transparent_25%),linear-gradient(135deg,_rgba(8,15,30,0.96),_rgba(17,12,36,0.92))] p-5 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:p-6 xl:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.18]" />
        <div className="relative">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/18 bg-emerald-400/10 text-emerald-200" aria-hidden>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M4 6h16v12H4z" />
                    <path d="M8 14l2-3 2 2 3-5 1 2" />
                  </svg>
                </span>
                Network operational
              </span>
              <Title
                as="h2"
                className="text-3xl font-black tracking-tight text-white sm:text-4xl 4xl:text-[42px]"
              >
                Subnet 36 · Web Agents
              </Title>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                {headerTone}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
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
                <span className="mx-1 hidden h-5 w-px bg-white/10 lg:inline-flex" aria-hidden />
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
            <div className="flex w-full max-w-[420px] flex-col items-end gap-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                  href="https://autoppia.substack.com/p/dynamic-zero-the-overfitting-punisher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:text-white"
                >
                  IM: Dynamic Zero V1
                </Link>
                {leaderGithubUrl && (
                  <Link
                    href={leaderGithubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:text-white"
                    title="View Leader Repository"
                  >
                    <PiGithubLogoDuotone className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>Leader repo</span>
                  </Link>
                )}
                <Link
                  href={subnetGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:border-sky-300/55 hover:text-white"
                  title="View Subnet Repository"
                >
                  <PiGithubLogoDuotone className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Subnet repo</span>
                </Link>
              </div>

              <div className="relative flex w-full items-end justify-center px-2 pt-1">
                <Image
                  src="/images/automata.png"
                  alt="Automata artwork"
                  width={360}
                  height={220}
                  className="relative h-auto w-full max-w-[240px] -translate-x-2 object-contain opacity-90"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_430px] min-w-0">
        <div className="min-w-0">
          <div className="rounded-[28px] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(10,14,30,0.95),rgba(7,10,23,0.88))] p-4 shadow-[0_28px_80px_rgba(2,6,23,0.38)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Season reward trajectory
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {hasFinishedRound
                    ? "Consensus history across the latest completed rounds."
                    : "Waiting for the first finished round. Until then, this panel follows the current season and stays ready to populate."}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                {metricsSeason ?? currentSeason ? `Season ${metricsSeason ?? currentSeason}` : "Season pending"}
              </span>
            </div>
            <OverviewMinerChart
              className="w-full min-w-0 flex-1"
              targetHeight={metricsHeight}
              season={metricsSeason ?? currentSeason}
            />
          </div>
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

      <section className="mt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[40px] font-black tracking-tight text-white">
            Validator status
          </h3>
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-500/40 bg-slate-900/60 px-3.5 py-1.5 text-sm md:text-base font-semibold text-slate-200 shadow-sm whitespace-nowrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-blue-300"
              aria-hidden
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <span>Current round:</span>
            <span className="font-extrabold text-white">
              {currentSeason != null && currentRoundInSeason != null
                ? `Season ${currentSeason} - Round ${currentRoundInSeason}`
                : "Pending"}
            </span>
          </div>
        </div>
        <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <OverviewValidators
            currentRound={currentRoundInSeason}
            currentSeason={currentSeason}
            className="min-w-0 content-start"
          />
          <OverviewRecentActivity className="min-w-0 h-full min-h-0" />
        </div>
      </section>
    </>
  );
}
