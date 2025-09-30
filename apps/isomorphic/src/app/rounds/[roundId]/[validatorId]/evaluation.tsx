"use client";

import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import { Select, Text } from "rizzui";
import { validatorsDataMap } from "@/data/validators-data";
import { roundsData } from "@/data/rounds-data";
import ValidatorStats from "./evaluation-stats";
import MinersScoreChart from "@/app/shared/miners/miners-score-chart";
import TopMinersCard from "@/app/shared/miners/top-miners-card";

type OptionType = {
  label: string;
  value: number;
};

export default function Evaluation() {
  const { roundId, validatorId } = useParams();
  const router = useRouter();

  return (
    <>
      <PageHeader
        title={`Round ${roundId} - ${validatorsDataMap[validatorId as string].name}`}
        className="mt-4 gap-4"
      >
        <div className="flex items-center gap-2 text-gray-900">
          <Text className="text-xl font-semibold">Round: </Text>
          <Select
            options={roundsData
              .slice(-10)
              .reverse()
              .map((round) => ({
                label: round.id.toString(),
                value: round.id,
              }))}
            value={roundId as string}
            onChange={(option: OptionType) => {
              router.push(`/rounds/${option.value}/${validatorId}`);
            }}
            className="w-16"
            selectClassName="h-8 ps-4 text-lg font-medium rounded-full bg-gradient-primary ring-0 focus:ring-0 border-none"
          />
        </div>
      </PageHeader>
      <ValidatorStats />
      <PageHeader title="Overview" className="mt-6" />
      <div className="flex flex-col lg:flex-row gap-6">
        <MinersScoreChart className="w-full lg:w-[calc(100%-360px)]"/>
        <TopMinersCard className="w-full lg:w-[360px]"/>
      </div>
    </>
  );
}
