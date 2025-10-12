"use client";

import PageHeader from "@/app/shared/page-header";
import OverviewMinerChart from "./overview-miner-chart";
import OverviewMetrics from "./overview-metrics";
import OverviewValidators from "./overview-validators";
import { Title, Text } from 'rizzui/typography';
import cn from '@core/utils/class-names';
import Link from 'next/link';
import { PiArrowSquareOutDuotone, PiGithubLogoDuotone, PiArrowClockwiseDuotone, PiWifiHighDuotone } from 'react-icons/pi';
import { useOverviewData } from "@/services/hooks/useOverview";

export default function Overview() {
  const { data, loading, error, refetch } = useOverviewData();

  const getNetworkStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getNetworkStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  // Safe access to network status with fallback
  const networkStatus = data?.networkStatus || { status: 'unknown', networkLatency: 0 };

  return (
    <>
      <header className={cn('mb-6 mt-4')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Title
              as="h2"
              className="text-[22px] lg:text-3xl 4xl:text-[26px] font-bold"
            >
              Subnet 36 - Web Agents
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
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="flex items-center gap-2">
              <PiWifiHighDuotone className={cn("w-4 h-4", getNetworkStatusColor(networkStatus.status))} />
              <span className={cn("text-sm font-medium", getNetworkStatusColor(networkStatus.status))}>
                {getNetworkStatusIcon(networkStatus.status)} {networkStatus.status || 'Unknown'}
              </span>
              {networkStatus.networkLatency && (
                <span className="text-xs text-gray-500">
                  ({networkStatus.networkLatency}ms)
                </span>
              )}
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refetch}
              disabled={loading}
              className={cn(
                "group flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-all duration-300",
                loading && "animate-spin"
              )}
              title="Refresh data"
            >
              <PiArrowClockwiseDuotone className={cn("w-4 h-4 group-hover:scale-110 transition-transform duration-300", loading && "animate-spin")} />
            </button>

            {/* Version */}
            <span className="text-sm text-gray-500 font-medium">
              IM Version 1.0.0
            </span>
            
            {/* GitHub Link */}
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


      {/* Global Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 font-medium">Error loading overview data</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content - always render components, let them handle their own loading states */}
      <div className="flex flex-col lg:flex-row gap-6">
        <OverviewMinerChart className="w-full lg:w-[calc(100%-460px)]" />
        <OverviewMetrics className="w-full lg:w-[460px]" />
      </div>
      <OverviewValidators />
    </>
  );
}
