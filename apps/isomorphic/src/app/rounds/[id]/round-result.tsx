"use client";

import React, { useMemo } from "react";
import RoundStats from "./round-stats";
import RoundValidators from "./round-validators";
import RoundMinerScores from "./round-miner-scores";
import RoundTopMiners from "./round-top-miners";
import { useParams } from "next/navigation";
import { Text } from "rizzui";
import { PiInfoDuotone, PiCrownDuotone, PiTrophyDuotone, PiUsersThreeDuotone, PiCoinsDuotone, PiCheckCircleDuotone } from "react-icons/pi";
import { useRoundValidators, useTopMiners, useRoundStatistics } from "@/services/hooks/useRounds";
import { extractRoundIdentifier } from "./round-identifier";
import { StatsCardPlaceholder } from "@/app/shared/placeholder";
import type { ValidatorPerformance, MinerPerformance } from "@/services/api/types/rounds";

export default function RoundResult() {
  const { id } = useParams();
  const roundKey = extractRoundIdentifier(id);
  const roundDisplay = roundKey?.match(/\d+/);
  const roundLabel = roundDisplay ? parseInt(roundDisplay[0], 10) : roundKey;
  
  // Get data from API
  const { data: validatorsData, loading: validatorsLoading } = useRoundValidators(roundKey);
  const { data: topMiners, loading: minersLoading } = useTopMiners(roundKey, 5);
  const { data: statistics, loading: statsLoading } = useRoundStatistics(roundKey);
  
  const loading = validatorsLoading || minersLoading || statsLoading;

  const [selectedValidator, setSelectedValidator] = React.useState<ValidatorPerformance | null>(null);

  const aggregatedTopMiner: MinerPerformance | null = useMemo(() => {
    if (!Array.isArray(topMiners) || topMiners.length === 0) {
      return null;
    }
    return topMiners[0] ?? null;
  }, [topMiners]);

  const selectedTopMiner: MinerPerformance | null = useMemo(() => {
    if (selectedValidator?.topMiner) {
      return selectedValidator.topMiner;
    }
    if (!Array.isArray(topMiners) || topMiners.length === 0) {
      return null;
    }
    if (!selectedValidator?.id) {
      return aggregatedTopMiner;
    }
    const filtered = topMiners.filter((miner) => miner.validatorId === selectedValidator.id);
    if (filtered.length > 0) {
      return filtered[0];
    }
    return aggregatedTopMiner;
  }, [topMiners, selectedValidator?.id, aggregatedTopMiner]);

  const winnerLabel = selectedTopMiner
    ? (selectedTopMiner.name && selectedTopMiner.name.trim().length > 0
        ? selectedTopMiner.name
        : `Miner ${selectedTopMiner.uid ?? "unknown"}`)
    : "No winner yet";
  
  // Handle validator selection
  const handleValidatorSelect = (validator: ValidatorPerformance) => {
    setSelectedValidator(validator);
  };

  // Auto-select first validator when validators data loads
  React.useEffect(() => {
    if (validatorsData && validatorsData.length > 0 && !selectedValidator) {
      setSelectedValidator(validatorsData[0]);
    }
  }, [validatorsData, selectedValidator]);
  

  return (
    <>
      {/* Aggregated Summary Separator */}
      <div className="mt-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100/80 to-blue-50/80 rounded-2xl border-2 border-blue-300/60 shadow-lg backdrop-blur-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse shadow-md"></div>
            <Text className="text-lg font-bold text-blue-700 tracking-wide">
              Round {roundLabel ?? ""}
            </Text>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
        </div>
      </div>

      {/* Aggregated Metrics Section */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20">
            <PiCheckCircleDuotone className="w-3 h-3 text-green-600" />
          </div>
          <Text className="text-sm font-medium text-gray-700">
            Aggregated Metrics
          </Text>
          <Text className="text-xs text-gray-500">
            Across all validators
          </Text>
        </div>
        <RoundStats selectedValidator={selectedValidator} />
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

      <RoundValidators onValidatorSelect={handleValidatorSelect} />


      {/* Improved Metrics Cards - Matching Style */}
      {loading || !statistics || !Array.isArray(topMiners) || !validatorsData || !selectedValidator ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 mt-6">
          {Array.from({ length: 4 }, (_, index) => (
            <StatsCardPlaceholder key={index} />
          ))}
        </div>
      ) : (
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
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {winnerLabel}
                </div>
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
                {(((selectedValidator.topScore ?? selectedValidator.averageScore) || 0) * 100).toFixed(1)}%
              </div>
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
                {selectedValidator.totalMiners ?? 0}
              </div>
            </div>
            </div>

          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-purple-500/15 border-2 border-blue-500/40 rounded-xl p-3 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 shadow-lg group backdrop-blur-md">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiCoinsDuotone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xs font-medium text-blue-300">TASKS</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-1">
                {selectedValidator.totalTasks}
              </div>
            </div>
            </div>

          </div>
        </div>
      </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 mt-6">
        <RoundMinerScores
          className="w-full xl:w-[calc(100%-400px)]"
          selectedValidatorId={selectedValidator?.id}
        />
        <RoundTopMiners
          className="w-full xl:w-[400px]"
          selectedValidatorId={selectedValidator?.id}
        />
      </div>
    </>
  );
}
