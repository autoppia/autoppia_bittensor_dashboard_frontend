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
                  <Link href={item?.href} className="hidden xl:block mx-1 my-2">
                    <div className="relative flex items-center group">
                      {/* Main container */}
                      <div
                        className={cn(
                          "relative flex items-center px-3 py-1.5 rounded-lg transition-all duration-300",
                          isActive
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500 hover:border-blue-400"
                            : "text-gray-700 hover:bg-gray-700/10"
                        )}
                      >
                        {/* {item?.icon && (
                          <div className="relative mr-2">
                            <span>{item.icon}</span>
                            {isActive && (
                              <div className="absolute -inset-1 border border-blue-500 rounded-full animate-ping opacity-50"></div>
                            )}
                          </div>
                        )} */}

                        {/* Menu text */}
                        <span className="font-medium text-md">{item.name}</span>
                      </div>
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
            <a
              href="https://github.com/autoppia"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all duration-300"
              aria-label="Explore our GitHub"
            >
              <FaGithub className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a
              href="https://x.com/AutoppiaAI"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all duration-300"
              aria-label="Follow us on X (Twitter)"
            >
              <FaXTwitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a
              href="https://discord.com/channels/799672011265015819/1339356060787408996"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all duration-300"
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
            className="group flex items-center justify-center w-10 h-10 text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300"
            view={<Sidebar className="static w-full 2xl:w-full" />}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
