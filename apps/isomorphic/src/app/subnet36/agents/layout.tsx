"use client";

import { Suspense } from "react";
import AgentsSidebar from "./agents-sidebar";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import { useDrawer } from "@/app/shared/drawer-views/use-drawer";
import { BsChevronCompactLeft } from "react-icons/bs";
import { ActionIcon } from "rizzui";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openDrawer } = useDrawer();

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <Suspense fallback={<AgentSidebarPlaceholder />}>
        <AgentsSidebar className="hidden lg:block" />
      </Suspense>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-1/2 -translate-y-1/2 -right-3 z-[60]">
        <ActionIcon
          aria-label="Open Agents Menu"
          variant="text"
          className="flex items-center justify-center w-10 h-10 text-white hover:text-white/80 transition-all duration-300"
          onClick={() =>
            openDrawer({
              view: (
                <Suspense fallback={<AgentSidebarPlaceholder />}>
                  <AgentsSidebar className="static w-full h-full" />
                </Suspense>
              ),
              placement: "left",
            })
          }
        >
          <BsChevronCompactLeft
            className="h-16"
            style={{ strokeWidth: 1, width: "auto" }}
          />
        </ActionIcon>
      </div>

      <div className="ml-0 lg:ml-[300px]">{children}</div>
    </>
  );
}
