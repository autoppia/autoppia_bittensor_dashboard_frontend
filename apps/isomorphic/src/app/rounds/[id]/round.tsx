"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import RoundRecents from "./round-recents";
import RoundResult from "./round-result";
import { LuCirclePlay, LuCircleCheckBig } from "react-icons/lu";
import { roundsData } from "@/data/rounds-data";

export default function Round() {
  const { id } = useParams();
  const round = roundsData.find(
    (round) => round.id === parseInt(id as string)
  )!;
  
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
