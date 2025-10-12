"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import AgentStats from "./agent-stats";
import AgentScoreChart from "./agent-score-chart";
import AgentScoreAnalytics from "./agent-score-analytics";
import AgentValidators from "./agent-validators";
import { Text } from "rizzui";
import { useMinerDetails, useMinerPerformance } from "@/services/hooks/useAgents";
import { agentsService } from "@/services/api/agents.service";
import { useState, useEffect } from "react";
import { AgentHeaderPlaceholder } from "@/components/placeholders/agent-placeholders";
import { PiGithubLogoDuotone, PiHashDuotone, PiKeyDuotone, PiCopyDuotone, PiInfoDuotone } from "react-icons/pi";

export default function Agent() {
  const { id } = useParams();
  const uid = parseInt(id as string, 10);
  const { data: agentData, loading, error } = useMinerDetails(uid);
  const [scoreRoundData, setScoreRoundData] = useState<any[]>([]);

  // Extract agent and scoreRoundData from the new API format
  const agent = agentData?.agent;
  const apiScoreRoundData = agentData?.scoreRoundData || [];

  // Update scoreRoundData when agent data is loaded
  useEffect(() => {
    if (apiScoreRoundData && apiScoreRoundData.length > 0) {
      // Transform the API data to match the expected format
      const transformedData = apiScoreRoundData.map((point: any) => ({
        round_id: point.round_id,
        score: point.score / 100, // Convert percentage back to decimal for chart
        rank: point.rank,
        reward: 0, // Not available in new format
        timestamp: point.timestamp
      }));
      
      setScoreRoundData(transformedData);
    } else {
      setScoreRoundData([]);
    }
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
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                agent.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : agent.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {agent.status}
              </span>
            </div>
            {/* UID and Hotkey moved under agent name */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <PiHashDuotone className="w-4 h-4 text-gray-500" />
                <span className="font-mono">UID: {agent.uid || 'unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <PiKeyDuotone className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-xs">
                  {agent.hotkey ? `${agent.hotkey.slice(0, 8)}...${agent.hotkey.slice(-8)}` : 'unknown'}
                </span>
                {agent.hotkey && (
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
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    SOTA
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Top right icons */}
        <div className="flex items-center gap-2">
          <a 
            href={agent.githubUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
            title={agent.githubUrl ? "View GitHub repository" : "GitHub repository not available"}
            onClick={!agent.githubUrl ? (e) => e.preventDefault() : undefined}
          >
            <PiGithubLogoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          </a>
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
            title="Taostats"
          >
            <PiInfoDuotone className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          </button>
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

