"use client";

import { Suspense, useEffect } from "react";
import AgentsSidebar from "./agents-sidebar";
import { AgentSidebarPlaceholder } from "@/components/placeholders/agent-placeholders";
import { useDrawer } from "@/app/shared/drawer-views/use-drawer";
import { BsChevronCompactLeft } from "react-icons/bs";
import { ActionIcon } from "rizzui";
import { useMedia } from "@core/hooks/use-media";

export default function AgentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { openDrawer } = useDrawer();
  const isDesktop = useMedia("(min-width: 1024px)", false);

  useEffect(() => {
    if (!isDesktop) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isDesktop]);

  return (
    <div className="lg:h-[calc(100vh-90px)] lg:overflow-hidden">
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

      <div className="ml-0 lg:ml-[300px] lg:h-full lg:overflow-y-auto">{children}</div>
    </div>
  );
}
