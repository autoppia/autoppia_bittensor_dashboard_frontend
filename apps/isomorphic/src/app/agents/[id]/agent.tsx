"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import AgentStats from "./agent-stats";
import AgentScoreChart from "./agent-score-chart";
import AgentScoreAnalytics from "./agent-score-analytics";
import AgentValidators from "./agent-validators";
import { Text } from "rizzui";
import { useMinerDetails } from "@/services/hooks/useAgents";
import cn from "@core/utils/class-names";
import { useMemo } from "react";
import { AgentHeaderPlaceholder } from "@/components/placeholders/agent-placeholders";
import type { ScoreRoundDataPoint } from "@/services/api/types/agents";
import {
  PiGithubLogoDuotone,
  PiHashDuotone,
  PiKeyDuotone,
  PiCopyDuotone,
  PiInfoDuotone,
  PiSparkle,
} from "react-icons/pi";

export default function Agent() {
  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const { data: agentData, loading, error } = useMinerDetails(uid);

  // Extract agent and scoreRoundData from the new API format
  const agent = agentData?.agent;
  const apiScoreRoundData = agentData?.scoreRoundData;
  const githubAvailable = Boolean(agent?.githubUrl && !agent?.isSota);
  const taoStatsAvailable = Boolean(
    !agent?.isSota && (agent?.taostatsUrl || agent?.hotkey)
  );

  // Transform score round data only when API data changes
  const normalizeScore = (value?: number | null): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    if (Number.isNaN(value)) {
      return null;
    }
    return value > 1 ? value / 100 : value;
  };

  const scoreRoundData: ScoreRoundDataPoint[] = useMemo(() => {
    if (!apiScoreRoundData || apiScoreRoundData.length === 0) {
      return [];
    }

    return apiScoreRoundData.map((point: any) => ({
      round_id: point.round_id,
      score: normalizeScore(point.score) ?? 0,
      rank: point.rank,
      reward: point.reward ?? 0,
      timestamp: point.timestamp,
      topScore: normalizeScore(
        point.topScore ?? point.top_score ?? point.bestScore
      ),
      benchmarks: Array.isArray(point.benchmarks)
        ? point.benchmarks.map((benchmark: any) => ({
            name: benchmark.name ?? benchmark.provider ?? "Benchmark",
            provider: benchmark.provider,
            score: normalizeScore(benchmark.score) ?? 0,
          }))
        : undefined,
    }));
  }, [apiScoreRoundData]);

  // Show loading state
  if (loading) {
    return (
      <>
        <AgentHeaderPlaceholder />
        <div className="space-y-6">
          <div className="h-32 bg-gray-100/50 rounded-xl animate-pulse"></div>
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="w-full xl:w-[calc(100%-320px)] h-80 bg-gray-100/50 rounded-xl animate-pulse"></div>
            <div className="w-full xl:w-[320px] h-80 bg-gray-100/50 rounded-xl animate-pulse"></div>
          </div>
          <div className="h-96 bg-gray-100/50 rounded-xl animate-pulse"></div>
        </div>
      </>
    );
  }

  // Show error state
  if (error || !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading agent</div>
          <div className="text-gray-500 text-sm">{error || 'Agent not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div className="flex items-center gap-6">
          <Image
            src={`/miners/${agent.uid % 50}.svg`}
            alt={agent.name}
            width={56}
            height={56}
            className="rounded-full border-2 border-gray-200 shadow-sm"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{agent.name}</span>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  agent.isSota
                    ? "bg-purple-100 text-purple-700"
                    : agent.status === "active"
                      ? "bg-green-100 text-green-700"
                      : agent.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                )}
              >
                {agent.isSota ? "SOTA" : agent.status}
              </span>
            </div>
            {/* UID and Hotkey */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <PiHashDuotone className="w-4 h-4 text-gray-500" />
                <span className="font-mono">
                  UID: {agent.isSota ? "—" : agent.uid ?? "unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PiKeyDuotone className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-xs">
                  {agent.isSota
                    ? "No on-chain hotkey"
                    : agent.hotkey
                      ? `${agent.hotkey.slice(0, 8)}...${agent.hotkey.slice(-8)}`
                      : "unknown"}
                </span>
                {!agent.isSota && agent.hotkey && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(agent.hotkey)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy hotkey"
                  >
                    <PiCopyDuotone className="w-3 h-3" />
                  </button>
                )}
              </div>
              {agent.isSota && (
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
                  <PiSparkle className="h-4 w-4" />
                  Benchmark Agent
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Top right icons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                githubAvailable ? "text-gray-600" : "text-gray-400"
              )}
            >
              Code • Open Source
            </span>
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                githubAvailable
                  ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  : "bg-gray-200 cursor-not-allowed opacity-60"
            )}
            title={
              agent.isSota
                ? "GitHub repository not available for SOTA benchmarks"
                : agent.githubUrl
                  ? "View GitHub repository"
                  : "GitHub repository not available"
            }
            >
              {githubAvailable ? (
              <a
                href={agent.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full items-center justify-center group"
              >
                <PiGithubLogoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
              </a>
            ) : (
              <PiGithubLogoDuotone className="w-5 h-5 text-gray-400" />
            )}
            </div>
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
              taoStatsAvailable
                ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                : "bg-gray-200 cursor-not-allowed opacity-60"
            )}
            title={
              agent.isSota
                ? "On-chain explorer is not available for SOTA benchmarks"
                : agent.taostatsUrl || agent.hotkey
                  ? "View on TaoStats"
                  : "TaoStats link not available"
            }
          >
            {taoStatsAvailable ? (
              <a
                href={
                  agent.taostatsUrl ||
                  (agent.hotkey
                    ? `https://taostats.io/subnets/36/metagraph?filter=${encodeURIComponent(agent.hotkey)}`
                    : "#")
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full items-center justify-center group"
              >
                <PiInfoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
              </a>
            ) : (
              <PiInfoDuotone className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      <AgentStats />
      <div className="flex flex-col xl:flex-row gap-6 items-stretch mt-6">
        <AgentScoreChart className="w-full xl:w-[calc(100%-320px)]" scoreRoundData={scoreRoundData} />
        <AgentScoreAnalytics className="w-full xl:w-[320px]" />
      </div>
      <AgentValidators />
    </>
  );
}
