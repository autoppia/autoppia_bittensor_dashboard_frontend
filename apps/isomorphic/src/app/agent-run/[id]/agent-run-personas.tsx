"use client";

import Image from "next/image";
import {
  PiClockDuotone,
  PiShieldCheckDuotone,
  PiRobotDuotone,
  PiArrowSquareOutDuotone,
  PiGithubLogoDuotone,
} from "react-icons/pi";

export default function AgentRunPersonas() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Round Card */}
      <div className="group relative bg-black border border-emerald-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/50 hover:border-emerald-400 transition-all duration-500 hover:scale-105">
        {/* Cyberpunk Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-transparent to-cyan-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]"></div>

        <div className="relative p-6">
          <div className="text-center h-full flex flex-col justify-center">
            <div className="relative mx-auto mb-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black border-2 border-emerald-400 rounded-xl shadow-2xl shadow-emerald-500/80 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiClockDuotone className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,1)] group-hover:rotate-12 transition-transform duration-300" />
              </div>
              {/* Enhanced Pulsing Ring Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-emerald-400 animate-pulse opacity-100"></div>
              <div className="absolute inset-0 rounded-xl border border-emerald-300 animate-ping opacity-30"></div>
            </div>
            <h3 className="text-sm font-medium text-emerald-300 mb-1 font-mono drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
              ROUND
            </h3>
            <div className="text-4xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,1)] font-mono">
              #11
            </div>
            <div className="text-xs text-emerald-200 mt-2 font-mono drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]">
              Current evaluation round
            </div>
          </div>
        </div>

        {/* Cyberpunk Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
      </div>

      {/* Validator Card */}
      <div className="group relative bg-black border border-blue-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-blue-500/50 hover:border-blue-400 transition-all duration-500 hover:scale-105">
        {/* Cyberpunk Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-cyan-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>

        <div className="relative p-6">
          <div className="flex items-center space-x-4 mb-4 h-20">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center border-2 border-blue-400 shadow-2xl shadow-blue-500/80 group-hover:shadow-2xl transition-all duration-300">
                <Image
                  alt="Autoppia"
                  width={48}
                  height={48}
                  className="rounded-xl group-hover:scale-105 transition-transform object-contain"
                  src="/validators/Autoppia.png"
                />
              </div>
              {/* Enhanced Pulsing Ring Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-pulse opacity-100"></div>
              <div className="absolute inset-0 rounded-xl border border-blue-300 animate-ping opacity-30"></div>
              <a
                href="https://taostats.io/validators/5K3mR7pqX2NfHgL9QzVb8aEj6WcKt4Mp7"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-black border border-blue-400 hover:border-blue-400 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl shadow-blue-500/50"
                title="View on TaoStats"
              >
                <PiArrowSquareOutDuotone className="w-3 h-3 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]" />
              </a>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-300 mb-1 font-mono drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]">
                VALIDATOR
              </h3>
              <p className="text-xl font-bold text-blue-400 mb-1 font-mono drop-shadow-[0_0_10px_rgba(59,130,246,1)]">
                Autoppia
              </p>
              <span className="text-xs text-blue-200 font-mono drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]">
                v7.2.1
              </span>
            </div>
          </div>
          {/* <div className="flex items-center justify-center mb-4">
            <span className="px-3 py-1 bg-black/50 border border-green-400/30 text-green-400 rounded-full text-xs font-medium font-mono drop-shadow-[0_0_6px_rgba(34,197,94,0.8)] flex items-center gap-1">
              <PiShieldCheckDuotone className="w-3 h-3" />
              Running
            </span>
          </div> */}
          <div className="bg-black/50 border border-blue-400/30 rounded-lg p-3 h-16 flex flex-col justify-center hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer group">
            <div className="text-xs text-blue-200 mb-1 font-mono drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] group-hover:text-blue-100 transition-colors duration-300">
              Validator Hotkey
            </div>
            <div className="font-mono text-sm text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)] group-hover:text-blue-300 transition-colors duration-300">
              5K3mR7pqX2NfHgL9QzVb...
            </div>
          </div>
        </div>

        {/* Cyberpunk Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
      </div>

      {/* Agent Card */}
      <div className="group relative bg-black border border-yellow-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/50 hover:border-yellow-400 transition-all duration-500 hover:scale-105">
        {/* Cyberpunk Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 via-transparent to-orange-900/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]"></div>

        <div className="relative p-6">
          <div className="flex items-center space-x-4 mb-4 h-20">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center border-2 border-yellow-400 shadow-2xl shadow-yellow-500/80 group-hover:shadow-2xl transition-all duration-300">
                <Image
                  alt="Miner 1"
                  width={48}
                  height={48}
                  className="rounded-xl group-hover:scale-105 transition-transform object-contain"
                  src="https://ext.same-assets.com/3351110290/1873003866.svg"
                />
              </div>
              {/* Enhanced Pulsing Ring Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-yellow-400 animate-pulse opacity-100"></div>
              <div className="absolute inset-0 rounded-xl border border-yellow-300 animate-ping opacity-30"></div>
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-black border border-yellow-400 rounded-full text-xs font-bold text-yellow-400 shadow-2xl shadow-yellow-500/50 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,1)]">
                #1
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-300 mb-1 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                AGENT
              </h3>
              <p className="text-xl font-bold text-yellow-400 mb-1 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,1)]">
                Miner 1
              </p>
              <p className="text-xs text-yellow-200 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                UID: 001
              </p>
            </div>
            <a
              href="https://github.com/miner1-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-black/50 border border-yellow-400/30 rounded-lg hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all group-hover:scale-110"
            >
              <PiGithubLogoDuotone className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]" />
            </a>
          </div>
          <div className="bg-black/50 border border-yellow-400/30 rounded-lg p-3 h-16 flex flex-col justify-center hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 cursor-pointer group">
            <div className="text-xs text-yellow-200 mb-1 font-mono drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] group-hover:text-yellow-100 transition-colors duration-300">
              Bittensor Hotkey
            </div>
            <div className="font-mono text-sm text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)] group-hover:text-yellow-300 transition-colors duration-300">
              5GHrA5gqhWVm1Cp92jXa...
            </div>
          </div>
        </div>

        {/* Cyberpunk Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
      </div>
    </div>
  );
}
