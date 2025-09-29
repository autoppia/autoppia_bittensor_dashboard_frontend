"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import RoundList from "./round-list";
import RoundProgress from "./round-progress";
import RoundMiners from "./round-miners";
import { RoundType, roundsData } from "@/data/rounds-data";
import RoundValidators from "./round-validators";

export default function Round() {
  const { roundId } = useParams();
  const [selectedRound, setSelectedRound] = useState<RoundType | null>(null);

  useEffect(() => {
    if (roundId === "current") {
      setSelectedRound(roundsData[roundsData.length - 1]);
    } else {
      const round = roundsData.find((round) => round.id === parseInt(roundId as string));
      setSelectedRound(round || null);
    }
  }, [roundId]);

  return (
    <>
      <PageHeader title="Recent Rounds" className="mt-4" />
      <RoundList />
      {selectedRound && (
        <>
          <RoundProgress round={selectedRound as RoundType} />
          <RoundMiners />
          <RoundValidators />
        </>
      )}
    </>
  );
}
