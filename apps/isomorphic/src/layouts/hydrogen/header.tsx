"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import cn from "@core/utils/class-names";
import HamburgerButton from "@/layouts/hamburger-button";
import Sidebar from "@/layouts/hydrogen/sidebar";
import StickyHeader from "@/layouts/sticky-header";
import { menuItems } from "@/layouts/hydrogen/menu-items";
import { PiPlayCircleDuotone } from "react-icons/pi";
import TwitterIcon from "@core/components/icons/twitter";
import DiscordIcon from "@core/components/icons/discord";

export default function Header() {
  const pathname = usePathname();
  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <Link
            href={"/"}
            aria-label="Site Logo"
            className="me-4 w-[155px] text-gray-800 hover:text-gray-900 lg:me-5"
          >
            <Image src="/logo.webp" alt="Logo" width={155} height={36} />
          </Link>
          {menuItems.map((item, index) => {
            const href = item?.href as string;
            const isActive =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));

            return (
              <Fragment key={item.name + "-" + index}>
                {item?.href ? (
                  <Link
                    href={item?.href}
                    className={cn(
                      "group relative mx-3 my-2 items-center justify-between rounded-full px-3 py-2 font-medium capitalize hidden lg:flex",
                      isActive
                        ? "bg-primary text-black"
                        : "text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90"
                    )}
                  >
                    <div className="flex items-center truncate">
                      {item?.icon && (
                        <span
                          className={cn(
                            "me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]",
                            isActive
                              ? "text-black"
                              : "text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700"
                          )}
                        >
                          {item?.icon}
                        </span>
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                ) : (
                  <></>
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Social Media Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="https://x.com/AutoppiaAI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              aria-label="Follow us on X (Twitter)"
            >
              <TwitterIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a
              href="https://discord.com/channels/799672011265015819/1339356060787408996"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              aria-label="Join our Discord"
            >
              <DiscordIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
          </div>

          {/* Running indicator */}
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium animate-pulse">
            <PiPlayCircleDuotone className="h-4 w-4" />
            <span className="hidden sm:inline">Running</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          </div>

          <HamburgerButton
            view={<Sidebar className="static w-full 2xl:w-full" />}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
