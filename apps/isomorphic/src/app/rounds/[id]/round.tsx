"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import RoundRecents from "./round-recents";
import RoundProgress from "./round-progress";
import RoundResult from "./round-result";
import { LuCirclePlay, LuCircleCheckBig } from "react-icons/lu";
import { roundsData } from "@/data/rounds-data";

export default function Round() {
  const { id } = useParams();
  const round = roundsData.find(
    (round) => round.id === parseInt(id as string)
  )!;
  
  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <PageHeader title={"Round " + round.id} className="mt-4">
        <div
          className={cn(
            "flex items-center px-3 py-1.5 rounded-full",
            round.current
              ? "animate-pulse bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/50"
              : "bg-gray-500 text-white"
          )}
        >
          <span className="text-sm">
            {round.current ? <LuCirclePlay /> : <LuCircleCheckBig />}
          </span>
          <span className="ms-1 text-sm">
            {round.current ? "Running" : "Finished"}
          </span>
        </div>
      </PageHeader>
      <RoundRecents />
      <RoundProgress />
      <RoundResult />
    </div>
  );
}
