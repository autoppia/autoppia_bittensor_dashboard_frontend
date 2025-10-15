"use client";

import Image from "next/image";
import {
  PiClockDuotone,
  PiArrowSquareOutDuotone,
  PiGithubLogoDuotone,
  PiShieldCheck,
  PiRobot,
} from "react-icons/pi";

interface AgentRunPersonasProps {
  personas?: any;
  summary?: any;
}

function resolveImageSrc(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
) {
  if (!src || typeof src !== "string") return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

function truncateMiddle(value?: string | null, visible: number = 6) {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

export default function AgentRunPersonas({ personas, summary }: AgentRunPersonasProps) {
  // Debug: Log the data to see what we're receiving
  console.log("AgentRunPersonas - personas:", personas);
  console.log("AgentRunPersonas - summary:", summary);
  
  // Use actual data or fallback to defaults
  const roundData = personas?.round || { id: "20", status: "Active", startTime: null };
  const validatorData = personas?.validator || { name: "Autoppia", image: "/validators/Autoppia.png", id: null };
  const agentData = personas?.agent || { name: "GPT-4 Web", image: "https://ext.same-assets.com/3351110290/1873003866.svg", id: "001" };
  
  const roundStartLabel = roundData.startTime
    ? new Date(roundData.startTime).toLocaleString()
    : "—";

  const validatorHotkey = summary?.validatorId || validatorData.id || validatorData.name;
  const taoStatsUrl = validatorHotkey
    ? `https://taostats.io/validators/${validatorHotkey}`
    : null;

  const agentUid = agentData.id || summary?.agentId;
  const agentHotkey = summary?.agentId || agentData.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Round Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl group hover:border-amber-400/50 transition-all duration-300 hover:shadow-amber-500/10">
        <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent blur-3xl" />
        <div className="text-center h-full flex flex-col justify-center relative">
          {/* Status indicator */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              {roundData.status || "Active"}
            </div>
          </div>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mx-auto">
            <PiClockDuotone className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          
          <h3 className="text-sm font-medium text-amber-300 mb-3 uppercase tracking-wider">EVALUATION ROUND</h3>
          <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">#{roundData.id}</div>
          
          {/* Additional info */}
          <div className="space-y-2 mt-4">
            <div className="text-xs text-slate-400">
              {roundStartLabel !== "—" ? `Completed ${roundStartLabel}` : "Current evaluation round"}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-xs text-amber-300 font-medium">Current Round</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validator Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl group hover:border-purple-400/50 transition-all duration-300 hover:shadow-purple-500/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/15 via-purple-400/5 to-transparent blur-3xl" />
        
        {/* Header with status */}
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <PiShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-300 uppercase tracking-wider">VALIDATOR</h3>
              <p className="text-lg font-bold text-white">{validatorData.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">Running</span>
            <span className="text-xs text-slate-400">v7.2.1</span>
          </div>
        </div>

        {/* Validator info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Image
              alt={validatorData.name}
              width={64}
              height={64}
              className="rounded-xl group-hover:scale-105 transition-transform border-2 border-slate-700/50"
              src={resolveImageSrc(validatorData.image, "/validators/Other.png")}
            />
            {taoStatsUrl && (
              <a
                href={taoStatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                title="View on TaoStats"
              >
                <PiArrowSquareOutDuotone className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-400 mb-1">Validator Performance</div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"></div>
              </div>
              <span className="text-xs text-purple-300 font-medium">85%</span>
            </div>
          </div>
        </div>

        {/* Hotkey section */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-400 font-medium">Validator Hotkey</div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div className="font-mono text-sm text-white bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">{truncateMiddle(validatorHotkey)}</div>
        </div>
      </div>

      {/* Agent Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl group hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10">
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/15 via-blue-400/5 to-transparent blur-[100px]" />
        
        {/* Header with status */}
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <PiRobot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-300 uppercase tracking-wider">AGENT</h3>
              <p className="text-lg font-bold text-white">{agentData.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">#{agentUid || "1"}</span>
            <span className="text-xs text-slate-400">UID: {agentUid || "001"}</span>
          </div>
        </div>

        {/* Agent info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Image
              alt={agentData.name}
              width={64}
              height={64}
              className="rounded-xl group-hover:scale-105 transition-transform border-2 border-slate-700/50"
              src={resolveImageSrc(agentData.image)}
            />
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-bold text-white shadow-lg">#{agentUid || "1"}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-400 mb-1">Agent Performance</div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
              </div>
              <span className="text-xs text-blue-300 font-medium">78%</span>
            </div>
          </div>
        </div>

        {/* Actions and hotkey */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Quick Actions</span>
            <a
              href="https://github.com/miner1-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-500/30 rounded-lg hover:bg-blue-500/50 transition-all group-hover:scale-110 border border-blue-500/30"
            >
              <PiGithubLogoDuotone className="w-4 h-4 text-blue-300" />
            </a>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-400 font-medium">Bittensor Hotkey</div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="font-mono text-sm text-white bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">{truncateMiddle(agentHotkey)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

