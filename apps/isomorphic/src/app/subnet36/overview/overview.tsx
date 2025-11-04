"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import { Title } from "rizzui/typography";
import Link from "next/link";
import { PiGithubLogoDuotone, PiInfoBold } from "react-icons/pi";
import { FaPlay } from "react-icons/fa";
import MinerAnimationModal from "@/app/shared/modal-views/miner-animation-modal";
import OverviewAnnouncementModal from "@/app/shared/modal-views/overview-announcement-modal";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { useOverviewData } from "@/services/hooks/useOverview";

const ANNOUNCEMENT_STORAGE_KEY = "overview-announcement-seen";

export default function Overview() {
  const { loading, error, refetch, data: overviewData } = useOverviewData();
  const { openModal } = useModal();
  const hasOpenedAnnouncement = useRef(false);
  const metricsColumnRef = useRef<HTMLDivElement | null>(null);
  const [metricsHeight, setMetricsHeight] = useState<number | undefined>(
    undefined
  );
  const metricsRound = overviewData?.metrics?.metricsRound ?? null;

  const openAnnouncementModal = useCallback(() => {
    openModal({ view: <OverviewAnnouncementModal />, size: "md" });
  }, [openModal]);

  useEffect(() => {
    if (hasOpenedAnnouncement.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        const hasSeen = window.localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
        if (hasSeen) {
          hasOpenedAnnouncement.current = true;
          return;
        }
      } catch {
        // ignore storage read errors and proceed to show the modal once
      }

      openAnnouncementModal();
      hasOpenedAnnouncement.current = true;
      try {
        window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
      } catch {
        // ignore storage write errors; modal has already been shown
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [openAnnouncementModal]);

  function handleOpenTimeline() {
    openModal({ view: <MinerAnimationModal />, customSize: 1260, size: "xl" });
  }

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
      {/* Global Error State */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 font-medium">
                Error loading overview data
              </p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content - always render components, let them handle their own loading states */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 min-w-0">
        <div className="w-full lg:w-[calc(100%-460px)] min-w-0 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 min-w-0">
            <Title
              as="h2"
              className="flex items-center gap-3 text-[22px] lg:text-3xl 4xl:text-[26px] font-bold min-w-0"
            >
              Subnet 36 - Web Agents
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
          />
        </div>
        <div
          className="w-full lg:w-[460px] min-w-0 flex flex-col"
          ref={metricsColumnRef}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Latest finished round:
              <span className="font-bold text-white">
                {metricsRound ?? "—"}
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
          <OverviewMetrics className="w-full min-w-0 flex-1" />
        </div>
      </div>
      <OverviewValidators />
      <button
        type="button"
        onClick={openAnnouncementModal}
        className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#070c16]/90 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_12px_30px_rgba(8,47,73,0.35)] backdrop-blur-sm transition hover:border-cyan-300 hover:text-white"
      >
        <PiInfoBold className="h-4 w-4" />
        IM Update
      </button>
    </>
  );
}
