"use client";

import { useModal } from "@/app/shared/modal-views/use-modal";
import { ActionIcon, Button } from "rizzui";
import { Title, Text } from "rizzui/typography";
import { PiXBold } from "react-icons/pi";

export default function OverviewAnnouncementModal() {
  const { closeModal } = useModal();

  return (
    <div className="m-auto w-full max-w-[520px] rounded-2xl border border-white bg-white px-6 py-6 text-black shadow-2xl sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Title as="h3" className="text-lg font-semibold !text-black">
            Quick heads-up
          </Title>
          <Text className="mt-2 text-sm leading-relaxed !text-gray-600">
            This dashboard currently displays{" "}
            <span className="rounded-md bg-yellow-100 px-2 py-1 font-semibold text-yellow-700">
              mock data
            </span>{" "}
            while we get ready for the Dynamic Zero (IM) launch. Mock data will
            stay in place through <strong>23 October</strong> while we migrate
            IM and make sure everything is stable.
          </Text>
          <div className="mt-5 rounded-xl border border-gray-900 bg-black px-4 py-3">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-300">
              Launch date
            </Text>
            <Title as="p" className="mt-1 text-4xl font-black !text-white">
              21 October
            </Title>
          </div>
        </div>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-400 transition hover:text-gray-700"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => closeModal()}
          className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
        >
          Got it
        </Button>
        <a
          href="https://autoppia.com/dynamic-zero"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-black transition hover:border-gray-400 hover:bg-gray-100"
          >
            Learn more
          </Button>
        </a>
      </div>
    </div>
  );
}
