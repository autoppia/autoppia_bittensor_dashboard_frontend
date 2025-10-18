"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import cn from "@core/utils/class-names";
import {
  DEFAULT_NAV_COLLECTION,
  MenuNamespace,
  NAV_COLLECTIONS,
} from "@/layouts/hydrogen/menu-items";

export function SidebarMenu() {
  const pathname = usePathname();
  const [activeNav, setActiveNav] =
    React.useState<MenuNamespace>(DEFAULT_NAV_COLLECTION);
  const navItems = NAV_COLLECTIONS[activeNav];

  return (
    <div className="mt-4 pb-3 3xl:mt-6">
      <div className="mx-3 2xl:mx-5 mb-4">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 p-1">
          {(["iwa", "subnet36"] as MenuNamespace[]).map((key) => {
            const isActive = activeNav === key;
            const label = key === "subnet36" ? "Subnet 36" : "IWA";
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveNav(key)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-emerald-400/20 text-white shadow-sm"
                    : "text-slate-200 hover:text-white"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {navItems.map((item) => {
        const href = item.href;
        const isActive =
          pathname === href || (href !== "/" && pathname.startsWith(href));

        return (
          <Link
            key={item.name}
            href={href}
            className={cn(
              "group relative mx-3 my-1 flex items-center px-4 py-4 transition-all duration-300 ease-out lg:my-1.5 2xl:mx-5 2xl:my-2",
              "font-medium text-base",
              isActive
                ? "text-emerald-300"
                : "text-slate-300 hover:text-emerald-200"
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  "relative z-10 mr-3 flex-shrink-0 transition-all duration-300",
                  "text-lg",
                  isActive
                    ? "text-emerald-300"
                    : "text-slate-400 group-hover:text-emerald-200"
                )}
              >
                {item.icon}
              </span>
            )}

            <span
              className={cn(
                "relative z-10 transition-all duration-300",
                isActive
                  ? "font-semibold text-white"
                  : "font-medium text-slate-200 group-hover:text-white group-hover:font-semibold"
              )}
            >
              {item.name}
            </span>

            <div
              className={cn(
                "absolute left-0 top-1/2 z-0 h-10 w-1 -translate-y-1/2 transform rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-300",
                "shadow-[4px_0_16px_rgba(16,185,129,0.4)]",
                isActive
                  ? "opacity-100 scale-y-100"
                  : "opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100"
              )}
            ></div>

            <div
              className={cn(
                "absolute inset-0 z-0 rounded-md bg-emerald-400/10 backdrop-blur-[1px] transition-all duration-300",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            ></div>
          </Link>
        );
      })}
    </div>
  );
}
