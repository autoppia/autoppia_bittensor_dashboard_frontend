"use client";

import { useEffect, useRef, useState } from "react";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import { Title } from "rizzui/typography";
import Link from "next/link";
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
  // Last FINISHED round — drives the metric cards and "Latest round" label
  const metricsRound = metrics?.round ?? null;
  const metricsSeason = metrics?.season ?? null;
  // Currently active round — drives the title badge and validator list
  const currentSeason = metrics?.currentSeason ?? metrics?.season ?? null;
  const currentRoundInSeason = metrics?.currentRound ?? metrics?.round ?? null;
  const metricsRoundLabel =
    metricsSeason !== null && metricsSeason !== undefined && metricsRound !== null && metricsRound !== undefined
      ? `Season ${metricsSeason} · Round ${metricsRound}`
      : metricsRound ?? "—";
  const currentRoundLabel =
    currentSeason !== null && currentSeason !== undefined && currentRoundInSeason !== null && currentRoundInSeason !== undefined
      ? `Season ${currentSeason} · Round ${currentRoundInSeason}`
      : "—";
  const leaderGithubUrl = metrics?.leader?.minerGithubUrl?.trim() || null;

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
      {/* Content - each component handles its own loading states */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 min-w-0">
        <div className="w-full lg:w-[calc(100%-460px)] min-w-0 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 min-w-0">
            <Title
              as="h2"
              className="flex items-center gap-3 text-[14px] lg:text-3xl 4xl:text-[26px] font-bold min-w-0"
            >
              Subnet 36 - Web Agents
              {currentSeason !== null && currentSeason !== undefined && (
                <span className="inline-flex items-center rounded-md border border-emerald-400/60 bg-emerald-500/15 px-3 py-1 text-xs lg:text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100">
                  Season {currentSeason}
                </span>
              )}
              <Link
                href="https://autoppia.substack.com/p/dynamic-zero-the-overfitting-punisher"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-blue-400/60 bg-blue-500/15 px-3 py-1 text-xs lg:text-sm font-semibold text-blue-200 transition hover:border-blue-300 hover:text-blue-100"
              >
                IM: Dynamic Zero V1
              </Link>
            </Title>
          </div>
          <OverviewMinerChart
            className="w-full min-w-0 flex-1"
            targetHeight={metricsHeight}
            season={metricsSeason}
          />
        </div>
        <div
          className="w-full lg:w-[460px] min-w-0 flex flex-col"
          ref={metricsColumnRef}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                <span>Latest round:</span>
                <span className="font-bold text-white">
                  {metricsRoundLabel}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-200 shadow-sm">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden />
                <span>Current round:</span>
                <span className="font-bold text-white">
                  {currentRoundLabel}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 min-w-0">
              {/* <button
                onClick={handleOpenTimeline}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-black shadow-sm transition hover:border-gray-300 hover:text-black flex-shrink-0"
              >
                <FaPlay className="h-3.5 w-3.5 text-black" />
                Replay
              </button> */}
              {leaderGithubUrl && (
                <Link
                  href={leaderGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-400/45 bg-gradient-to-r from-emerald-400/20 via-teal-400/18 to-lime-300/20 px-2.5 text-sm font-semibold text-emerald-100 shadow-[0_10px_28px_rgba(16,185,129,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-300/65 hover:from-emerald-300/28 hover:via-teal-300/24 hover:to-lime-200/24 hover:text-white flex-shrink-0"
                  title="View Leader Repository"
                >
                  <PiGithubLogoDuotone className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Leader</span>
                </Link>
              )}
              <Link
                href={subnetGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-10 items-center gap-2 rounded-xl border border-sky-400/40 bg-gradient-to-r from-sky-500/18 via-indigo-500/18 to-fuchsia-500/18 px-2.5 text-sm font-semibold text-sky-100 shadow-[0_10px_28px_rgba(59,130,246,0.18)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sky-300/60 hover:from-sky-400/26 hover:via-indigo-400/24 hover:to-fuchsia-400/24 hover:text-white flex-shrink-0"
                title="View Subnet Repository"
              >
                <PiGithubLogoDuotone className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Subnet</span>
              </Link>
            </div>
          </div>
          <OverviewMetrics
            className="w-full min-w-0 flex-1"
            metrics={metrics}
            loading={loading}
            error={null}
            onRefetch={refetchMetrics}
          />
        </div>
      </div>
      <OverviewValidators
        currentRound={currentRoundInSeason}
        currentSeason={currentSeason}
      />
    </>
  );
}
