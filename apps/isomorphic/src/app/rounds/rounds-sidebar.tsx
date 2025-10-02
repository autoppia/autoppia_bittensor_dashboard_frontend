"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import { LuCodesandbox, LuBox } from "react-icons/lu";
import { roundsData } from "@/data/rounds-data";

export default function RoundsSidebar() {
  const { id } = useParams();
  
  return (
    <aside className="hidden lg:block fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[320px] p-5">
      <div className="h-full border rounded-xl bg-gray-50 pb-4">
        <Text className="sticky top-0 px-6 py-4 text-2xl font-bold text-gray-900 border-b">
          Recent Rounds
        </Text>
        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto px-4 mt-4 scroll-smooth">
          <div className="flex flex-col gap-1">
            {roundsData
              .slice(-10)
              .reverse()
              .map((round) => {
                const isActive = round.id === parseInt(id as string);

                return (
                  <Link
                    key={`round-menu-${round.id}`}
                    href={`/rounds/${round.id}`}
                  >
                    <div
                      className={cn(
                        "flex items-center w-full px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100",
                        isActive &&
                          "bg-gradient-primary text-white hover:bg-gradient-primary"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-md bg-primary-orange text-white",
                          isActive && "text-primary-orange bg-white"
                        )}
                      >
                        <LuCodesandbox className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col ms-3">
                        <span className="text-base font-medium">
                          Round {round.id}
                        </span>
                        <span className="flex items-center space-x-0.5 text-xs">
                          <LuBox />
                          <span>{round.startBlock}</span>
                          <span>-</span>
                          <LuBox />
                          <span>{round.endBlock}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </aside>
  );
}
