import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { IconType } from "react-icons";
import { LuArrowUpRight, LuGithub, LuBookOpen, LuTrophy, LuUser, LuCode, LuPlay } from "react-icons/lu";
import { FaTwitter, FaDiscord, FaTelegram } from "react-icons/fa6";
import EcosystemOrbit from "@/components/landing/ecosystem-orbit";

export const metadata: Metadata = {
  title: "Autoppia | Building Autonomous Companies",
  description:
    "Autoppia orchestrates AI Workers across Infinite Web Arena, Studio, and Automata to build fully autonomous companies.",
};

const navItems = [
  {
    label: "Infinite Web Arena",
    href: "https://infinitewebarena.autoppia.com",
  },
  {
    label: "Automata",
    href: "https://automata.autoppia.com",
  },
  {
    label: "Autoppia SDK",
    href: "https://github.com/autoppia/autoppia_sdk",
  },
  {
    label: "Studio",
    href: "https://studio.autoppia.com",
  },
];

type ResourceLink = {
  label: string;
  href: string;
  icon: IconType;
};

const resourceLinks: ResourceLink[] = [
  {
    label: "Docs",
    href: "https://documentation.autoppia.com",
    icon: LuBookOpen,
  },
  {
    label: "GitHub",
    href: "https://github.com/autoppia",
    icon: LuGithub,
  },
];

type ProductCardAction = {
  label: string;
  href: string;
  icon: IconType;
};

type ProductCard = {
  title: string;
  description: string;
  href: string;
  accent: string;
  badge: string;
  actions?: ProductCardAction[];
};

const productCards: ProductCard[] = [
  {
    title: "Infinite Web Arena",
    description: "The benchmark for autonomous web agents.",
    href: "https://infinitewebarena.autoppia.com",
    accent: "from-cyan-400/60 via-blue-400/60 to-purple-400/60",
    badge: "🌐",
    actions: [
      {
        label: "Leaderboard",
        href: "https://infinitewebarena.autoppia.com",
        icon: LuTrophy,
      },
      {
        label: "GitHub",
        href: "https://github.com/autoppia/autoppia_iwa",
        icon: LuGithub,
      },
    ],
  },
  {
    title: "Automata",
    description: "Autonomous web operator playground.",
    href: "https://automata.autoppia.com",
    accent: "from-emerald-400/60 via-teal-400/60 to-cyan-400/60",
    badge: "🤖",
    actions: [
      {
        label: "Playground",
        href: "https://automata.autoppia.com",
        icon: LuArrowUpRight,
      },
      {
        label: "Docs",
        href: "https://documentation.autoppia.com",
        icon: LuBookOpen,
      },
      {
        label: "API Docs",
        href: "https://api-automata.autoppia.com/docs/",
        icon: LuBookOpen,
      },
    ],
  },
  {
    title: "Autoppia SDK",
    description: "Build and extend AI Workers with our open SDK.",
    href: "https://github.com/autoppia/autoppia_sdk",
    accent: "from-fuchsia-400/60 via-purple-400/60 to-indigo-400/60",
    badge: "🧰",
    actions: [
      {
        label: "GitHub",
        href: "https://github.com/autoppia/autoppia_sdk",
        icon: LuGithub,
      },
      {
        label: "Docs",
        href: "https://documentation.autoppia.com",
        icon: LuBookOpen,
      },
    ],
  },
  {
    title: "Studio",
    description: "Deploy and orchestrate your AI Worker teams.",
    href: "https://studio.autoppia.com",
    accent: "from-amber-400/60 via-orange-400/60 to-rose-400/60",
    badge: "🎨",
    actions: [
      {
        label: "User",
        href: "https://app.autoppia.com",
        icon: LuUser,
      },
      {
        label: "Developers",
        href: "https://app.autoppia.com/developers/dashboard",
        icon: LuCode,
      },
      {
        label: "Playground",
        href: "https://playground.autoppia.com",
        icon: LuPlay,
      },
    ],
  },
];

