"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Title, Collapse } from "rizzui";
import cn from "@core/utils/class-names";
import { menuItems } from "@/layouts/hydrogen/menu-items";

export function SidebarMenu() {
  const pathname = usePathname();

  return (
    <div className="mt-4 pb-3 3xl:mt-6">
      {menuItems.map((item, index) => {
        const href = item?.href as string;
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(href));

        return (
          <Fragment key={item.name + "-" + index}>
            {item?.href ? (
              <Link
                href={item?.href}
                className={cn(
                  "group relative mx-3 my-1 flex items-center px-4 py-3 transition-all duration-300 ease-out lg:my-1.5 2xl:mx-5 2xl:my-2",
                  "font-medium text-sm",
                  isActive
                    ? "text-emerald-700"
                    : "text-gray-600 hover:text-emerald-700"
                )}
              >
                {/* Menu text */}
                <span className={cn(
                  "relative transition-all duration-300",
                  isActive ? "font-semibold" : "font-medium group-hover:font-semibold"
                )}>
                  {item.name}
                </span>
                
                {/* Animated left highlight with right glow */}
                <div className={cn(
                  "absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-300",
                  "shadow-[4px_0_16px_rgba(16,185,129,0.6)]",
                  isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100"
                )}></div>
                
                {/* Subtle background highlight */}
                <div className={cn(
                  "absolute inset-0 bg-emerald-50/30 rounded-md transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}></div>
              </Link>
            ) : (
              <Title
                as="h6"
                className={cn(
                  "mb-3 truncate px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 2xl:px-8",
                  index !== 0 && "mt-8 3xl:mt-10"
                )}
              >
                {item.name}
              </Title>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
