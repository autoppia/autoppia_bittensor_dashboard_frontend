"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { WebsiteDataType } from "@/data/websites-data";
import { PiEyeDuotone, PiClockDuotone } from "react-icons/pi";
import cn from "@core/utils/class-names";

export default function WebsiteItem({ website }: { website: WebsiteDataType }) {
  const isComingSoon = website.isComingSoon;

  return (
    <WidgetCard
      title={
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-lg sm:text-xl md:text-2xl font-bold text-center",
              isComingSoon && "text-gray-500"
            )}
          >
            {website.name}
          </span>
        </div>
      }
      className={cn(
        "!p-3 sm:p-4 md:p-5 w-full transition-all duration-300 hover:shadow-lg",
        isComingSoon && "opacity-70 grayscale"
      )}
    >
      <div className="relative">
        <Image
          src={website.image}
          alt={website.name}
          className={cn(
            "rounded-lg mt-3 sm:mt-4 w-full h-auto object-cover transition-all duration-300",
            isComingSoon && "grayscale"
          )}
          width={500}
          height={100}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {isComingSoon && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
              Coming Soon
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4 flex justify-center">
        {isComingSoon ? (
          <Button
            size="sm"
            rounded="pill"
            variant="outline"
            disabled
            className="ms-1 sm:ms-2 text-xs sm:text-sm w-[150px] sm:w-auto border-gray-300 text-gray-400 cursor-not-allowed"
          >
            <PiClockDuotone className="me-1 sm:me-1.5 h-4 sm:h-[17px] w-4 sm:w-[17px]" />
            Coming Soon
          </Button>
        ) : (
          <Link href={website.href} target="_blank">
            <Button
              size="sm"
              rounded="pill"
              className="ms-1 sm:ms-2 text-xs sm:text-sm w-[150px] sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-md group"
            >
              <PiEyeDuotone className="me-1 sm:me-1.5 h-4 sm:h-[17px] w-4 sm:w-[17px] transition-transform duration-300 group-hover:scale-110" />
              Explore
            </Button>
          </Link>
        )}
      </div>
    </WidgetCard>
  );
}
