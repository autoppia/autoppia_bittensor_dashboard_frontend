"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import {
  PiClockDuotone,
  PiArrowSquareOutDuotone,
  PiGithubLogoDuotone,
  PiHashDuotone,
  PiKeyDuotone,
  PiRobotDuotone,
} from "react-icons/pi";
import { CardLoadingSkeleton } from "@/app/shared/loading-screen";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";
import { useTaskPersonas } from "@/services/hooks/useTask";

function getRoundStatusLabel(status: string | undefined) {
  switch (status) {
    case "active":
      return "Current evaluation round";
    case "completed":
      return "Completed round";
    case "upcoming":
      return "Upcoming round";
    default:
      return "Round status unavailable";
  }
}

export default function TaskPersonas() {
  const { id } = useParams();
  const {
    personas,
    isLoading,
    error,
  } = useTaskPersonas(id as string);

  if (isLoading) {
    return <CardLoadingSkeleton count={3} className="mb-6" />;
  }

  if (error || !personas) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 3 }, (_, index) => (
          <StatsCardPlaceholder key={`task-persona-placeholder-${index}`} />
        ))}
      </div>
    );
  }

  const { round, validator, agent, task } = personas;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Round Card */}
      <div className="bg-gradient-to-br from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-2 border-amber-500/40 rounded-2xl p-5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="text-center h-full flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <PiClockDuotone className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h3 className="text-sm font-medium text-amber-300 mb-2">
            ROUND
          </h3>
          <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            #{round.id}
          </div>
          <div className="text-xs text-amber-200 mt-2">
            {getRoundStatusLabel(round.status)}
          </div>
          <div className="text-xs text-amber-200 mt-2">
            {round.name}
          </div>
        </div>
      </div>

      {/* Validator Card */}
      <div className="bg-gradient-to-br from-purple-500/15 via-pink-500/15 to-purple-600/15 border-2 border-purple-500/40 rounded-2xl p-5 hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex items-center space-x-4 h-20 mb-4">
          <div className="relative flex items-center justify-center">
            {validator.image ? (
              <Image
                alt={validator.name}
                src={validator.image}
                width={56}
                height={56}
                className="rounded-xl group-hover:scale-105 transition-transform object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <PiHashDuotone className="w-6 h-6 text-purple-200" />
              </div>
            )}
            {validator.website && (
              <a
                href={validator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                title="Visit validator website"
              >
                <PiArrowSquareOutDuotone className="w-3 h-3 text-white" />
              </a>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-purple-300 mb-1">
              VALIDATOR
            </h3>
            <p className="text-xl font-bold text-white mb-1">
              {validator.name}
            </p>
            {validator.github && (
              <div className="flex items-center space-x-2">
                <a
                  href={validator.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs font-medium hover:bg-purple-500/30 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <PiGithubLogoDuotone className="w-3 h-3" />
                    GitHub
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-3">
          <div className="text-xs text-purple-200 mb-1">Validator ID</div>
          <div className="font-mono text-sm text-white">{validator.id}</div>
        </div>
      </div>

      {/* Agent Card */}
      <div className="bg-gradient-to-br from-blue-500/15 via-cyan-500/15 to-blue-600/15 border-2 border-blue-500/40 rounded-2xl p-5 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
        <div className="flex items-center space-x-4 h-20 mb-4">
          <div className="relative flex items-center justify-center">
            {agent.image ? (
              <Image
                alt={agent.name}
                src={agent.image}
                width={56}
                height={56}
                className="rounded-xl group-hover:scale-105 transition-transform object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <PiRobotDuotone className="w-6 h-6 text-blue-200" />
              </div>
            )}
            {task.score !== undefined && (
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-bold text-white shadow-lg">
                {Math.round(task.score * 100)}%
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-300 mb-1">AGENT</h3>
            <p className="text-xl font-bold text-white mb-1">
              {agent.name}
            </p>
            <p className="text-xs text-blue-200 capitalize">
              {agent.type} agent
            </p>
          </div>
        </div>
        <div className="bg-blue-500/20 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <PiHashDuotone className="w-3 h-3" />
            <span className="font-mono">{agent.id}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <PiKeyDuotone className="w-3 h-3" />
            <span className="font-mono capitalize">{agent.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
