"use client";

import PageHeader from "@/app/shared/page-header";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import { Title, Text } from 'rizzui/typography';
import cn from '@core/utils/class-names';
import Link from 'next/link';
import { PiArrowSquareOutDuotone } from 'react-icons/pi';
import { PiGithubLogoDuotone } from 'react-icons/pi';

export default function Overview() {
  return (
    <>
      <header className={cn('mb-6 mt-4')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Title
              as="h2"
              className="text-[22px] lg:text-3xl 4xl:text-[26px] font-bold"
            >
              Web Agents - Subnet 36
            </Title>
            <Link 
              href="https://taostats.io/subnets/36" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              Learn more
              <PiArrowSquareOutDuotone className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">
              IM Version 1.0.0
            </span>
            <Link 
              href="https://github.com/autoppia/autoppia_bittensor_dashboard_frontend" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-all duration-300"
              title="View Subnet Repository"
            >
              <PiGithubLogoDuotone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row gap-6">
        <OverviewMinerChart className="w-full lg:w-[calc(100%-460px)]" />
        <OverviewMetrics className="w-full lg:w-[460px]" />
      </div>
      <OverviewValidators />
    </>
  );
}
