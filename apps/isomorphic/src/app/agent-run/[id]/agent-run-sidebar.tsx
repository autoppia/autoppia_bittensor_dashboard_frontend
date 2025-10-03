"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import cn from "@core/utils/class-names";
import { Text, Input, Select, SelectOption } from "rizzui";
import { validatorsData } from "@/data/validators-data";

const roundOptions = [
  { value: 1, label: "Round 1" },
  { value: 2, label: "Round 2" },
  { value: 3, label: "Round 3" },
  { value: 4, label: "Round 4" },
  { value: 5, label: "Round 5" },
];

const agentOptions = [
  { value: 1, label: "Agent 1" },
  { value: 2, label: "Agent 2" },
  { value: 3, label: "Agent 3" },
];

export default function AgentRunSidebar({
  roundId,
  validatorId,
  agentId,
  setRoundId,
  setValidatorId,
  setAgentId,
}: {
  roundId: string;
  validatorId: string;
  agentId: string;
  setRoundId: (roundId: string) => void;
  setValidatorId: (validatorId: string) => void;
  setAgentId: (agentId: string) => void;
}) {
  const selectedRoundOption =
    roundOptions.find((option) => option.value.toString() === roundId) || null;

  const selectedAgentOption =
    agentOptions.find((option) => option.value.toString() === agentId) || null;

  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
      <div className="h-full border rounded-xl bg-gray-50 pb-4">
        <Text className="sticky top-0 px-6 py-4 text-2xl font-bold text-gray-900 border-b">
          Filters
        </Text>
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto px-4 mt-3 scroll-smooth">
          <div className="flex flex-col gap-1">
            <div className="mb-2">
              <Select
                label={
                  <Text className="text-lg font-semibold text-gray-900">
                    Round:
                  </Text>
                }
                options={roundOptions.slice().reverse()}
                value={selectedRoundOption}
                onChange={(option: SelectOption) =>
                  setRoundId(option.value.toString())
                }
              />
            </div>
            <div className="mb-2">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Validator:
              </Text>
              <div className="grid grid-cols-3 gap-2">
                {validatorsData.map((validator) => {
                  const isActive = validator.id === validatorId;
                  return (
                    <div
                      key={validator.id}
                      onClick={() => setValidatorId(validator.id)}
                      className={cn(
                        "flex justify-center items-center gap-2 border border-gray-200 rounded-lg p-2 cursor-pointer",
                        isActive && "bg-gray-100 border-gray-900"
                      )}
                    >
                      <Image
                        src={validator.icon}
                        alt={validator.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-contain"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mb-2">
              <Select
                label={
                  <Text className="text-lg font-semibold text-gray-900">
                    Agent:
                  </Text>
                }
                options={agentOptions}
                value={selectedAgentOption}
                onChange={(option: SelectOption) =>
                  setAgentId(option.value.toString())
                }
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
