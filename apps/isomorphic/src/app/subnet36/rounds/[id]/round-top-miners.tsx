"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import WidgetCard from "@core/components/cards/widget-card";
import cn from "@core/utils/class-names";
import { Text } from "rizzui/typography";
import { Skeleton } from "@core/ui/skeleton";
import { PiCrownFill } from "react-icons/pi";
import { useRoundMiners } from "@/services/hooks/useRounds";
import { extractRoundIdentifier } from "./round-identifier";
import { routes } from "@/config/routes";

interface RoundTopMinersProps {
  className?: string;
  selectedValidatorId?: string;
  roundNumber?: number;
}

export default function RoundTopMiners({
  className,
  selectedValidatorId,
  roundNumber,
}: RoundTopMinersProps) {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);

  const minersQuery = React.useMemo(
    () => ({
      page: 1,
      limit: 100,
      sortBy: "score" as const,
      sortOrder: "desc" as const,
    }),
    []
  );

  const {
    data: roundMinersData,
    loading,
    error,
  } = useRoundMiners(roundKey, minersQuery);

  const topMinersList = React.useMemo(() => {
    const miners =
      roundMinersData?.data?.miners && Array.isArray(roundMinersData.data.miners)
        ? roundMinersData.data.miners
        : [];

    if (!selectedValidatorId) {
      return miners.slice(0, 10);
    }

    const filtered = miners.filter(
      (miner) => miner.validatorId === selectedValidatorId
    );
    return filtered.length > 0 ? filtered : [];
  }, [roundMinersData, selectedValidatorId]);

  if (loading) {
    return (
      <WidgetCard
        title="Top Miners"
        className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-blue-400/40 backdrop-blur text-white shadow-2xl hover:shadow-blue-500/20 transition-shadow duration-300", className)}
        headerClassName="px-3 pb-2"
        titleClassName="text-white text-xl font-bold"
      >
        <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center w-full px-4 py-1.5">
                <Skeleton className="h-10 w-10 rounded-full me-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard
        title="Top Miners"
        className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-blue-400/40 backdrop-blur text-white shadow-2xl hover:shadow-blue-500/20 transition-shadow duration-300", className)}
        headerClassName="px-3 pb-2"
        titleClassName="text-white text-xl font-bold"
      >
        <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3 flex items-center justify-center">
          <div className="text-center text-red-400">
            <p className="text-lg font-semibold">Failed to load top miners</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (!topMinersList.length) {
    return (
      <WidgetCard
        title="Top Miners"
        className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-blue-400/40 backdrop-blur text-white shadow-2xl hover:shadow-blue-500/20 transition-shadow duration-300", className)}
        headerClassName="px-3 pb-2"
        titleClassName="text-white text-xl font-bold"
      >
        <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3 flex items-center justify-center">
          <div className="text-center text-gray-300">
            <p className="text-lg font-semibold">No miners ranked yet</p>
            <p className="text-sm mt-2">
              {selectedValidatorId
                ? "Select another validator or check back once evaluations complete."
                : "No miner leaderboard data is available for this round."}
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Top Miners"
      className={cn("h-[650px] px-2 lg:px-4 w-full rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-blue-400/40 backdrop-blur text-white shadow-2xl hover:shadow-blue-500/20 transition-shadow duration-300", className)}
      headerClassName="px-3 pb-2"
      titleClassName="text-white text-xl font-bold"
    >
      <div className="custom-scrollbar h-[560px] overflow-y-auto mt-3">
        <div className="flex flex-col">
          {topMinersList.map((miner, index) => {
            const agentHref =
              typeof roundNumber === "number" && Number.isFinite(roundNumber)
                ? `${routes.agents}/${miner.uid}?round=${roundNumber}&agent=${miner.uid}`
                : `${routes.agents}/${miner.uid}`;

            return (
              <Link
                key={`top-miner-${index}`}
                href={agentHref}
                title="Inspect Agent Run"
              >
                <div
                  className={cn(
                    "relative flex items-center w-full px-4 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-md cursor-pointer group border border-transparent hover:border-white/20",
                    index === 0 &&
                      "bg-yellow-500/15 border border-yellow-400/60 hover:border-yellow-400 hover:bg-yellow-500/25"
                  )}
                >
                  <div className="relative me-3 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 @sm:h-12 @sm:w-12">
                    <Image
                      src={`/miners/${miner.uid % 50}.svg`}
                      alt={miner.uid.toString()}
                      fill
                      sizes="(max-width: 768px) 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Text
                          className={cn(
                            "text-lg font-semibold text-white",
                            index === 0 && "text-yellow-400"
                          )}
                        >
                          {miner.isSota && miner.name
                            ? miner.name
                            : `Miner ${miner.uid}`}
                        </Text>
                        <div className="relative ms-2 text-xl">
                          {index === 0 && (
                            <>
                              <PiCrownFill className="animate-ping opacity-50 text-yellow-400" />
                              <PiCrownFill className="absolute top-0 left-0 text-yellow-400" />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-300 group-hover:text-gray-200">
                        <span className="uppercase tracking-wide">
                          UID {miner.uid}
                        </span>
                        <span
                          className="truncate max-w-[180px] text-[11px] font-normal uppercase tracking-wide text-gray-400 group-hover:text-gray-300"
                          title={miner.hotkey ?? "Hotkey unavailable"}
                        >
                          Hotkey{" "}
                          {miner.hotkey
                            ? `${miner.hotkey.slice(0, 6)}...${miner.hotkey.slice(-6)}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Text className="text-sm text-gray-300 font-medium">
                          Score:
                        </Text>
                        <div
                          className={cn(
                            "text-lg font-semibold",
                            index === 0 ? "text-yellow-400" : "text-cyan-400"
                          )}
                        >
                          {(miner.score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
}
