"use client";

import { useState } from "react";
import { Title, Text } from "rizzui";
import { LuTrophy, LuCrown, LuSparkles } from "react-icons/lu";
import { PiGithubLogoDuotone, PiMedalDuotone, PiRobotDuotone } from "react-icons/pi";
import Link from "next/link";
import Image from "next/image";
import cn from "@core/utils/class-names";

const leaderboardData = [
  { rank: 1, name: "Subnet 36 Miner 6", score: 96.1, logo: "/images/agent-1.png", type: "Tensor Agent", change: "+2.3" },
  { rank: 2, name: "Subnet 36 Miner 9", score: 92.5, logo: "/images/agent-2.png", type: "Tensor Agent", change: "-0.5" },
  { rank: 3, name: "Subnet 36 Miner 22", score: 88.3, logo: "/images/agent-3.png", type: "Tensor Agent", change: "+1.2" },
  { rank: 4, name: "Subnet 36 Miner 34", score: 81.9, logo: "/images/agent-4.png", type: "Tensor Agent", change: "+0.8" },
  { rank: 5, name: "Subnet 36 Miner 57", score: 75.0, logo: "/images/agent-5.png", type: "Tensor Agent", change: "-1.1" },
  { rank: 6, name: "Anthropic Computer Use", score: 67.2, logo: "/images/agent-6.png", type: "AI Agent", change: "+3.4" },
  { rank: 7, name: "Browser Use with GPT-4o", score: 59.3, logo: "/images/agent-7.png", type: "GPT Agent", change: "-2.0" },
  { rank: 8, name: "Browser Use with Claude 3.7", score: 50.6, logo: "/images/agent-8.png", type: "Claude Agent", change: "+0.3" },
  { rank: 9, name: "Stagehand Open Operator", score: 44.0, logo: "/images/agent-9.png", type: "Operator Agent", change: "+1.5" },
  { rank: 10, name: "OpenAI CUA", score: 37.0, logo: "/images/agent-10.png", type: "OpenAI Agent", change: "-0.7" },
];

export default function Leaderboard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full min-h-screen pb-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 justify-end mb-8">
          <Link
            href="https://github.com/autoppia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 hover:border-gray-500 hover:shadow-lg hover:scale-105"
          >
            <PiGithubLogoDuotone className="h-4 w-4" />
            <span>GitHub</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/30 hover:border-yellow-400/50 rounded-3xl p-10 sm:p-16 mb-12 backdrop-blur-xl transition-all duration-300 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 via-transparent to-orange-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]"></div>
          
          {/* Floating Crown */}
          <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <LuCrown className="w-32 h-32 text-yellow-400 rotate-12" />
          </div>

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl">
                  <LuTrophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <Title
                as="h1"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent"
              >
                Infinite Web Arena
              </Title>
            </div>
            <Title as="h2" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Leaderboard
            </Title>
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <LuSparkles className="w-5 h-5 text-yellow-400" />
                <Text className="text-base sm:text-lg text-orange-100 font-medium">
                  {leaderboardData.length} Top Agents
                </Text>
              </div>
              <div className="w-px h-6 bg-orange-400/30"></div>
              <div className="flex items-center gap-2">
                <PiMedalDuotone className="w-5 h-5 text-yellow-400" />
                <Text className="text-base sm:text-lg text-orange-100 font-medium">
                  Live Rankings
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-500/30 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>

          <div className="relative p-6 sm:p-10">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-4 mb-6 border-b-2 border-cyan-400/30">
              <div className="col-span-1 text-center">
                <Text className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider">Rank</Text>
              </div>
              <div className="col-span-5 sm:col-span-4">
                <Text className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider">Agent</Text>
              </div>
              <div className="col-span-5 sm:col-span-6">
                <Text className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider text-center">IWA Score</Text>
              </div>
              <div className="col-span-1 text-right">
                <Text className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider">%</Text>
              </div>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-3">
              {leaderboardData.map((entry, index) => {
                const isTopThree = entry.rank <= 3;
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={cn(
                      "relative rounded-2xl overflow-hidden transition-all duration-300",
                      isTopThree
                        ? "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-transparent border-2 border-yellow-500/40 hover:border-yellow-400/60 hover:shadow-2xl hover:shadow-yellow-500/30"
                        : "bg-gradient-to-r from-gray-800/30 to-transparent border border-gray-700/40 hover:border-gray-600/60 hover:shadow-lg",
                      isHovered && "scale-[1.02] -translate-y-1"
                    )}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center p-4 sm:p-5">
                      {/* Rank */}
                      <div className="col-span-1 flex justify-center">
                        {isTopThree ? (
                          <div className="relative">
                            <div className={cn(
                              "absolute inset-0 blur-lg opacity-50",
                              entry.rank === 1 && "bg-yellow-400",
                              entry.rank === 2 && "bg-gray-300",
                              entry.rank === 3 && "bg-orange-600"
                            )}></div>
                            <div className={cn(
                              "relative text-3xl sm:text-4xl font-bold",
                              entry.rank === 1 && "animate-bounce-slow"
                            )}>
                              {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                            </div>
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center">
                            <Text className="text-sm sm:text-base font-bold text-gray-400">{entry.rank}</Text>
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-800 flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"></div>
                          <div className="relative w-full h-full flex items-center justify-center">
                            <PiRobotDuotone className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-sm sm:text-base font-bold text-white truncate">
                            {entry.name}
                          </Text>
                          <div className="flex items-center gap-2">
                            <Text className="text-xs text-gray-400">{entry.type}</Text>
                            {entry.change && (
                              <span className={cn(
                                "text-xs font-bold",
                                entry.change.startsWith('+') ? "text-green-400" : "text-red-400"
                              )}>
                                {entry.change}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="col-span-5 sm:col-span-6">
                        <div className="relative h-10 sm:h-12 bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700/50">
                          <div
                            className={cn(
                              "h-full transition-all duration-1000 ease-out relative",
                              isTopThree
                                ? entry.rank === 1
                                  ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                                  : entry.rank === 2
                                  ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500"
                                  : "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600"
                                : "bg-gradient-to-r from-orange-500 to-orange-400"
                            )}
                            style={{
                              width: `${entry.score}%`,
                            }}
                          >
                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                            {isHovered && (
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score Value */}
                      <div className="col-span-1 flex justify-end">
                        <Text
                          className={cn(
                            "text-lg sm:text-xl font-bold",
                            isTopThree
                              ? entry.rank === 1
                                ? "text-yellow-400"
                                : entry.rank === 2
                                ? "text-gray-300"
                                : "text-orange-400"
                              : "text-white"
                          )}
                        >
                          {entry.score}
                        </Text>
                      </div>
                    </div>

                    {/* Glow effect for top 3 */}
                    {isTopThree && (
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                        entry.rank === 1 && "bg-gradient-to-r from-yellow-500/5 to-orange-500/5",
                        entry.rank === 2 && "bg-gradient-to-r from-gray-400/5 to-blue-400/5",
                        entry.rank === 3 && "bg-gradient-to-r from-orange-500/5 to-red-500/5"
                      )}></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-cyan-400/30">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                <Text className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {leaderboardData[0].score}%
                </Text>
                <Text className="text-sm text-yellow-300 mt-1">Top Score</Text>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                <Text className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {(leaderboardData.reduce((sum, d) => sum + d.score, 0) / leaderboardData.length).toFixed(1)}%
                </Text>
                <Text className="text-sm text-cyan-300 mt-1">Average Score</Text>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <Text className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {leaderboardData.length}
                </Text>
                <Text className="text-sm text-purple-300 mt-1">Total Agents</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
