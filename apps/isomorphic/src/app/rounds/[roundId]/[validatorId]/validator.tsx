"use client";

import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import { Select, Text } from "rizzui";
import { validatorsDataMap } from "@/data/validators-data";
import { roundsData } from "@/data/rounds-data";
import ValidatorStats from "./validator-stats";
import ValidatorMinersScore from "./validator-miners-score";
import ValidatorTopMiners from "./validator-top-miners";

type OptionType = {
  label: string;
  value: number;
};

export default function Validator() {
  const { roundId, validatorId } = useParams();
  const router = useRouter();

  return (
    <>
      <PageHeader
        title={`Round ${roundId} - ${validatorsDataMap[validatorId as string].name}`}
        className="mt-4"
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
            selectClassName="h-8 ps-4 text-lg font-medium rounded-full bg-gradient-primary ring-0 focus:ring-0 border-none"
          />
        </div>
      </PageHeader>
      <ValidatorStats />
      <PageHeader title="Overview" className="mt-6" />
      <div className="flex gap-6">
        <ValidatorMinersScore />
        <ValidatorTopMiners />
      </div>
    </>
  );
}
