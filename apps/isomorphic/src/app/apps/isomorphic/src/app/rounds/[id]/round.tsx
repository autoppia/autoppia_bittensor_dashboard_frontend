"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import RoundRecents from "./round-recents";
import RoundProgress from "./round-progress";
import RoundValidators from "./round-validators";
import RoundMiners from "./round-miners";
import { LuCirclePlay, LuCircleCheckBig } from "react-icons/lu";
import { roundsData } from "@/data/rounds-data";

export default function Round() {
  const { id } = useParams();
  const round = roundsData.find((round) => round.id === parseInt(id as string))!;
  const [validator, setValidator] = useState<string>("all");

  return (
    <>
      <PageHeader title={"Round " + round.id} className="mt-4">
        <div
          className={cn(
            "flex items-center px-3 py-1.5 rounded-full",
            round.current
              ? "animate-pulse bg-emerald-500 text-white"
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
      <RoundValidators />
      <RoundMiners validator={validator} setValidator={setValidator} />
    </>
  );
}
