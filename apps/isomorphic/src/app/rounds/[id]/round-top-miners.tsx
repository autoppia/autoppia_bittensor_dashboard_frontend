"use client";

import Image from "next/image";
import Link from "next/link";
import WidgetCard from "@core/components/cards/widget-card";
import cn from "@core/utils/class-names";
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
  {
    uid: 180,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.82,
  },
  {
    uid: 190,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.82,
  },
  {
    uid: 200,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.82,
  },
  {
    uid: 210,
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    avg_score: 0.82,
  },
];

export default function RoundTopMiners({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Top 10 Miners"
      className={cn("h-[455px] px-2 lg:px-4", className)}
      headerClassName="px-3 pb-2"
    >
      <div className="custom-scrollbar h-[370px] overflow-y-auto mt-3">
        <div className="flex flex-col">
          {topMinersList.map((miner, index) => (
            <Link key={`top-miner-${index}`} href={`/agents/${miner.uid}`}>
              <div
                className={cn(
                  "flex items-center rounded-lg hover:bg-gray-100 p-2 ",
                  index === 0 &&
                    "mb-1 border-2 border-yellow-500 bg-gray-100 sticky top-0 z-10"
                )}
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
                      <Text
                        className={cn(
                          "text-sm font-semibold text-gray-900 2xl:text-base",
                          index === 0 && "text-yellow-500"
                        )}
                      >
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
                    <Text className="text-emerald-500">
                      {miner.avg_score.toFixed(2)}
                    </Text>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
