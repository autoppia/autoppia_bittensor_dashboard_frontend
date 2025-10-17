"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import {
  PiClockDuotone,
  PiArrowSquareOutDuotone,
  PiGithubLogoDuotone,
  PiHashDuotone,
  PiKeyDuotone,
  PiCopyDuotone,
} from "react-icons/pi";
import { useTaskPersonas } from "@/services/hooks/useTask";
import { useAgent } from "@/services/hooks/useAgents";
import LoadingScreen, { CardLoadingSkeleton } from "@/app/shared/loading-screen";
import Placeholder, { StatsCardPlaceholder } from "@/app/shared/placeholder";

export default function TaskPersonasDynamic() {
  const { id } = useParams();
  const { personas, isLoading, error } = useTaskPersonas(id as string);

  // Fetch full agent data to get UID and hotkey (when available)
  const { data: agentDetail } = useAgent(personas?.agent.id);
  const agentData = agentDetail?.agent;

  if (isLoading) {
    return <CardLoadingSkeleton count={4} className="mb-6" />;
  }

  if (error || !personas) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }, (_, index) => (
          <StatsCardPlaceholder key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Round Card */}
      <div className="bg-gradient-to-br from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-2 border-amber-500/40 rounded-2xl p-5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <PiClockDuotone className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h3 className="text-sm font-medium text-amber-300 mb-2">ROUND</h3>
          <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            #{personas.round.id}
          </div>
          <div className="text-xs text-amber-200 mt-2">
            {personas.round.status === 'active' ? 'Current evaluation round' : 
             personas.round.status === 'completed' ? 'Completed round' : 'Upcoming round'}
          </div>
        </div>
      </div>

      {/* Validator Card */}
      <div className="bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-purple-500/15 border-2 border-blue-500/40 rounded-2xl p-5 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <Image
              src={personas.validator.image}
              alt={personas.validator.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
          <h3 className="text-sm font-medium text-blue-300 mb-2">VALIDATOR</h3>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
            {personas.validator.name}
          </div>
          <div className="text-xs text-blue-200 mt-2 flex items-center justify-center gap-2">
            {personas.validator.website && (
              <a
                href={personas.validator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-100 transition-colors"
              >
                <PiArrowSquareOutDuotone className="w-3 h-3" />
              </a>
            )}
            {personas.validator.github && (
              <a
                href={personas.validator.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-100 transition-colors"
              >
                <PiGithubLogoDuotone className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Agent Card */}
      <div className="bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-teal-500/15 border-2 border-emerald-500/40 rounded-2xl p-5 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <Image
              src={personas.agent.image}
              alt={personas.agent.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
          <h3 className="text-sm font-medium text-emerald-300 mb-2">AGENT</h3>
          <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-1">
            {personas.agent.name}
          </div>
          {/* UID and Hotkey under agent name */}
          <div className="flex items-center justify-center gap-3 text-xs text-emerald-200 mt-1">
            <div className="flex items-center gap-1">
              <PiHashDuotone className="w-3 h-3" />
              <span className="font-mono">UID: {agentData?.uid || 'unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <PiKeyDuotone className="w-3 h-3" />
              <span className="font-mono text-xs">
                {agentData?.hotkey ? `${agentData.hotkey.slice(0, 6)}...${agentData.hotkey.slice(-6)}` : 'unknown'}
              </span>
              {agentData?.hotkey && (
                <button 
                  onClick={() => navigator.clipboard.writeText(agentData.hotkey)}
                  className="p-0.5 hover:bg-emerald-500/20 rounded transition-colors"
                  title="Copy hotkey"
                >
                  <PiCopyDuotone className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-emerald-200 mt-2 capitalize">
            {personas.agent.type} agent
          </div>
        </div>
      </div>

      {/* Task Card */}
      <div className="bg-gradient-to-br from-violet-500/15 via-purple-500/15 to-fuchsia-500/15 border-2 border-violet-500/40 rounded-2xl p-5 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <div className="text-2xl font-bold text-white">
              {personas.task.id.slice(-2)}
            </div>
          </div>
          <h3 className="text-sm font-medium text-violet-300 mb-2">TASK</h3>
          <div className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-1">
            {personas.task.website}
          </div>
          <div className="text-xs text-violet-200 mt-2">
            {personas.task.useCase} • {Math.round(personas.task.score * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
