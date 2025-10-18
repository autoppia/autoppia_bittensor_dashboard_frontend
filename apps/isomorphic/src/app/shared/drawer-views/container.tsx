"use client";

import { Drawer } from "rizzui";
import { useEffect } from "react";
import cn from "@core/utils/class-names";
import { usePathname } from "next/navigation";
import { useDrawer } from "@/app/shared/drawer-views/use-drawer";

export default function GlobalDrawer() {
  const { isOpen, view, placement, closeDrawer, containerClassName } =
    useDrawer();
  const pathname = usePathname();

  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Adjust width based on screen size
  const getDrawerWidth = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 1024) {
        // Below lg breakpoint (1024px)
        return "w-[70vw] max-w-[300px]";
      }
      return "w-[270px] 2xl:w-72";
    }
    return "w-[270px]"; // Default for SSR
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      placement={placement}
      overlayClassName="bg-[#020617]/80 backdrop-blur-sm"
      containerClassName={cn(
        "!bg-transparent !shadow-none min-w-0",
        getDrawerWidth(),
        containerClassName
      )}
      className="z-[9999] h-screen"
    >
      {view}
    </Drawer>
  );
}
