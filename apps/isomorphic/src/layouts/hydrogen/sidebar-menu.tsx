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
                  "group relative mx-3 my-1 flex items-center px-4 py-4 transition-all duration-300 ease-out lg:my-1.5 2xl:mx-5 2xl:my-2",
                  "font-medium text-base",
                  isActive
                    ? "text-emerald-300"
                    : "text-slate-300 hover:text-emerald-200"
                )}
              >
                {/* Menu icon */}
                {item.icon && (
                  <span className={cn(
                    "relative z-10 mr-3 flex-shrink-0 transition-all duration-300",
                    "text-lg",
                    isActive ? "text-emerald-300" : "text-slate-400 group-hover:text-emerald-200"
                  )}>
                    {item.icon}
                  </span>
                )}
                
                {/* Menu text */}
                <span className={cn(
                  "relative z-10 transition-all duration-300",
                  isActive ? "font-semibold text-white" : "font-medium text-slate-200 group-hover:text-white group-hover:font-semibold"
                )}>
                  {item.name}
                </span>
                
                {/* Animated left highlight with right glow */}
                <div className={cn(
                  "absolute left-0 top-1/2 z-0 h-10 w-1 -translate-y-1/2 transform rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-300",
                  "shadow-[4px_0_16px_rgba(16,185,129,0.4)]",
                  isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100"
                )}></div>
                
                {/* Subtle background highlight */}
                <div className={cn(
                  "absolute inset-0 z-0 rounded-md bg-emerald-400/10 backdrop-blur-[1px] transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}></div>
              </Link>
            ) : (
              <Title
                as="h6"
                className={cn(
                  "mb-3 truncate px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 2xl:px-8",
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
