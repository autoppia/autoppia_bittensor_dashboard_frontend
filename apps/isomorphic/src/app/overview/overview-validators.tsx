"use client";

import Image from "next/image";
import Link from "next/link";
import WidgetCard from "@core/components/cards/widget-card";
import PageHeader from "@/app/shared/page-header";
import { validatorsData } from "@/data/validators-data";
import {
  PiOpenAiLogoDuotone,
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiArrowClockwiseDuotone,
  PiHashDuotone,
} from "react-icons/pi";
import BannerText from "../shared/banner-text";
import { Text } from "rizzui";
import { primaryColors } from "@/data/colors-data";

export default function OverviewValidators() {
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
            href={`/rounds/current/${validator.id}`}
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
                  <Text className="font-semibold text-gray-900">
                    {validator.name}
                  </Text>
                </div>
              }
              className="hover:border-gray-900"
              headerClassName="w-full"
              action={
                <div className="flex items-center border border-primary-green px-2 py-1 rounded-full text-primary-green">
                  <span className="animate-spin text-sm">
                    <PiArrowClockwiseDuotone />
                  </span>
                  <span className="ms-1 text-[0.75rem]">Running</span>
                </div>
              }
            >
              <div className="pt-4">
                <div className="mb-2">
                  <div className="flex items-center text-primary-green">
                    <PiOpenAiLogoDuotone />
                    <span className="ms-1">Current Task:</span>
                  </div>
                  <div className="mt-2 overflow-hidden whitespace-nowrap bg-gray-100 p-2 rounded-md">
                    <p
                      className="inline-block animate-marquee transition-text-[1rem] text-white"
                      style={{
                        animationDuration: `${5 + validator.currentTask.length * 0.2}s`,
                      }}
                    >
                      {validator.currentTask}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-primary-yellow">
                  <PiCurrencyDollarDuotone />
                  <span className="ms-1">
                    Stake Weight: {validator.weight.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-primary-orange">
                  <PiClockDuotone />
                  <span className="ms-1">Trust: {validator.trust}</span>
                </div>
                <div className="flex items-center text-primary-blue">
                  <PiHashDuotone />
                  <span className="ms-1">Version: {validator.version}</span>
                </div>
              </div>
            </WidgetCard>
          </Link>
        ))}
      </div>
    </>
  );
}
