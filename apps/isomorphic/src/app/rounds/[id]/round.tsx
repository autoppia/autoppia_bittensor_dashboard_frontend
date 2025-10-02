"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import cn from "@core/utils/class-names";
import PageHeader from "@/app/shared/page-header";
import RoundValidators from "./round-validators";
import RoundProgress from "./round-progress";
import RoundMiners from "./round-miners";
import { LuCirclePlay, LuCircleCheckBig } from "react-icons/lu";
import { RoundType, roundsData } from "@/data/rounds-data";
import { validatorsDataMap } from "@/data/validators-data";

export default function Round() {
  const { id } = useParams();
  const [round, setRound] = useState<RoundType | null>(null);
  const [validatorId, setValidatorId] = useState<string>("");

  useEffect(() => {
    const round = roundsData.find(
      (round) => round.id === parseInt(id as string)
    );
    if (round) {
      setRound(round);
    }
  }, [id]);

  return (
    <>
      {round && (
        <>
          <PageHeader
            title={
              `Round ${round.id}` +
              (validatorId ? ` - ${validatorsDataMap[validatorId].name}` : "")
            }
            className="mt-4"
          >
            <div
              className={cn(
                "flex items-center px-3 py-1.5 rounded-full",
                round.current
                  ? "animate-pulse bg-primary-green text-white"
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
          <RoundValidators
            validatorId={validatorId}
            setValidatorId={setValidatorId}
          />
          <RoundProgress round={round} />
          <RoundMiners />
        </>
      )}
    </>
  );
}
