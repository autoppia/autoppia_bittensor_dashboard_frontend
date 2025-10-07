"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import cn from "@core/utils/class-names";
import HamburgerButton from "@/layouts/hamburger-button";
import Sidebar from "@/layouts/hydrogen/sidebar";
import StickyHeader from "@/layouts/sticky-header";
import { LuActivity, LuPackageCheck } from "react-icons/lu";
import { menuItems } from "@/layouts/hydrogen/menu-items";
import { FaGithub, FaXTwitter, FaDiscord } from "react-icons/fa6";

export default function Header() {
  const pathname = usePathname();
  const testActive = pathname.startsWith("/test-agent");
  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <Link
            href={"/"}
            aria-label="Site Logo"
            className="w-[155px] me-3 xl:me-5"
          >
            <Image
              src="/logo.webp"
              alt="Logo"
              width={155}
              height={36}
              style={{ width: "auto" }}
            />
          </Link>
          {menuItems.map((item, index) => {
            const href = item?.href as string;
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Fragment key={item.name + "-" + index}>
                {item?.href ? (
                  <Link href={item?.href} className="hidden xl:block mx-2 my-2">
                    <div
                      className={cn(
                        "group relative border rounded-lg px-4 py-2 transition-all duration-300 overflow-hidden",
                        isActive
                          ? "bg-black/80 border-cyan-400 shadow-2xl shadow-cyan-500/50"
                          : "bg-transparent border-gray-600/20 hover:bg-black/50 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20"
                      )}
                    >
                      {/* Active item background effects */}
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>
                        </>
                      )}

                      <div className="relative flex items-center">
                        {item?.icon && (
                          <span
                            className={cn(
                              "relative flex items-center justify-center me-2 h-5 w-5 [&>svg]:h-[18px] [&>svg]:w-[18px] transition-all duration-300",
                              isActive
                                ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                                : "text-gray-400 group-hover:text-cyan-400/70 group-hover:scale-110"
                            )}
                          >
                            {item?.icon}
                          </span>
                        )}
                        <span
                          className={cn(
                            "relative font-medium text-sm transition-all duration-300",
                            isActive
                              ? "text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]"
                              : "text-gray-400 group-hover:text-cyan-300/70 group-hover:font-semibold"
                          )}
                        >
                          {item.name}
                        </span>
                      </div>

                      {/* Active item corner accents */}
                      {isActive && (
                        <>
                          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                        </>
                      )}
                    </div>
                  </Link>
                ) : (
                  <></>
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          {/* Social Media Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <Link href={"/test-agent"} className="hidden xl:block mx-2 my-2">
              <div
                className={cn(
                  "group relative border rounded-lg px-4 py-2 transition-all duration-300 overflow-hidden",
                  testActive
                    ? "bg-black/80 border-cyan-400 shadow-2xl shadow-cyan-500/50"
                    : "bg-transparent border-gray-600/20 hover:bg-black/50 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20"
                )}
              >
                {/* Active item background effects */}
                {testActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>
                  </>
                )}

                <div className="relative flex items-center">
                  {
                    <span
                      className={cn(
                        "relative flex items-center justify-center me-2 h-5 w-5 [&>svg]:h-[18px] [&>svg]:w-[18px] transition-all duration-300",
                        testActive
                          ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                          : "text-gray-400 group-hover:text-cyan-400/70 group-hover:scale-110"
                      )}
                    >
                      <LuPackageCheck />
                    </span>
                  }
                  <span
                    className={cn(
                      "relative font-medium text-sm transition-all duration-300",
                      testActive
                        ? "text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]"
                        : "text-gray-400 group-hover:text-cyan-300/70 group-hover:font-semibold"
                    )}
                  >{`Test Agent`}</span>
                </div>

                {/* Active item corner accents */}
                {testActive && (
                  <>
                    <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/60 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
                  </>
                )}
              </div>
            </Link>
            <a
              href="https://github.com/autoppia"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 text-gray-500 hover:text-cyan-400 hover:bg-black/50 hover:border hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 rounded-lg transition-all duration-300"
              aria-label="Explore our GitHub"
            >
              <FaGithub className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a
              href="https://x.com/AutoppiaAI"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 text-gray-500 hover:text-cyan-400 hover:bg-black/50 hover:border hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 rounded-lg transition-all duration-300"
              aria-label="Follow us on X (Twitter)"
            >
              <FaXTwitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a
              href="https://discord.com/channels/799672011265015819/1339356060787408996"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 text-gray-500 hover:text-cyan-400 hover:bg-black/50 hover:border hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 rounded-lg transition-all duration-300"
              aria-label="Join our Discord"
            >
              <FaDiscord className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <div className="relative flex items-center ml-2 group">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-red-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Main container */}
              <div className="relative flex items-center gap-2 px-3 py-1.5 bg-black border border-red-500 rounded-lg hover:border-red-400 transition-all duration-300">
                {/* Animated broadcasting icon */}
                <div className="relative">
                  <LuActivity className="w-4 h-4 text-red-500 animate-pulse" />
                  <div className="absolute -inset-1 border border-red-500 rounded-full animate-ping opacity-50"></div>
                </div>

                {/* Live text */}
                <span className="text-sm font-mono font-bold text-red-500 tracking-wider">
                  ● LIVE
                </span>
              </div>
            </div>
          </div>

          <HamburgerButton
            className="w-10 h-10 text-gray-500 hover:text-cyan-400 hover:bg-black/50 hover:border hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 rounded-lg transition-all duration-300"
            view={<Sidebar className="static w-full 2xl:w-full" />}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
