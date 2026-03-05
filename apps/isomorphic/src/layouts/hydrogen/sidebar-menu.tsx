"use client";

import NavLink from "@core/components/nav-link";
import React from "react";
import { usePathname } from "next/navigation";
import cn from "@core/utils/class-names";
import {
  DEFAULT_NAV_COLLECTION,
  MenuNamespace,
  NAV_COLLECTIONS,
  NAV_COLLECTION_EVENT,
  NAV_COLLECTION_STORAGE_KEY,
} from "@/layouts/hydrogen/menu-items";
import { Tooltip } from "rizzui";

function getNavItemWrapperClass(disabled: boolean, isActive: boolean): string {
  if (disabled) {
    return "cursor-not-allowed select-none text-slate-400 rounded-md border border-white/10 bg-white/5";
  }
  return isActive ? "text-emerald-300" : "text-slate-300 hover:text-emerald-200";
}

function getNavItemIconClass(disabled: boolean, isActive: boolean): string {
  if (disabled) return "text-slate-500";
  return isActive ? "text-emerald-300" : "text-slate-400 group-hover:text-emerald-200";
}

function getNavItemLabelClass(disabled: boolean, isActive: boolean): string {
  if (disabled) return "font-medium text-slate-300";
  return isActive
    ? "font-semibold text-white"
    : "font-medium text-slate-200 group-hover:text-white group-hover:font-semibold";
}

function getNavItemIndicatorClass(disabled: boolean, isActive: boolean): string {
  if (disabled) return "hidden";
  return isActive
    ? "opacity-100 scale-y-100"
    : "opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100";
}

function getNavItemHoverGlowClass(disabled: boolean, isActive: boolean): string {
  if (disabled) return "hidden";
  return isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100";
}

export function SidebarMenu() {
  const pathname = usePathname();
  const [activeNav, setActiveNav] =
    React.useState<MenuNamespace>(DEFAULT_NAV_COLLECTION);
  const activeNavRef = React.useRef<MenuNamespace>(DEFAULT_NAV_COLLECTION);
  const navItems = NAV_COLLECTIONS[activeNav];

  React.useEffect(() => {
    activeNavRef.current = activeNav;
  }, [activeNav]);

  const updateNavSelection = React.useCallback(
    (
      next: MenuNamespace,
      options?: { broadcast?: boolean; persist?: boolean }
    ) => {
      const prev = activeNavRef.current;
      if (prev !== next) {
        setActiveNav(next);
        activeNavRef.current = next;
      }
      if (globalThis.window === undefined) {
        return;
      }
      if (options?.persist !== false) {
        globalThis.localStorage.setItem(NAV_COLLECTION_STORAGE_KEY, next);
      }
      if (options?.broadcast && prev !== next) {
        globalThis.dispatchEvent(
          new CustomEvent<MenuNamespace>(NAV_COLLECTION_EVENT, {
            detail: next,
          })
        );
      }
    },
    []
  );

  React.useEffect(() => {
    if (globalThis.window === undefined) return;
    const stored = globalThis.localStorage.getItem(NAV_COLLECTION_STORAGE_KEY);
    if (stored === "subnet36" || stored === "iwa") {
      updateNavSelection(stored as MenuNamespace, { persist: false });
    }

    const handleExternalNav = (event: Event) => {
      const detail = (event as CustomEvent<MenuNamespace>).detail;
      if (detail === "subnet36" || detail === "iwa") {
        updateNavSelection(detail, { persist: false });
      }
    };

    globalThis.addEventListener(
      NAV_COLLECTION_EVENT,
      handleExternalNav as EventListener
    );
    return () =>
      globalThis.removeEventListener(
        NAV_COLLECTION_EVENT,
        handleExternalNav as EventListener
      );
  }, [updateNavSelection]);

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
                onClick={() => {
                  if (!isActive) {
                    updateNavSelection(key, { broadcast: true, persist: true });
                  }
                }}
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
        const disabled = Boolean(item.disabled);
        const isActive =
          !disabled &&
          (pathname === href || (href !== "/" && pathname.startsWith(href)));

        const wrapperClass = cn(
          "relative mx-3 my-1 flex items-center px-4 py-4 transition-all duration-300 ease-out lg:my-1.5 2xl:mx-5 2xl:my-2 font-medium text-base",
          disabled ? getNavItemWrapperClass(true, false) : ["group", getNavItemWrapperClass(false, isActive)]
        );

        const iconClass = cn(
          "relative z-10 mr-3 flex-shrink-0 transition-all duration-300 text-lg",
          getNavItemIconClass(disabled, isActive)
        );

        const labelClass = cn(
          "relative z-10 transition-all duration-300 flex items-center gap-2",
          getNavItemLabelClass(disabled, isActive)
        );

        const activeIndicatorClass = cn(
          "absolute left-0 top-1/2 z-0 h-10 w-1 -translate-y-1/2 transform rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-300 shadow-[4px_0_16px_rgba(16,185,129,0.4)]",
          getNavItemIndicatorClass(disabled, isActive)
        );

        const hoverGlowClass = cn(
          "absolute inset-0 z-0 rounded-md bg-emerald-400/10 backdrop-blur-[1px] transition-all duration-300",
          getNavItemHoverGlowClass(disabled, isActive)
        );

        const itemBody = (
          <div className={wrapperClass}>
            {item.icon && <span className={iconClass}>{item.icon}</span>}
            <span className={labelClass}>
              {item.name}
              {item.disabled && (
                <span className="rounded-full border border-slate-400/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                  Not available yet
                </span>
              )}
            </span>
            <div className={activeIndicatorClass}></div>
            <div className={hoverGlowClass}></div>
          </div>
        );

        if (disabled) {
          return (
            <Tooltip
              key={item.name}
              content={item.disabledLabel ?? "Not available yet"}
              placement="right"
            >
              <div aria-disabled="true" tabIndex={-1}>
                {itemBody}
              </div>
            </Tooltip>
          );
        }

        return (
          <NavLink key={item.name} href={href}>
            {itemBody}
          </NavLink>
        );
      })}
    </div>
  );
}
