"use client";

import cn from "@core/utils/class-names";
import Link from "next/link";
import Image from "next/image";
import { SidebarMenu } from "./sidebar-menu";

export default function Sidebar({ className }: Readonly<{ className?: string }>) {
  return (
    <aside
      className={cn(
        "relative fixed bottom-0 start-0 z-50 h-full w-[270px] overflow-hidden border-e border-white/10 bg-[#040b1a]/95 text-slate-100 shadow-[0_0_40px_rgba(8,17,40,0.45)] backdrop-blur-xl 2xl:w-72",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative z-10 sticky top-0 border-b border-white/10 bg-white/5 px-6 pb-5 pt-5 backdrop-blur 2xl:px-8 2xl:pt-6">
        <Link
          href={"/"}
          aria-label="Site Logo"
          className="text-slate-100 transition-colors hover:text-white"
        >
          <Image
            src="/iwap_logo.webp"
            alt="Autoppia Logo"
            width={155}
            height={36}
          />
        </Link>
      </div>

      <div className="relative z-10 custom-scrollbar h-[calc(100%-80px)] overflow-y-auto scroll-smooth px-1 pb-4">
        <SidebarMenu />
      </div>
    </aside>
  );
}
