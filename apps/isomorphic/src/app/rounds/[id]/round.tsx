"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import RoundRecents from "./round-recents";
import RoundResult from "./round-result";
import { LuCirclePlay, LuCircleCheckBig } from "react-icons/lu";
import { useRound } from "@/services/hooks/useRounds";
import { roundsData } from "@/data/rounds-data";

export default function Round() {
  const { id } = useParams();
  const roundId = parseInt(id as string);
  
  // Try to get round data from API, fallback to static data
  const { data: apiRound, loading, error } = useRound(roundId);
  
  // Use API data if available, otherwise fallback to static data
  const round = apiRound || roundsData.find((round) => round.id === roundId);
  
  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto">
        <PageHeader title={""} className="mt-4">
          <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-200 animate-pulse">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </PageHeader>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading round data...</span>
        </div>
      </div>
    );
  }
  
  // Show error state with fallback
  if (error && !round) {
    return (
      <div className="w-full max-w-[1600px] mx-auto">
        <PageHeader title={""} className="mt-4">
          <div className="flex items-center px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
            <span className="text-sm text-red-600">API Error - Using Static Data</span>
          </div>
        </PageHeader>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            ⚠️ API Error: {error}. Using static data as fallback.
          </p>
        </div>
        <RoundRecents />
        <RoundResult />
      </div>
    );
  }
  
  if (!round) {
    return (
      <div className="w-full max-w-[1600px] mx-auto">
        <PageHeader title={""} className="mt-4">
          <div className="flex items-center px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
            <span className="text-sm text-red-600">Round Not Found</span>
          </div>
        </PageHeader>
        <div className="text-center py-8">
          <p className="text-gray-600">Round {roundId} not found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <PageHeader title={""} className="mt-4">
        <div
          className={cn(
            "flex items-center px-3 py-1.5 rounded-full",
            round.current
              ? "animate-pulse bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/50"
              : "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-md shadow-green-500/50"
          )}
        >
          {round.current && (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          )}
          {!round.current && (
            <span className="text-sm mr-2">
              <LuCircleCheckBig />
            </span>
          )}
          <span className="text-sm">
            {round.current ? "Running" : "Finished"}
          </span>
        </div>
      </PageHeader>
      <RoundRecents />
      <RoundResult />
    </div>
  );
}
