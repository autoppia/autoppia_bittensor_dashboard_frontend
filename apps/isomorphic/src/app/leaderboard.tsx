"use client";

import MetricCard from "@core/components/cards/metric-card";
import WidgetCard from "@core/components/cards/widget-card";
import TicketIcon from "@core/components/icons/ticket";
import TagIcon from "@core/components/icons/tag";
import TagIcon2 from "@core/components/icons/tag-2";
import TagIcon3 from "@core/components/icons/tag-3";
import MinerChart from "@/app/shared/miner-chart";
import PageHeader from "@/app/shared/page-header";
import {
  PiShieldDuotone,
  PiOpenAiLogoDuotone,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiArrowClockwiseDuotone,
  PiHashDuotone
} from "react-icons/pi";
import { Badge } from "rizzui";

import { validatorsData } from "@/data/validators-data";

const data = [
  {
    month: "Jan",
    newUser: 5000,
    user: 1600,
    sessions: 4000,
  },
  {
    month: "Feb",
    newUser: 8500,
    user: 2000,
    sessions: 5798,
  },
  {
    month: "Mar",
    newUser: 7000,
    user: 3000,
    sessions: 8300,
  },
  {
    month: "Apr",
    newUser: 5780,
    user: 3908,
    sessions: 6798,
  },
  {
    month: "May",
    newUser: 4890,
    user: 2500,
    sessions: 5000,
  },
  {
    month: "Jun",
    newUser: 8000,
    user: 3200,
    sessions: 7800,
  },
  {
    month: "Jul",
    newUser: 4890,
    user: 2500,
    sessions: 8500,
  },
  {
    month: "Aug",
    newUser: 3780,
    user: 3908,
    sessions: 9908,
  },
  {
    month: "Sep",
    newUser: 7800,
    user: 2800,
    sessions: 8500,
  },
  {
    month: "Oct",
    newUser: 5780,
    user: 1908,
    sessions: 7208,
  },
  {
    month: "Nov",
    newUser: 4780,
    user: 1908,
    sessions: 4908,
  },
  {
    month: "Dec",
    newUser: 7500,
    user: 3000,
    sessions: 9000,
  },
];

export default function Leaderboard() {
  return (
    <>
      <PageHeader title={"Network Analytics"} className="mt-4" />
      <div className="flex gap-8">
        <div className="w-[calc(100%-500px)]">
          <MinerChart title="Top Miner" data={data} />
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
        <div className="text-green-500 animate-pulse">
          <Badge renderAsDot className="me-0.5 ms-4 bg-green-500" /> Live Update
        </div>
      </PageHeader>
      <div className="grid grid-cols-3 gap-6">
        {validatorsData.map((val) => (
          <WidgetCard
            key={val.uid}
            title={
              <div className="flex items-center text-white">
                <span className="text-blue-500"><PiShieldDuotone /></span>
                <span className="ms-2">Validator {val.uid}</span>
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
                  Login with email 'johndoe@gmail.com' and password 'PASSWORD'
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
