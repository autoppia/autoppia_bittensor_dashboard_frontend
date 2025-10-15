"use client";

import Link from "next/link";
import Image from "next/image";
import type { IconType } from "react-icons";
import { LuTrophy, LuAppWindow, LuCode } from "react-icons/lu";
import { PiRobotDuotone } from "react-icons/pi";

type OrbitItemConfig = {
  label: string;
  href: string;
  icon: IconType;
  accent: string;
  delay: string;
};

const ORBIT_ITEMS: OrbitItemConfig[] = [
  {
    label: "Infinite Web Arena",
    href: "https://infinitewebarena.autoppia.com",
    icon: LuTrophy,
    accent: "from-cyan-400 to-blue-500",
    delay: "0s",
  },
  {
    label: "Automata Playground",
    href: "https://automata.autoppia.com",
    icon: PiRobotDuotone,
    accent: "from-emerald-400 to-teal-500",
    delay: "-4s",
  },
  {
    label: "Studio Control",
    href: "https://studio.autoppia.com",
    icon: LuAppWindow,
    accent: "from-amber-400 to-orange-500",
    delay: "-8s",
  },
  {
    label: "Autoppia SDK",
    href: "https://github.com/autoppia/autoppia_sdk",
    icon: LuCode,
    accent: "from-purple-400 to-indigo-500",
    delay: "-12s",
  },
];

const OrbitItem = ({ label, href, icon, accent, delay }: OrbitItemConfig) => {
  const Icon = icon;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="orbit-item pointer-events-auto"
      style={{
        animationDelay: delay,
        zIndex: 20,
      }}
    >
      <div
        className={`flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white/80 shadow-[0_10px_25px_-15px_rgba(56,189,248,0.6)] transition-all duration-200 hover:border-white/20 hover:text-white`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-black/80`}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </span>
        {label}
      </div>
    </Link>
  );
};

export default function EcosystemOrbit() {
  return (
    <div className="ecosystem-orbit relative mx-auto flex h-[320px] w-[320px] flex-col items-center justify-center text-white/80 lg:mx-0">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 via-white/0 to-white/5 blur-3xl" />

      <div className="relative z-10 flex h-[145px] w-[145px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-lg shadow-[0_15px_50px_-25px_rgba(59,130,246,0.6)]">
        <Image
          src="/logo_autoppia.png"
          alt="Autoppia logo"
          width={240}
          height={230}
          className="h-full w-full select-none object-cover"
          style={{ transform: "scale(1.25)", padding: 0, margin: 0 }}
          priority
        />
      </div>

      <div className="orbit-path pointer-events-none absolute inset-2 rounded-full border border-white/10" />

      {ORBIT_ITEMS.map((item) => (
        <OrbitItem key={item.label} {...item} />
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .ecosystem-orbit .orbit-path {
              box-shadow: 0 0 45px rgba(94, 234, 212, 0.1);
            }

            .ecosystem-orbit .orbit-item {
              position: absolute;
              top: 50%;
              left: 50%;
              transform-origin: -120px center;
              animation: orbit 16s linear infinite;
            }

            @keyframes orbit {
              from {
                transform: rotate(0deg) translateX(120px) rotate(-0deg);
              }
              to {
                transform: rotate(360deg) translateX(120px) rotate(-360deg);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .ecosystem-orbit .orbit-item {
                animation: none;
                position: static;
                transform: none;
                margin-top: 0.75rem;
              }

              .ecosystem-orbit .orbit-path {
                display: none;
              }
            }
          `,
        }}
      />
    </div>
  );
}
