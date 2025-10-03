"use client";

import Image from "next/image";
import Link from "next/link";
import WidgetCard from "@core/components/cards/widget-card";
import PageHeader from "@/app/shared/page-header";
import cn from "@core/utils/class-names";
import { validatorsData } from "@/data/validators-data";
import {
  PiOpenAiLogoDuotone,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiArrowClockwiseDuotone,
  PiHashDuotone,
  PiListChecksDuotone,
} from "react-icons/pi";
import BannerText from "@/app/shared/banner-text";
import { Text } from "rizzui";
import { primaryColors } from "@/data/colors-data";
import { roundsData } from "@/data/rounds-data";
import MarqueeText from "@/app/shared/marquee-text";
import CircleProgressBar from "@core/components/charts/circle-progressbar";

export default function OverviewValidators() {
  const currentRound = roundsData.find((round) => round.current);

  return (
    <>
      <PageHeader title={"Live Event Update"} className="mt-6">
        <BannerText
          color={primaryColors.green}
          text="Live Update"
          className="animate-pulse"
        />
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {validatorsData.map((validator) => (
          <Link
            key={`validator-${validator.id}`}
            href={`/rounds/${currentRound?.id}/${validator.id}`}
          >
            <WidgetCard
              title={
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="relative aspect-square w-12">
                    <Image
                      src={validator.icon}
                      alt={validator.name}
                      fill
                      sizes="(max-width: 768px) 100vw"
                      className="h-full w-full rounded-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Text className="font-semibold text-gray-900">
                        {validator.name}
                      </Text>
                      <div
                        className={cn(
                          "flex items-center px-1 h-5 rounded-full",
                          validator.status === "Sending Tasks"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : validator.status === "Evaluating"
                              ? "bg-orange-500/20 text-orange-500"
                              : validator.status === "Waiting"
                                ? "bg-blue-500/20 text-blue-500"
                                : "bg-yellow-500/20 text-yellow-500"
                        )}
                      >
                        <span className="animate-spin text-sm">
                          <PiArrowClockwiseDuotone />
                        </span>
                        <span className="ms-1 text-[0.75rem]">
                          {validator.status}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-medium text-gray-600 text-sm">
                      {validator.hotkey.slice(0, 6)}...
                      {validator.hotkey.slice(-6)}
                    </span>
                  </div>
                </div>
              }
              className="hover:border-gray-700 p-5 lg:p-5"
              headerClassName="w-full"
              action={
                <CircleProgressBar
                  percentage={50}
                  size={48}
                  strokeWidth={4}
                  stroke="#1f1f1f"
                  progressColor="#10b981"
                  label={
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-700">
                        50%
                      </div>
                    </div>
                  }
                />
              }
            >
              <div className="pt-4">
                <div className="mb-2">
                  <div className="flex items-center text-emerald-500">
                    <PiOpenAiLogoDuotone />
                    <span className="ms-1">Current Task:</span>
                  </div>
                  <MarqueeText
                    text={validator.currentTask}
                    className="text-gray-900"
                    containerClassName="mt-2 bg-gray-100 p-2 rounded-md"
                    speed={60}
                    pauseDuration={0.5}
                  />
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
