"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/app/shared/page-header";
import Image from "next/image";
import { Button, Text } from "rizzui";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
  PiArrowClockwiseDuotone,
} from "react-icons/pi";
import { validatorsData } from "@/data/validators-data";

export default function RoundValidators() {
  const { roundId } = useParams();

  return (
    <div>
      <PageHeader title="Validators" className="mt-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start gap-6">
        {validatorsData.map((validator) => (
          <div
            key={`validator-${validator.id}`}
            className="rounded-lg border border-muted bg-gray-50 hover:border-gray-900"
          >
            <div className="flex cursor-pointer items-center justify-between gap-4 p-3 md:p-5">
              <div className="flex gap-2 items-center md:gap-4">
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
              <div className="flex items-center px-2 py-1 rounded-full text-gray-900 bg-primary-green">
                <span className="animate-spin text-sm">
                  <PiArrowClockwiseDuotone />
                </span>
                <span className="ms-1 text-[0.75rem]">Running</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-gray-100 px-5 py-3 text-gray-900">
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

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-dashed border-muted">
              <Text as="span" className="text-md font-semibold text-gray-700">
                Total Tasks: {validator.total_tasks}
              </Text>
              <Link href={`/rounds/${roundId}/${validator.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-md text-xs font-medium"
                >
                  View Round
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
