"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import cn from "@core/utils/class-names";
import HamburgerButton from "@/layouts/hamburger-button";
import Sidebar from "@/layouts/hydrogen/sidebar";
import StickyHeader from "@/layouts/sticky-header";
import { LuActivity, LuMinus } from "react-icons/lu";
import { menuItems } from "@/layouts/hydrogen/menu-items";
import { FaGithub, FaXTwitter, FaDiscord } from "react-icons/fa6";
import { PiGlobeDuotone, PiBookOpenDuotone } from "react-icons/pi";
import { Tooltip } from "rizzui";
import { useNetworkStatus } from "@/services/hooks/useOverview";

export default function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/landing";
  const { data: networkStatus, loading: statusLoading } = useNetworkStatus();
  const normalizedStatus = (() => {
    if (statusLoading) return "loading";
    const rawStatus = networkStatus?.status;
    if (typeof rawStatus === "string") {
      const lowered = rawStatus.toLowerCase();
      if (
        lowered === "healthy" ||
        lowered === "live" ||
        lowered === "ok" ||
        lowered === "online" ||
        lowered === "operational" ||
        lowered === "up" ||
        lowered === "running"
      ) {
        return "healthy";
      }
      if (
        lowered === "degraded" ||
        lowered === "warn" ||
        lowered === "warning" ||
        lowered === "partial"
      ) {
        return "degraded";
      }
      if (lowered === "down" || lowered === "offline" || lowered === "outage") {
        return "down";
      }
    }
    return "healthy";
  })();

  const displayStatusText =
    normalizedStatus === "loading"
      ? "Load"
      : normalizedStatus === "healthy"
        ? "Live"
        : normalizedStatus === "degraded"
          ? "Warn"
          : "Down";

  const statusLabel = `● ${displayStatusText.toUpperCase()}`;

  if (isLanding) {
    return null;
  }

  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10 max-w-full overflow-hidden">
      <div className="flex w-full items-center justify-between min-w-0 max-w-full">
        <div className="flex items-center min-w-0 flex-1 max-w-[75%]">
          <Link
            href={"/"}
            aria-label="Site Logo"
            className="w-[120px] sm:w-[155px] me-2 sm:me-3 xl:me-5 flex-shrink-0"
          >
            <Image
              src="/logo.webp"
              alt="Logo"
              width={155}
              height={36}
              style={{ width: "auto", maxWidth: "100%" }}
            />
          </Link>
          <div className="hidden xl:flex items-center min-w-0 max-w-full">
            {menuItems.map((item, index) => {
              const href = item?.href as string;
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));

              return (
                <Fragment key={item.name + "-" + index}>
                  {/* Add separator between sections */}
                  {needsSeparator && (
                    <div className="flex items-center mx-3 flex-shrink-0">
                      <div className="w-[2px] h-7 bg-gradient-to-b from-transparent via-gray-400 to-transparent mx-2"></div>
                      <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-lg border-2 border-yellow-500/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <span className="text-sm font-extrabold text-yellow-600 tracking-widest whitespace-nowrap uppercase">
                          Subnet 36
                        </span>
                      </div>
                    </div>
                  )}

                  {item?.href ? (
                    <Link
                      href={item?.href}
                      className="mx-0.5 my-2 flex-shrink-0"
                    >
                      <div
                        className={cn(
                          "px-2 xl:px-3 py-2.5 rounded-lg transition-all duration-300 ease-out font-medium flex items-center gap-1 xl:gap-2 text-xs xl:text-sm whitespace-nowrap",
                          isActive
                            ? "bg-white text-black"
                            : "text-gray-700 hover:text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {item.icon && (
                          <span className="text-sm xl:text-base">
                            {item.icon}
                          </span>
                        )}
                        <span className="hidden 2xl:inline">{item.name}</span>
                      </div>
                    </Link>
                  ) : (
                    <></>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 max-w-[25%] min-w-0">
          {/* Social Media Buttons */}
          <div className="hidden sm:flex items-center gap-0.5 min-w-0 overflow-hidden">
            <Tooltip content="Visit Autoppia Website" placement="bottom">
              <a
                href="https://autoppia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:bg-blue-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                aria-label="Visit Autoppia Website"
              >
                <PiGlobeDuotone className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </Tooltip>
            <Tooltip content="View Documentation" placement="bottom">
              <a
                href="https://documentation.autoppia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:bg-purple-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                aria-label="View Documentation"
              >
                <PiBookOpenDuotone className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </Tooltip>
            <Tooltip content="Explore our GitHub" placement="bottom">
              <a
                href="https://github.com/autoppia"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                aria-label="Explore our GitHub"
              >
                <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </Tooltip>
            <Tooltip content="Follow us on X (Twitter)" placement="bottom">
              <a
                href="https://x.com/AutoppiaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                aria-label="Follow us on X (Twitter)"
              >
                <FaXTwitter className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </Tooltip>
            <Tooltip content="Join our Discord" placement="bottom">
              <a
                href="https://discord.com/channels/799672011265015819/1339356060787408996"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:bg-indigo-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                aria-label="Join our Discord"
              >
                <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </Tooltip>
            <Tooltip
              content={
                normalizedStatus === "healthy"
                  ? `Network Status: ${displayStatusText}`
                  : normalizedStatus === "loading"
                    ? "Network Status: Loading…"
                    : networkStatus?.message
                      ? networkStatus.message
                      : `Network Status: ${displayStatusText}`
              }
              placement="bottom"
            >
              <div className="relative ms-2 sm:ms-3 flex items-center group overflow-hidden max-w-[96px] sm:max-w-[120px] flex-shrink-0">
                {/* Dynamic glowing background based on status */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300",
                    normalizedStatus === "healthy"
                      ? "bg-green-500"
                      : normalizedStatus === "degraded"
                        ? "bg-yellow-500"
                        : normalizedStatus === "loading"
                          ? "bg-blue-500"
                          : "bg-red-500"
                  )}
                ></div>

                {/* Main container */}
                <div
                  className={cn(
                    "relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/90 rounded-lg transition-all duration-300 whitespace-nowrap overflow-hidden max-w-full",
                    normalizedStatus === "healthy"
                      ? "border border-green-500 hover:border-green-400"
                      : normalizedStatus === "degraded"
                        ? "border border-yellow-500 hover:border-yellow-400"
                        : normalizedStatus === "loading"
                          ? "border border-blue-500 hover:border-blue-400"
                          : "border border-red-500 hover:border-red-400"
                  )}
                >
                  {/* Dynamic icon and animation based on status */}
                  <div className="relative">
                    {normalizedStatus === "down" ? (
                      <LuMinus
                        className={cn("w-4 h-4 sm:w-5 sm:h-5", "text-red-500")}
                      />
                    ) : (
                      <LuActivity
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 animate-pulse",
                          normalizedStatus === "healthy"
                            ? "text-green-500"
                            : normalizedStatus === "degraded"
                              ? "text-yellow-500"
                              : normalizedStatus === "loading"
                                ? "text-blue-400"
                                : "text-red-500"
                        )}
                      />
                    )}
                    {normalizedStatus === "healthy" && (
                      <div className="absolute -inset-1.5 border border-green-500 rounded-full animate-ping opacity-50"></div>
                    )}
                  </div>

                  {/* Dynamic status text */}
                  <span
                    className={cn(
                      "text-[11px] sm:text-sm font-mono font-bold tracking-widest",
                      normalizedStatus === "healthy"
                        ? "text-green-400"
                        : normalizedStatus === "degraded"
                          ? "text-yellow-400"
                          : normalizedStatus === "loading"
                            ? "text-blue-300"
                            : "text-red-400"
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            </Tooltip>
          </div>

          <Tooltip content="Open Menu" placement="bottom">
            <HamburgerButton
              className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
              view={<Sidebar className="static w-full 2xl:w-full" />}
            />
          </Tooltip>
        </div>
      </div>
    </StickyHeader>
  );
}
