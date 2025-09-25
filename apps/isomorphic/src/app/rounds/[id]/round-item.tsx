"use client";

import { useParams } from "next/navigation";
import { RoundType } from "@/data/rounds-data";
import { IconType } from "react-icons/lib";
import cn from "@core/utils/class-names";
import { PiCubeDuotone } from "react-icons/pi";
import TrophyIcon from "@core/components/icons/trophy";

interface RoundItemProps {
  round: RoundType;
  icon: IconType;
}

export default function RoundItem({ round, icon }: RoundItemProps) {
  const { id } = useParams();
  const Icon = icon;
  const isActive = (id === "current" && round.current) || round.id === parseInt(id as string);

  return (
    <div
      className={cn(
        "w-full min-w-[290px] rounded-lg border border-gray-300 hover:border-primary-green px-6 py-7 @container bg-gray-50",
        isActive && "bg-primary-green border-primary-green"
      )}
    >
      <div className="mb-4 flex items-center gap-5">
        <span
          className={cn(
            "flex rounded-md p-2.5 bg-primary-green text-white",
            isActive && "bg-white text-primary-green"
          )}
        >
          <Icon className="h-auto w-[30px]" />
        </span>
        <div className="space-y-1.5">
          <p
            className={cn(
              "text-lg font-bold text-gray-700 2xl:text-[20px] 3xl:text-3xl",
              isActive && "text-white"
            )}
          >
            Round {round.id}
          </p>
          <p
            className={cn(
              "flex items-center space-x-0.5 font-medium text-gray-500",
              isActive && "text-white"
            )}
          >
            <PiCubeDuotone />
            <span>{round.startBlock}</span>
            <span className="mx-1">-</span>
            <PiCubeDuotone />
            <span>{round.endBlock}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <span
          className={cn(
            "mr-2 px-2 py-1 rounded-full bg-primary-green/70 text-white",
            isActive && "bg-white text-primary-green/70"
          )}
        >
          <TrophyIcon className="w-4 h-4" />
        </span>
        <span className={cn("text-gray-700", isActive && "text-white")}>
          Winner UID: 234
        </span>
      </div>
    </div>
  );
}
