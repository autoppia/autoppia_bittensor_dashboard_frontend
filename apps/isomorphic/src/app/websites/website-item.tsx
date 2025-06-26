"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Text } from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
import { WebsiteDataType } from "@/data/websites-data";
import { PiEyeDuotone } from "react-icons/pi";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { useMedia } from "@core/hooks/use-media";
import cn from "@core/utils/class-names";

export default function WebsiteItem({ website }: { website: WebsiteDataType }) {
  const { openModal } = useModal();
  const isLargeScreen = useMedia("(min-width: 1024px)", false);

  return (
    <WidgetCard
      title={
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-center sm:text-left">
            {website.name}
          </span>
          {!isLargeScreen && (
            <Text
              as="h6"
              className="text-[11px] sm:text-[13px] font-semibold text-gray-600 mt-1 sm:mt-2 text-center sm:text-left"
            >
              Similar to {website.origin}
            </Text>
          )}
        </div>
      }
      action={
        isLargeScreen ? (
          <span className="text-sm sm:text-md font-semibold text-gray-600">{`Similar to ${website.origin}`}</span>
        ) : undefined
      }
      className={cn("!p-3 sm:p-4 md:p-5 w-full")}
    >
      <Image
        src={website.image}
        alt={website.name}
        className="rounded-lg mt-3 sm:mt-4 w-full h-auto object-cover"
        width={500}
        height={100}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="mt-3 sm:mt-4 flex justify-center sm:justify-start">
        <Link href={website.href} target="_blank">
          <Button
            size="sm"
            rounded="pill"
            className="ms-1 sm:ms-2 text-xs sm:text-sm w-[150px] sm:w-auto"
          >
            <PiEyeDuotone className="me-1 sm:me-1.5 h-4 sm:h-[17px] w-4 sm:w-[17px]" />
            Explore
          </Button>
        </Link>
      </div>
    </WidgetCard>
  );
}
