"use client";

import RoundStats from "./round-stats";
import RoundValidators from "./round-validators";
import RoundMinerScores from "./round-miner-scores";
import RoundTopMiners from "./round-top-miners";
import RoundProgress from "./round-progress";
import PageHeader from "@/app/shared/page-header";
import { useParams } from "next/navigation";
import { Text } from "rizzui";
import { PiInfoDuotone, PiCrownDuotone, PiTrophyDuotone, PiUsersThreeDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiCodeDuotone } from "react-icons/pi";
import { validatorsData } from "@/data/validators-data";

export default function RoundResult() {
  const { id } = useParams();
  const roundId = parseInt(id as string);

  return (
    <>
      {/* Aggregated Summary Separator */}
      <div className="mt-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full border border-purple-200/50">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <Text className="text-xs text-purple-600 font-medium">
              Aggregated Summary
            </Text>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
        </div>
      </div>

      {/* Round X Info */}
      <div className="mt-8 mb-6 p-4 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
            <PiInfoDuotone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <Text className="text-sm font-medium text-gray-700">
              Round {roundId}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Key metrics and performance indicators for this round
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <Text className="text-xs text-emerald-600 font-medium">
              Round Data
            </Text>
          </div>
        </div>
      </div>

      <RoundProgress />

      <div className="mt-8 mb-8">
        <RoundStats />
      </div>

      {/* Validators Info Card */}
      <div className="mt-8 mb-6 p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
            <PiUsersThreeDuotone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <Text className="text-sm font-medium text-gray-700">
              Multiple Validators
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Click on different validators below to see detailed information and metrics for each validator
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <Text className="text-xs text-blue-600 font-medium">
              Interactive
            </Text>
          </div>
        </div>
      </div>

      <RoundValidators />

      {/* Improved Metrics Cards - Matching Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
        {/* Winner Card */}
        <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-yellow-500/15 border-2 border-amber-500/40 rounded-xl p-3 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiCrownDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xs font-medium text-amber-300">WINNER</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-1">
                  Miner 1
                </div>
                <div className="text-xs text-amber-200">5GHrA5gqhWVm1Cp92jXa...</div>
              </div>
            </div>

            <div className="bg-amber-500/20 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200">Leading by</span>
                <span className="text-sm font-bold text-white">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Top Score Card */}
        <div className="bg-gradient-to-br from-emerald-500/15 via-green-500/15 to-teal-500/15 border-2 border-emerald-500/40 rounded-xl p-3 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiTrophyDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xs font-medium text-emerald-300">TOP SCORE</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-1">
                  87.5%
                </div>
                <div className="text-xs text-emerald-200">Average performance</div>
              </div>
            </div>

            <div className="bg-emerald-500/20 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-200">Highest Score</span>
                <span className="text-sm font-bold text-white">98.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Miners Evaluated Card */}
        <div className="bg-gradient-to-br from-violet-500/15 via-purple-500/15 to-fuchsia-500/15 border-2 border-violet-500/40 rounded-xl p-3 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiUsersThreeDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xs font-medium text-violet-300">MINERS EVALUATED</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent mb-1">
                  42
                </div>
                <div className="text-xs text-violet-200">Active participants</div>
              </div>
            </div>

            <div className="bg-violet-500/20 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-violet-200">New Miners</span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-bold text-green-400">+3</span>
                  <span className="text-xs text-violet-200">this round</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Card */}
        <div className="bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-purple-500/15 border-2 border-blue-500/40 rounded-xl p-3 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiCodeDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xs font-medium text-blue-300">VERSION</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-1">
                  v{validatorsData[0]?.version || 7}
                </div>
                <div className="text-xs text-blue-200">Validator version</div>
              </div>
            </div>

            <div className="bg-blue-500/20 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-200">Latest Version</span>
                <span className="text-sm font-bold text-white">v7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScores className="w-full xl:w-[calc(100%-400px)]" />
        <RoundTopMiners className="w-full xl:w-[400px]" />
      </div>
    </>
  );
}
