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
  const { id } = useParams();
  const [selectedRound, setSelectedRound] = useState<RoundType | null>(null);

  useEffect(() => {
    if (id === "current") {
      setSelectedRound(roundsData[roundsData.length - 1]);
    } else {
      const round = roundsData.find((round) => round.id === parseInt(id as string));
      setSelectedRound(round || null);
    }
  }, [id]);

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
