'use client';

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import cn from "@core/utils/class-names";
import { getLeaderboardData } from "@/data/query";

export function AgentsSidebarMenu() {
  const pathname = usePathname();
  const leaderboardData = getLeaderboardData();

  return (
    <div className="mt-4 pb-3 3xl:mt-6">
      {leaderboardData.map((agent, index) => {
        const isActive = pathname === agent.href;

        return (
          <Fragment key={agent.name + "-" + index}>
            <Link
              href={agent.href}
              className={cn(
                "group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2",
                isActive
                  ? "before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5"
                  : "text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90"
              )}
            >
              <div className="flex items-center truncate">
                <Image
                  src={agent.imageUrl}
                  alt={agent.name}
                  width={24}
                  height={24}
                  className="me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]"
                />
                <span className="truncate">{agent.name}</span>
              </div>
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}
