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

export default function OverviewValidators() {
  return (
    <>
      <PageHeader title={"Live Event Update"} className="mt-6">
        <BannerText
          color="primary-green"
          text="Live Update"
          className="animate-pulse"
        />
      </PageHeader>
      <div className="grid grid-cols-3 gap-6">
        {validatorsData.map((val) => (
          <Link key={`validator-${val.id}`} href={`/runs/current`}>
            <WidgetCard
              title={
                <div className="flex items-center text-white">
                  <Image
                    src={val.icon}
                    className="rounded-full"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  <span className="ms-2">{val.name}</span>
                </div>
              }
              className="hover:border-gray-900"
              description={<div className="w-60 truncate">{val.hotkey}</div>}
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
                  <p className="mt-2 text-[1rem] text-white text-wrap">
                    Login with email johndoe@gmail.com and password PASSWORD
                  </p>
                </div>
                <div className="flex items-center text-yellow-500">
                  <PiCurrencyDollarDuotone />
                  <span className="ms-1">
                    Stake Weight: {val.weight.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-orange-500">
                  <PiClockDuotone />
                  <span className="ms-1">Updated: {val.updated}</span>
                </div>
                <div className="flex items-center text-blue-500">
                  <PiHashDuotone />
                  <span className="ms-1">Version: {val.version}</span>
                </div>
              </div>
            </WidgetCard>
          </Link>
        ))}
      </div>
    </>
  );
}
