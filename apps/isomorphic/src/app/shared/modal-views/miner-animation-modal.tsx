"use client";

import { useModal } from "@/app/shared/modal-views/use-modal";
import { MinerAnimationExperience } from "@/app/animation/experience";
import { ActionIcon } from "rizzui";
import { PiXBold } from "react-icons/pi";

export default function MinerAnimationModal({
  initialSeason,
}: Readonly<{ initialSeason?: number }>) {
  const { closeModal } = useModal();
  const modalTitle = initialSeason
    ? `Season ${initialSeason} Replay`
    : "Season Replay";

  return (
    <div className="m-auto rounded-2xl border border-white bg-white px-5 pb-6 pt-5 text-black shadow-2xl sm:px-8 sm:pt-7">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold !text-black">{modalTitle}</h3>
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
        <MinerAnimationExperience condensed initialSeason={initialSeason} showTable={false} />
      </div>
    </div>
  );
}
