"use client";

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/app/shared/page-header";
import { validatorsData } from "@/data/validators-data";
import { minersData } from "@/data/miners-data";
import {
  PiListChecksDuotone,
  PiTrophyDuotone,
  PiChartLineDuotone,
  PiUserDuotone,
} from "react-icons/pi";
import { Text } from "rizzui";

// Helper function to get top miner and calculate average score
const getValidatorStats = (validatorId: string) => {
  const sortedMiners = minersData.sort((a, b) => b.score - a.score);
  const topMiner = sortedMiners[0];
  const averageScore =
    minersData.reduce((sum, m) => sum + m.score, 0) / minersData.length;

  return {
    topMiner: topMiner,
    averageScore: averageScore,
  };
};

export default function RoundValidators() {
  return (
    <>
      <PageHeader title={"Validators"} className="mt-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {validatorsData.map((validator) => {
          const stats = getValidatorStats(validator.id);
          return (
            <div key={`validator-${validator.id}`}>
              <div className="group relative bg-black border border-cyan-400/30 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500 hover:scale-105">
                {/* Dark Cyberpunk Background with Subtle Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

                {/* Header */}
                <div className="relative p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-400/20">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* Intense Glowing Icon Container */}
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border-2 border-cyan-400 shadow-2xl shadow-cyan-500/80">
                        <Image
                          src={validator.icon}
                          alt={validator.name}
                          width={28}
                          height={28}
                          className="rounded-full object-contain"
                        />
                      </div>
                      {/* Intense Pulsing Ring Effect */}
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse opacity-100"></div>
                      <div className="absolute inset-0 rounded-full border border-cyan-300 animate-ping opacity-30"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-cyan-400 text-lg truncate drop-shadow-[0_0_15px_rgba(0,255,255,1)]">
                        {validator.name}
                      </h3>
                      <div className="text-xs text-cyan-500 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
                        VALIDATOR_NODE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="relative p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Tasks */}
                      <div className="text-center p-4 bg-black/50 rounded-lg border border-emerald-400/30 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/60 transition-all duration-300">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <PiListChecksDuotone className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,1)]" />
                          <span className="text-sm font-medium text-emerald-300 font-mono drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                            TASKS
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,1)]">
                          {validator.total_tasks.toLocaleString()}
                        </div>
                      </div>

                      {/* Average Score */}
                      <div className="text-center p-4 bg-black/50 rounded-lg border border-blue-400/30 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <PiChartLineDuotone className="w-4 h-4 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
                          <span className="text-sm font-medium text-blue-300 font-mono drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                            AVG_SCORE
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,1)]">
                          {(stats.averageScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Top Miner */}
                    <div className="p-4 bg-black/50 rounded-lg border border-yellow-400/30 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/60 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <PiTrophyDuotone className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,1)]" />
                        <span className="text-sm font-medium text-yellow-300 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                          TOP_MINER
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-yellow-500 font-mono font-medium drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                            UID:
                          </span>
                          <span className="text-sm font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]">
                            {stats.topMiner.uid}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-yellow-500 font-mono font-medium drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                            SCORE:
                          </span>
                          <span className="text-sm font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]">
                            {(stats.topMiner.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-yellow-500 font-mono font-medium drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                            HOTKEY:
                          </span>
                          <span className="text-sm font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]">
                            {stats.topMiner.hotkey.slice(0, 8)}...
                            {stats.topMiner.hotkey.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intense Cyberpunk Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