type FooterLink = {
  label: string;
  href: string;
  icon: IconType;
};

const footerLinks: FooterLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/autoppia",
    icon: LuGithub,
  },
  {
    label: "Twitter",
    href: "https://x.com/AutoppiaAI",
    icon: FaTwitter,
  },
  {
    label: "Discord",
    href: "https://discord.com/channels/799672011265015819/1339356060787408996",
    icon: FaDiscord,
  },
  {
    label: "Telegram",
    href: "https://t.me/Autoppia",
    icon: FaTelegram,
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden text-white -mx-4 -mt-2 -mb-6 md:-mx-5 lg:-mx-6 lg:-mb-8 3xl:-mx-8 3xl:-mt-4 4xl:-mx-10 4xl:-mb-9">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_55%)]" />
        <div className="absolute inset-y-0 right-[-20%] w-[60%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[60%] w-[60%] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-6 px-6 pt-6 sm:px-10 sm:pt-8">
          <div className="flex items-center gap-8">
            <Link href="/landing" aria-label="Autoppia" className="w-[120px] sm:w-[155px]">
              <Image
                src="/logo.webp"
                alt="Autoppia Logo"
                width={155}
                height={36}
                style={{ width: "auto", maxWidth: "100%" }}
                priority
              />
            </Link>
            <nav className="mt-1 flex items-center gap-4 overflow-x-auto text-xs font-semibold uppercase tracking-[0.25em] text-white/60 sm:text-[12px]">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap py-1.5 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {resourceLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/50 transition-colors duration-200 hover:text-white sm:text-[11px]"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="https://studio.autoppia.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-[0_10px_25px_-15px_rgba(251,146,60,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:text-[12px]"
            >
              Enter Studio
              <LuArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-between px-6 py-12 sm:px-12 sm:py-14 md:px-16 md:py-16">
          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] lg:items-center lg:gap-10">
              <div className="flex flex-col gap-6 md:max-w-3xl">
                <span className="inline-flex w-fit items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Autoppia
                </span>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                  BUILDING AUTONOMOUS COMPANIES
                </h1>
                <p className="max-w-2xl text-base text-white/70 sm:text-lg">
                  We orchestrate specialized AI Workers to automate operations across
                  every business surface—from browsers and SaaS tools to email, APIs,
                  and beyond.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                  <Link
                    href="https://taostats.io/subnets/36/chart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition-colors duration-200 hover:border-white/20 hover:text-white"
                  >
                    Bittensor Subnet 36
                  </Link>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Autoppia Web Operator
                  </span>
                </div>
              </div>
              <div className="hidden justify-start lg:flex lg:ml-16 xl:ml-24 2xl:ml-32">
                <EcosystemOrbit />
              </div>
            </div>
            <div className="flex justify-center lg:hidden">
              <EcosystemOrbit />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productCards.map((card) => (
                <div
                  key={card.title}
                  className="group relative flex min-h-[160px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                >
                  <Link
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={`Open ${card.title}`}
                  />
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                  </div>
                  <div className="relative z-20 flex flex-col gap-4 pointer-events-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden>
                          {card.badge}
                        </span>
                        <h2 className="text-xl font-semibold sm:text-2xl">
                          {card.title}
                        </h2>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/70 transition-all duration-300 group-hover:border-white/0 group-hover:bg-white/20 group-hover:text-white">
                        <LuArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{card.description}</p>
                    {card.actions?.length ? (
                      <div className="flex items-center gap-3 pointer-events-auto">
                        {card.actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <Link
                              key={action.label}
                              href={action.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative z-30 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
                            >
                              {Icon ? <Icon className="h-4 w-4" /> : null}
                              <span>{action.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="mt-auto flex flex-col gap-4 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:pt-10 sm:text-sm">
            <span>© {new Date().getFullYear()} Autoppia. Building autonomous companies.</span>
            <div className="flex flex-wrap items-center gap-3">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-white/70 transition-colors duration-200 hover:border-white/20 hover:text-white"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
