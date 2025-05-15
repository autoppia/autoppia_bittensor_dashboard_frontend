"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import cn from '@core/utils/class-names';
import HamburgerButton from "@/layouts/hamburger-button";
import Sidebar from "@/layouts/hydrogen/sidebar";
import StickyHeader from "@/layouts/sticky-header";
import { menuItems } from "@/layouts/hydrogen/menu-items";

export default function Header() {
  const pathname = usePathname();
  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton view={<Sidebar className="static w-full 2xl:w-full" />} />
        <Link
          href={"/"}
          aria-label="Site Logo"
          className="me-4 w-[155px] text-gray-800 hover:text-gray-900 lg:me-5"
        >
          <Image src="/logo.webp" alt="Logo" width={155} height={36} />
        </Link>
        {menuItems.map((item, index) => {
          const isActive = pathname === (item?.href as string);

          return (
            <Fragment key={item.name + "-" + index}>
              {item?.href ? (
                <Link
                  href={item?.href}
                  className={cn(
                    "group relative mx-3 my-2 flex items-center justify-between rounded-full px-3 py-2 font-medium capitalize hidden lg:block",
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
          )
        })}
      </div>
    </StickyHeader>
  );
}
