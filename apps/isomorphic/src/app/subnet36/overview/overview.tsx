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

  // Only load metrics for the "Latest finished round" label
  const {
    data: metrics,
    loading,
    refetch: refetchMetrics,
  } = useOverviewMetrics();
  const metricsRound = metrics?.metricsRoundInSeason ?? metrics?.metricsRound ?? null;
  const metricsSeason = metrics?.metricsSeason ?? null;
  const currentSeason = metrics?.currentSeason ?? null;
  const currentRoundInSeason = metrics?.currentRoundInSeason ?? null;
  const metricsRoundLabel =
    metricsSeason !== null && metricsSeason !== undefined && metricsRound !== null && metricsRound !== undefined
      ? `Season ${metricsSeason} - Round ${metricsRound}`
      : metricsRound ?? "—";

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
              {metricsSeason !== null && metricsSeason !== undefined && (
                <span className="inline-flex items-center rounded-md border border-emerald-400/60 bg-emerald-500/15 px-3 py-1 text-xs lg:text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100">
                  Season {metricsSeason}
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
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>Latest finished round:</span>
              <span className="font-bold text-white">
                {metricsRoundLabel}
              </span>
            </span>
            <div className="flex items-center justify-end gap-2 min-w-0">
              {/* <button
                onClick={handleOpenTimeline}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-black shadow-sm transition hover:border-gray-300 hover:text-black flex-shrink-0"
              >
                <FaPlay className="h-3.5 w-3.5 text-black" />
                Replay
              </button> */}
              <Link
                href="https://github.com/autoppia/autoppia_web_agents_subnet"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-black shadow-sm transition hover:border-gray-300 hover:text-black flex-shrink-0"
                title="View Subnet Repository"
              >
                <PiGithubLogoDuotone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
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
        currentRound={currentRoundInSeason ?? metrics?.currentRound}
        currentSeason={currentSeason}
      />
    </>
  );
}
