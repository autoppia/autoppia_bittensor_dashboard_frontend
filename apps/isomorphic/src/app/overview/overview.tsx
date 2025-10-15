"use client";

import { useEffect, useRef } from "react";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import { Title } from "rizzui/typography";
import Link from "next/link";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { FaPlay } from "react-icons/fa";
import MinerAnimationModal from "@/app/shared/modal-views/miner-animation-modal";
import OverviewAnnouncementModal from "@/app/shared/modal-views/overview-announcement-modal";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { useOverviewData } from "@/services/hooks/useOverview";

const ANNOUNCEMENT_STORAGE_KEY = "overview-announcement-seen";

export default function Overview() {
  const { loading, error, refetch } = useOverviewData();
  const { openModal } = useModal();
  const hasOpenedAnnouncement = useRef(false);

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

      openModal({ view: <OverviewAnnouncementModal />, size: "md" });
      hasOpenedAnnouncement.current = true;
      try {
        window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
      } catch {
        // ignore storage write errors; modal has already been shown
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [openModal]);

  function handleOpenTimeline() {
    openModal({ view: <MinerAnimationModal />, customSize: 1260, size: "xl" });
  }

  return (
    <>
      {/* Global Error State */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 font-medium">Error loading overview data</p>
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
      <div className="flex flex-col lg:flex-row gap-6 min-w-0">
        <div className="w-full lg:w-[calc(100%-460px)] min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 min-w-0">
            <Title
              as="h2"
              className="text-[22px] lg:text-3xl 4xl:text-[26px] font-bold min-w-0"
            >
              Subnet 36 - Web Agents
            </Title>
            <button
              onClick={handleOpenTimeline}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:border-gray-300 hover:text-black flex-shrink-0"
            >
              <FaPlay className="h-3.5 w-3.5 text-black" />
              Replay
            </button>
          </div>
          <OverviewMinerChart className="w-full min-w-0" />
        </div>
        <div className="w-full lg:w-[460px] min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3 min-w-0">
            <span className="text-sm text-gray-500 font-medium min-w-0">
              IM Version 1.0.0
            </span>
            <Link
              href="https://github.com/autoppia/autoppia_bittensor_dashboard_frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
              title="View Subnet Repository"
            >
              <PiGithubLogoDuotone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </div>
          <OverviewMetrics className="w-full min-w-0" />
        </div>
      </div>
      <OverviewValidators />
    </>
  );
}
