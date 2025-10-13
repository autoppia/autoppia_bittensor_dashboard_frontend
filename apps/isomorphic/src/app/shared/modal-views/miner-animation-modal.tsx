"use client";

import { useModal } from "@/app/shared/modal-views/use-modal";
import { MinerAnimationExperience } from "@/app/animation/experience";
import { ActionIcon } from "rizzui";
import { Title, Text } from "rizzui/typography";
import { PiXBold } from "react-icons/pi";

export default function MinerAnimationModal() {
  const { closeModal } = useModal();

  return (
    <div className="m-auto rounded-2xl border border-white bg-white px-5 pb-6 pt-5 text-black shadow-2xl sm:px-8 sm:pt-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[540px]">
          <Title as="h3" className="text-lg font-semibold !text-black">
            Subnet Timeline Replay
          </Title>
          <Text className="mt-1 text-sm !text-black">
            Navigate the past 90 rounds of miner percentage scores without leaving your dashboard.
          </Text>
        </div>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-500 transition hover:text-gray-900"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>
      <div className="max-h-[80vh] overflow-y-auto pr-1">
        <MinerAnimationExperience condensed />
      </div>
    </div>
  );
}
