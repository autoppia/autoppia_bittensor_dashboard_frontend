"use client";

import PageHeader from "@/app/shared/page-header";
import Image from "next/image";
import { Button, Text, Badge, Collapse } from "rizzui";
import cn from "@core/utils/class-names";
import { PiCaretDownBold } from "react-icons/pi";
import {
  PiCurrencyDollarDuotone,
  PiClockDuotone,
  PiHashDuotone,
} from "react-icons/pi";
import { validatorsData } from "@/data/validators-data";

export default function RoundValidators() {
  return (
    <div>
      <PageHeader title="Validators" className="mt-6" />
      <div className="grid grid-cols-3 items-start gap-6">
        {validatorsData.map((validator) => (
          <div
            key={`validator-${validator.id}`}
            className="rounded-lg border border-muted bg-gray-50 hover:border-gray-900"
          >
            <Collapse
              header={({ open, toggle }) => (
                <div
                  onClick={toggle}
                  className="flex cursor-pointer items-center justify-between gap-4 p-3 md:p-5"
                >
                  <div className="flex gap-2 sm:items-center md:gap-4">
                    <div className="relative aspect-square w-12">
                      <Image
                        src={validator.icon}
                        alt={validator.name}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="h-full w-full rounded-full object-contain"
                      />
                    </div>
                    <div className="sm:flex sm:flex-col">
                      <Text className="font-semibold text-gray-900">
                        {validator.name}
                      </Text>
                      <Text className="w-56 truncate text-gray-500">
                        {validator.hotkey}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      rounded="md"
                      variant="flat"
                      className="bg-primary-green rounded-full px-3.5 py-1"
                    >
                      {validator.status}
                    </Badge>
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500",
                        open && "bg-gray-900 text-gray-0"
                      )}
                    >
                      <PiCaretDownBold
                        strokeWidth={3}
                        className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          open && "rotate-180 rtl:-rotate-180"
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            >
              <div className="flex flex-col gap-4 bg-gray-100 px-5 py-3 text-gray-900">
                <div className="flex items-center">
                  <PiCurrencyDollarDuotone />
                  <span className="ms-1">
                    Stake Weight: {validator.weight.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <PiClockDuotone />
                  <span className="ms-1">Updated: {validator.updated}</span>
                </div>
                <div className="flex items-center">
                  <PiHashDuotone />
                  <span className="ms-1">Version: {validator.version}</span>
                </div>
              </div>
            </Collapse>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-dashed border-muted">
              <div className="text-gray-500">
                <Text as="span" className="text-md font-semibold text-gray-700">
                  Total Tasks: {validator.total_tasks}
                </Text>
              </div>
              <div className="grid w-full grid-cols-2 items-center gap-4 sm:flex sm:w-auto ">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-md text-xs font-medium"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
