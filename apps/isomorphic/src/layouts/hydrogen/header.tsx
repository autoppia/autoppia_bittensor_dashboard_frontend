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
                  <Link
                    href={item?.href}
                    className="hidden xl:block mx-2 my-2"
                  >
                    <div
                      className={cn(
                        "flex items-center rounded-full px-3 py-2 transition-colors duration-200",
                        isActive
                          ? "bg-primary text-gray-0"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {item?.icon && (
                        <span className="flex items-center justify-center me-2 h-5 w-5 [&>svg]:h-[20px] [&>svg]:w-[20px]">
                          {item?.icon}
                        </span>
                      )}
                      <span>{item.name}</span>
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
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full"
              aria-label="Explore our GitHub"
            >
              <FaGithub className="w-5 h-5 text-gray-900" />
            </a>
            <a
              href="https://x.com/AutoppiaAI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full"
              aria-label="Follow us on X (Twitter)"
            >
              <FaXTwitter className="w-5 h-5 text-gray-900" />
            </a>
            <a
              href="https://discord.com/channels/799672011265015819/1339356060787408996"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full"
              aria-label="Join our Discord"
            >
              <FaDiscord className="w-5 h-5 text-gray-900" />
            </a>
          </div>

          <HamburgerButton
            className="w-10 h-10 hover:bg-gray-100 rounded-full text-gray-900"
            view={<Sidebar className="static w-full 2xl:w-full" />}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
