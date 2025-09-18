"use client";

import Image from "next/image";
import MetricCard from "@core/components/cards/metric-card";
import WidgetCard from "@core/components/cards/widget-card";
import TicketIcon from "@core/components/icons/ticket";
import TagIcon from "@core/components/icons/tag";
import TagIcon2 from "@core/components/icons/tag-2";
import TagIcon3 from "@core/components/icons/tag-3";
import MinerChart from "@/app/shared/miner-chart";
import PageHeader from "@/app/shared/page-header";
import BannerText from "@/app/shared/banner-text";
import {
  PiOpenAiLogoDuotone,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiArrowClockwiseDuotone,
  PiHashDuotone
} from "react-icons/pi";

import { validatorsData } from "@/data/validators-data";
import { leaderboardData } from "@/data/leaderboard-data";

export default function Leaderboard() {
  return (
    <>
      <PageHeader title={"Network Analytics"} className="mt-4" />
      <div className="flex gap-8">
        <div className="w-[calc(100%-500px)]">
          <MinerChart title="Top Miner" data={leaderboardData} />
        </div>
        <div className="w-[500px] grid grid-cols-2 gap-6">
          <MetricCard
            title="Total Tasks"
            metric="5000"
            icon={<TicketIcon className="h-full w-full" />}
            className="flex items-center"
          />
          <MetricCard
            title="Successful Tasks"
            metric="3000"
            icon={<TagIcon className="h-full w-full" />}
            className="flex items-center"
          />
          <MetricCard
            title="Failed Tasks"
            metric="2000"
            icon={<TagIcon2 className="h-full w-full" />}
            className="flex items-center"
          />
          <MetricCard
            title="Average Response Time"
            metric="35s"
            icon={<TagIcon3 className="h-full w-full" />}
            className="flex items-center"
          />
        </div>
      </div>
      <PageHeader title={"Live Events Feed"} className="mt-8">
        <BannerText color="#22C55E" text="Live Update" className="animate-pulse" />
      </PageHeader>
      <div className="grid grid-cols-3 gap-6">
        {validatorsData.map((val) => (
          <WidgetCard
            key={val.uid}
            title={
              <div className="flex items-center text-white">
                <Image
                  src={val.icon}
                  className="rounded-full"
                  alt="icon"
                  width={24}
                  height={24}
                />
                <span className="ms-2">{val.name}</span>
              </div>
            }
            description={<div className="w-60 truncate">{val.hotkey}</div>}
            headerClassName="w-full"
            action={
              <div className="flex items-center border border-green-500 px-2 py-1 rounded-full text-green-500">
                <span className="animate-spin text-sm">
                  <PiArrowClockwiseDuotone />
                </span>
                <span className="ms-1 text-[0.75rem]">Running</span>
              </div>
            }
          >
            <div className="pt-4">
              <div className="mb-2">
                <div className="flex items-center text-green-500">
                  <PiOpenAiLogoDuotone />
                  <span className="ms-1">Current Task:</span>
                </div>
                <p className="mt-2 text-[1rem] text-white text-wrap">
                  Login with email johndoe@gmail.com and password PASSWORD
                </p>
              </div>
              <div className="flex items-center text-yellow-500">
                <PiCurrencyDollarDuotone />
                <span className="ms-1">
                  Stake Weight: {val.weight.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center text-orange-500">
                <PiClockDuotone />
                <span className="ms-1">Updated: {val.updated}</span>
              </div>
              <div className="flex items-center text-blue-500">
                <PiHashDuotone />
                <span className="ms-1">Version: {val.version}</span>
              </div>
            </div>
          </WidgetCard>
        ))}
      </div>
    </>
  );
}