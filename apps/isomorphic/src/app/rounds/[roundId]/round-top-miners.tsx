"use client";

import Image from "next/image";
import WidgetCard from "@core/components/cards/widget-card";
import { Text } from "rizzui/typography";
import { PiCrownFill } from "react-icons/pi";

const topMinersList = [
  {
    uid: 25,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.95,
  },
  {
    uid: 84,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.92,
  },
  {
    uid: 36,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.9,
  },
  {
    uid: 120,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.88,
  },
  {
    uid: 150,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.85,
  },
  {
    uid: 100,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.82,
  },
];

export default function RoundTopMiners() {
  return (
    <WidgetCard
      title="Top 10 Miners"
      className="w-[360px] h-[455px] px-2 lg:px-4"
      headerClassName="px-3 pb-2"
    >
      <div className="custom-scrollbar h-[370px] overflow-y-auto">
        <div className="mt-1 flex flex-col lg:mt-3">
          {topMinersList.map((miner, index) => (
            <div
              key={`top-miner-${index}`}
              className="flex items-center rounded-lg hover:bg-gray-100 p-2 "
            >
              <div className="relative me-3 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 @sm:h-12 @sm:w-12">
                <Image
                  src={`/miners/${miner.uid % 50}.svg`}
                  alt={miner.uid.toString()}
                  fill
                  sizes="(max-width: 768px) 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <div>
                  <div className="flex items-center">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-gray-700 2xl:text-base">
                      Miner {miner.uid}
                    </Text>
                    <div className="ms-2 text-xl">
                      {index === 0 && (
                        <PiCrownFill className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <Text className="w-40 truncate text-gray-500">
                    {miner.hotkey}
                  </Text>
                </div>
                <div>
                  <Text className="text-primary-green">
                    {miner.avg_score.toFixed(2)}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
