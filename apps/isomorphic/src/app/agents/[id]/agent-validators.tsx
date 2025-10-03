"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WidgetCard from "@core/components/cards/widget-card";
import PageHeader from "@/app/shared/page-header";
import { validatorsData } from "@/data/validators-data";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
  PiListChecksDuotone,
} from "react-icons/pi";
import { Text, Select, SelectOption } from "rizzui";
import { roundsData, RoundType } from "@/data/rounds-data";

export default function AgentValidators() {
  const [round, setRound] = useState<RoundType>(
    roundsData.find((round) => round.current)!
  );
  const roundOptions: SelectOption[] = roundsData.map((round) => ({
    label: round.current ? `Round ${round.id} (Latest)` : `Round ${round.id}`,
    value: round.id,
  }));

  return (
    <>
      <PageHeader
        title={"Agent Evaluation Runs (6 validators)"}
        className="mt-6"
      >
        <Select
          options={roundOptions.slice().reverse()}
          value={roundOptions.find((option) => option.value === round?.id)}
          onChange={(option: SelectOption) => {
            setRound(roundsData.find((round) => round.id === option.value)!);
          }}
          className="w-44"
        />
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {validatorsData.map((validator) => (
          <Link key={`agent-run-${validator.id}`} href={`/agent-run/a7k2-9m4x`}>
            <WidgetCard
              title={
                <div className="flex items-center gap-2">
                  <div className="relative aspect-square w-10">
                    <Image
                      src={validator.icon}
                      alt={validator.name}
                      fill
                      sizes="(max-width: 768px) 100vw"
                      className="h-full w-full rounded-full object-contain"
                    />
                  </div>
                  <Text className="font-semibold text-gray-900">
                    {validator.name}
                  </Text>
                </div>
              }
              className="hover:border-gray-700 p-5 lg:p-5"
              headerClassName="w-full"
              action={
                <div className="rounded-full bg-gray-100 text-gray-700 px-3 py-1">
                  a7k2-9m4x
                </div>
              }
            >
              <div className="pt-2">
                <div className="flex justify-center mb-4">
                  <span className="text-2xl font-bold text-emerald-500 bg-emerald-500/20 px-5 py-1 rounded-full">
                    Score: 95%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-yellow-500">
                    <PiCurrencyDollarDuotone />
                    <span className="ms-1 text-xs">Stake:</span>
                    <span className="ms-1 font-medium text-xs">
                      {(validator.weight / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center text-orange-500">
                    <PiClockDuotone />
                    <span className="ms-1 text-xs">VTrust:</span>
                    <span className="ms-1 font-medium text-xs">
                      {validator.trust}
                    </span>
                  </div>
                  <div className="flex items-center text-blue-500">
                    <PiHashDuotone />
                    <span className="ms-1 text-xs">Version:</span>
                    <span className="ms-1 font-medium text-xs">
                      {validator.version}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PiListChecksDuotone />
                    <span className="ms-1 text-xs">Tasks:</span>
                    <span className="ms-1 font-medium text-xs">
                      {validator.total_tasks.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </WidgetCard>
          </Link>
        ))}
      </div>
    </>
  );
}
