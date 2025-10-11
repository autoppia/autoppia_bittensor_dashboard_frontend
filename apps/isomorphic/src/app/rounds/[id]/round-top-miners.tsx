"use client";

import Image from "next/image";
import Link from "next/link";
import WidgetCard from "@core/components/cards/widget-card";
import cn from "@core/utils/class-names";
import { Text } from "rizzui/typography";
import { PiCrownFill } from "react-icons/pi";
import Eye from "@core/components/icons/eye";

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
      className={cn(
        "h-[460px] px-2 lg:px-4 w-full rounded-xl",
        className
      )}
      headerClassName="px-3 pb-2"
    >
      <div className="custom-scrollbar h-[370px] overflow-y-auto mt-3">
        <div className="flex flex-col">
          {topMinersList.map((miner, index) => (
            <Link key={`top-miner-${index}`} href={`/agents/${miner.uid}`} title="Inspect Agent Run">
              <div
                className={cn(
                  "relative flex items-center w-full px-4 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-md cursor-pointer group border border-transparent hover:border-gray-200",
                  index === 0 &&
                    "bg-yellow-500/10 border border-yellow-400/70 text-gray-900 hover:border-yellow-400 hover:bg-yellow-500/20"
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
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Text
                        className={cn(
                          "text-lg font-semibold text-gray-900",
                          index === 0 && "text-yellow-500"
                        )}
                      >
                        Miner {miner.uid}
                      </Text>
                      <div className="relative ms-2 text-xl">
                        {index === 0 && (
                          <>
                            <PiCrownFill className="animate-ping opacity-50 text-yellow-500" />
                            <PiCrownFill className="absolute top-0 left-0 text-yellow-500" />
                          </>
                        )}
                      </div>
                    </div>
                    <Text className="text-gray-500 group-hover:text-gray-600">
                      {miner.hotkey.slice(0, 6)}...{miner.hotkey.slice(-6)}
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Text className="text-sm text-gray-500 font-medium">
                        Score:
                      </Text>
                      <div
                        className={cn(
                          "text-lg font-semibold",
                          index === 0 ? "text-yellow-500" : "text-emerald-500"
                        )}
                      >
                        {miner.avg_score.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
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
