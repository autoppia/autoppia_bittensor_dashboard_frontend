"use client";

import { useState, useEffect } from "react";
import type { IconType } from "react-icons";
import { Title, Text } from "rizzui/typography";
import { Button } from "rizzui";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import { WebsiteItem } from "./cardItem";
import { LuTrophy, LuFileText, LuNetwork, LuCompass } from "react-icons/lu";
import {
  PiFlaskDuotone,
  PiRocketLaunchDuotone,
  PiCheckCircleDuotone,
  PiGearDuotone,
  PiTargetDuotone,
  PiLightningDuotone,
  PiXCircleDuotone,
  PiBrainDuotone,
} from "react-icons/pi";
import cn from "@core/utils/class-names";
import { FaArrowRight, FaGithub } from "react-icons/fa";

type Highlight = {
  title: string;
  description: string;
  icon: IconType;
  gradient: string;
};

const IWA_HIGHLIGHTS: Highlight[] = [
  {
    title: "Synthetic Tasks",
    description:
      "Continuously evolving scenarios keep agents from memorizing the benchmark.",
    icon: PiFlaskDuotone,
    gradient: "from-sky-500 via-cyan-400 to-emerald-400",
  },
  {
    title: "Infinite Scale",
    description:
      "AI generates fresh websites, tasks, and tests—no human bottlenecks.",
    icon: PiLightningDuotone,
    gradient: "from-indigo-500 via-sky-500 to-cyan-400",
  },
  {
    title: "Realistic Website Mirrors",
    description:
      "Locally hosted replicas of popular sites mirror real-world UI and flows.",
    icon: PiRocketLaunchDuotone,
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-400",
  },
  {
    title: "Adaptability",
    description:
      "Benchmark adapts as web technologies change, matching production complexity.",
    icon: PiGearDuotone,
    gradient: "from-teal-500 via-emerald-500 to-green-400",
  },
];

const IWA_CONSTRAINTS: string[] = [
  "Limited datasets: static, human-authored tasks agents can memorize.",
  "Human bottlenecks: every new scenario needs manual creation and review.",
  "Static environments: fixed websites that never evolve alongside the web.",
  "Expensive scaling: growing coverage requires proportional human effort.",
];

const SN36_HIGHLIGHTS: Highlight[] = [
  {
    title: "Subnet 36: Web Agents",
    description:
      "Dynamic Zero tiers (D1-D4) shuffle layouts, content, and pop-ups so agents must reason beyond memorization.",
    icon: PiTargetDuotone,
    gradient: "from-sky-500 via-teal-500 to-emerald-400",
  },
  {
    title: "Dynamic Zero Upgrade",
    description:
      "Launched Oct 21, it hardened SN36 with tougher evaluation variants, faster iteration, and transparent routing.",
    icon: PiLightningDuotone,
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
  },
  {
    title: "Winner Takes It All",
    description:
      "Each evaluation crowns a single miner—the TAO reward goes entirely to the top-performing agent.",
    icon: LuTrophy,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
  },
];

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "Infinite Web Arena";
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden font-sans">
      <section className="relative px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-20 md:py-32 overflow-hidden">
        {/* Subtle background gradients - much lighter than before */}
        {/* Hero Section */}

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Typing Animation Title */}
          <h1
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-8 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent min-h-[1.2em] transition-all duration-1000",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            {displayedText}
            <span className="animate-pulse">|</span>
          </h1>

          {/* Animated Subtitle */}
          <div
            className={cn(
              "transition-all duration-1000 delay-500",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            )}
          >
            <Text className="text-base sm:text-lg md:text-xl lg:text-2xl text-cyan-100 my-6 sm:my-8 leading-relaxed px-2">
              The most{" "}
              <span className="text-cyan-300 font-bold bg-cyan-400/20 px-3 py-1.5 rounded-lg animate-glow border border-cyan-400/30">
                advanced
              </span>{" "}
              web operation benchmark designed to rigorously test and evaluate
              Web Agents across dynamic, ever-changing web environments.
            </Text>
          </div>
          {/* CTA Buttons */}
          <div
            className={cn(
              "flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center mt-12 transition-all duration-1000 delay-500",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            )}
          >
            <a
              href="https://documentation.autoppia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25">
                <LuFileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                LEARN MORE
              </button>
            </a>
            <Link href={routes.leaderboard} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/25">
                <LuTrophy className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                LEADERBOARD
              </button>
            </Link>
            <Link href={routes.testAgent} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500/60 to-pink-500/60 border-2 border-purple-500/60 hover:from-purple-500 hover:to-pink-500 hover:border-purple-500 rounded-xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 backdrop-blur-sm">
                <PiFlaskDuotone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                TEST YOUR AGENT
              </button>
            </Link>
          </div>

          {/* Stats Counter - cleaner design */}
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 max-w-3xl mx-auto transition-all duration-1000 delay-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            )}
          >
            {[
              {
                value: "+12",
                label: "Websites",
                gradient: "from-cyan-400 to-blue-500",
                glow: "group-hover:shadow-cyan-400/20",
                white: true,
                valueClass: "text-cyan-200",
              },
              {
                value: "+1000",
                label: "Synthetic Tasks",
                gradient: "from-yellow-400 to-orange-500",
                glow: "group-hover:shadow-yellow-400/20",
                white: true,
                valueClass: "text-amber-200",
              },
              {
                value: (
                  <span className="inline-block scale-150 align-baseline text-white">
                    ∞
                  </span>
                ),
                label: "Scalability",
                gradient: "from-purple-400 to-pink-500",
                glow: "group-hover:shadow-purple-400/20",
                white: true,
                valueClass: undefined,
                labelClass: undefined,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={cn(
                  "group p-6 sm:p-8 rounded-2xl backdrop-blur-sm bg-background/50 border border-border/50 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:border-foreground/20",
                  stat.glow
                )}
                style={{
                  animationDelay: `${idx * 200}ms`,
                }}
              >
                <div
                  className={cn(
                    "text-3xl sm:text-4xl md:text-5xl font-bold mb-2",
                    stat.valueClass
                      ? stat.valueClass
                      : stat.white
                        ? "text-white"
                        : cn(
                            "bg-gradient-to-r bg-clip-text text-transparent",
                            stat.gradient
                          )
                  )}
                >
                  {stat.value}
                </div>
                <div
                  className={cn(
                    "text-sm sm:text-base font-medium",
                    stat.labelClass
                      ? stat.labelClass
                      : stat.white
                        ? "text-white"
                        : "text-muted-foreground"
                  )}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infinite Web Arena Section */}
      <section className="relative px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header (unchanged) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <PiTargetDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center"
            >
              Infinite Web Arena (IWA)
            </Title>
          </div>

          {/* Outer card */}
          <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
            <div className="relative p-6 sm:p-10 md:p-12">
              {/* Static paragraphs */}
              <div className="space-y-4 sm:space-y-6">
                <Text className="text-base sm:text-lg text-cyan-100 leading-relaxed">
                  <span className="text-cyan-300 font-bold sm:bg-cyan-500/10 sm:px-3 sm:py-1.5 rounded-lg animate-glow sm:border border-cyan-400/30">
                    Infinite Web Arena (IWA)
                  </span>{" "}
                  is a scalable, ever-evolving benchmark that evaluates
                  autonomous web agents under conditions that mirror the
                  boundless complexity of the live web.
                </Text>
                <Text className="text-base sm:text-lg text-cyan-100 leading-relaxed">
                  By pairing{" "}
                  <span className="text-cyan-300 font-bold sm:bg-cyan-500/10 sm:px-3 sm:py-1.5 rounded-lg animate-glow sm:border border-cyan-400/30">
                    synthetic
                  </span>{" "}
                  web environments with automated task and verification
                  pipelines, IWA delivers a sustainable arena where agents can
                  be tested, trained, and compared indefinitely.
                </Text>
              </div>

              {/* MOBILE: show all 4 cards (original layout) */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {IWA_HIGHLIGHTS.map((h) => {
                  const Icon = h.icon;
                  return (
                    <div
                      key={h.title}
                      className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-cyan-300" />
                        <Text className="font-bold text-white text-sm">
                          {h.title}
                        </Text>
                      </div>
                      <Text className="text-cyan-100 text-xs leading-relaxed">
                        {h.description}
                      </Text>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP (md+): tabs left, content right with equal heights */}
              <div className="hidden md:grid md:grid-cols-3 md:gap-8 mt-8 items-stretch">
                {/* Left column: vertical tabs */}
                <div className="md:col-span-1 h-full">
                  <div className="flex h-full md:flex-col gap-3">
                    {IWA_HIGHLIGHTS.map((h, idx) => {
                      const Icon = h.icon;
                      const isActive = idx === activeTab;
                      return (
                        <button
                          key={h.title}
                          onClick={() => setActiveTab(idx)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                            isActive
                              ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-transparent shadow-lg"
                              : "bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 border-cyan-500/20"
                          }`}
                          aria-selected={isActive}
                          role="tab"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{h.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right column: active content (stretches to same height) */}
                <div className="md:col-span-2 h-full">
                  {(() => {
                    const {
                      icon: ActiveIcon,
                      title,
                      description,
                    } = IWA_HIGHLIGHTS[activeTab];
                    return (
                      <div className="h-full p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 transition-all duration-300 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <ActiveIcon className="w-5 h-5 text-cyan-300" />
                          <Text className="font-bold text-white text-base">
                            {title}
                          </Text>
                        </div>
                        <Text className="text-cyan-100 text-sm leading-relaxed">
                          {description}
                        </Text>

                        {/* Spacer to push bottom edge so card fills */}
                        <div className="mt-auto" />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="relative px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <PiGearDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:animate-spin" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent text-center"
            >
              How It Works
            </Title>
          </div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Synthetic Task Generation",
                desc: "IWA continuously creates new, dynamic tasks across diverse scenarios.",
                color: "from-cyan-400 to-blue-500",
                borderColor: "border-cyan-500/30 hover:border-cyan-400/50",
                shadowColor: "hover:shadow-cyan-500/30",
              },
              {
                num: 2,
                title: "Synthetic tests generation",
                desc: "IWA produces machine-checkable tests with clear goals and pass/fail criteria.",
                color: "from-teal-400 to-emerald-500",
                borderColor:
                  "border-emerald-500/30 hover:border-emerald-400/50",
                shadowColor: "hover:shadow-emerald-500/30",
              },
              {
                num: 3,
                title: "Agent Execution in Real Browsers",
                desc: "Your Web Agent interacts with real DOMs, dynamic UIs, and realistic workflows.",
                color: "from-blue-400 to-purple-500",
                borderColor: "border-blue-500/30 hover:border-blue-400/50",
                shadowColor: "hover:shadow-blue-500/30",
              },
              {
                num: 4,
                title: "Automated Synthetic Validation",
                desc: "Success is verified through predefined conditions across frontend and backend, ensuring unambiguous scoring.",
                color: "from-purple-400 to-pink-500",
                borderColor: "border-purple-500/30 hover:border-purple-400/50",
                shadowColor: "hover:shadow-purple-500/30",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={cn(
                  "group relative flex gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-2",
                  step.borderColor,
                  step.shadowColor
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-2xl"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>

                <div
                  className={cn(
                    "relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl text-white shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 bg-gradient-to-br",
                    step.color
                  )}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping"></div>
                  <span className="relative">{step.num}</span>
                </div>
                <div className="relative flex-1">
                  <Title
                    as="h3"
                    className={cn(
                      "text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent",
                      step.color
                    )}
                  >
                    {step.title}
                  </Title>
                  <Text className="text-base sm:text-lg text-cyan-100 leading-relaxed">
                    {step.desc}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web Projects Section */}
      <section className="relative px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
            <PiRocketLaunchDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:animate-bounce" />
          </div>
          <Title
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent text-center"
          >
            Our Web Projects
          </Title>
        </div>
        <Text className="text-center text-lg sm:text-xl text-cyan-100 mb-12 max-w-3xl mx-auto">
          IWA includes{" "}
          <span className="text-yellow-300 font-bold sm:bg-yellow-400/20 sm:px-3 sm:py-1.5 rounded-lg sm:border sm:border-yellow-400/30">
            {websitesData.length} synthetic websites
          </span>{" "}
          covering e-commerce, dining, CRM, email, delivery, lodging, and
          professional networking. Here&apos;s a preview of our projects:
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {websitesData.slice(0, 6).map((website, index) => (
            <div
              key={index}
              className="transition-transform duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <WebsiteItem website={website} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/websites">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500/60 to-blue-500/60 border-2 border-cyan-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-cyan-500 hover:to-blue-500 hover:border-cyan-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 mx-auto">
              VIEW ALL {websitesData.length} PROJECTS
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
      {/* About Bittensor */}
      <section className="relative w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto py-16 md:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <PiBrainDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-200 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center"
            >
              Bittensor - Subnet 36 (SN36)
            </Title>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-900/85 hover:border-emerald-400/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10"></div>

            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 sm:p-10 md:p-12">
              <div className="lg:col-span-3 space-y-6">
                <Text className="text-base sm:text-lg text-emerald-100 leading-relaxed">
                  Subnet 36 (SN36) on{" "}
                  <span className="text-emerald-200 font-bold sm:bg-emerald-500/10 sm:px-3 sm:py-1.5 rounded-lg animate-glow sm:border border-cyan-400/30">
                    Bittensor
                  </span>{" "}
                  runs competitive web automation trials around the clock.
                  Miners ship agents, validators grade their runs, and TAO flows
                  to the best execution each cycle.
                </Text>
                <Text className="text-base sm:text-lg text-emerald-100 leading-relaxed">
                  Autoppia streams{" "}
                  <span className="text-emerald-200 font-bold sm:bg-emerald-500/10 sm:px-3 sm:py-1.5 rounded-lg animate-glow sm:border border-cyan-400/30">
                    Infinite Web Arena (IWA)
                  </span>{" "}
                  scenarios into SN36 so miners face ever-changing sites, safe
                  sandboxes, and automated validation. That keeps scorecards
                  honest and agents production ready.
                </Text>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: PiCheckCircleDuotone,
                      title: "Decentralized Competition",
                      desc: "Miners worldwide compete to build the best Web Agents and earn TAO rewards.",
                    },
                    {
                      icon: LuTrophy,
                      title: "Winner Takes All",
                      desc: "Top-performing agent receives full reward, ensuring quality over quantity.",
                    },
                    {
                      icon: PiTargetDuotone,
                      title: "Dynamic Evaluation",
                      desc: "IWA generates ever-changing tasks to prevent overfitting and memorization.",
                    },
                    {
                      icon: PiRocketLaunchDuotone,
                      title: "Top Miner will be Automata",
                      desc: "Best agents deploy directly to Automata for real-world tasks.",
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-emerald-300" />
                        <Text className="font-bold text-white text-sm">
                          {title}
                        </Text>
                      </div>
                      <Text className="text-emerald-100 text-xs leading-relaxed">
                        {desc}
                      </Text>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SN36_HIGHLIGHTS.map((highlight) => {
                    const Icon = highlight.icon;
                    return (
                      <div
                        key={highlight.title}
                        className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-emerald-300" />
                          <Text className="font-bold text-white text-sm">
                            {highlight.title}
                          </Text>
                        </div>
                        <Text className="text-emerald-100 text-xs leading-relaxed">
                          {highlight.description}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="relative px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-8 mb-16">
        <div className="relative rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl border-2 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 group/icon justify-center sm:justify-start">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg group-hover/icon:scale-125 group-hover/icon:rotate-12 transition-all duration-300">
                  <LuTrophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <Title
                  as="h2"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-center sm:text-left"
                >
                  Leaderboard
                </Title>
              </div>
              <Text className=" text-base sm:text-lg text-orange-100 mb-6 leading-relaxed">
                Discover which{" "}
                <span className="sm:text-yellow-300 sm:font-bold sm:bg-yellow-400/20 sm:px-3 sm:py-1.5 sm:rounded-lg sm:border sm:border-yellow-400/30">
                  SOTA agents
                </span>{" "}
                are leading the benchmark worldwide. Our leaderboard tracks
                real-time performance across all synthetic tasks, ranking agents
                by accuracy, speed, and overall success rate.
              </Text>
              <div className="space-y-2 mb-8 text-orange-100">
                {[
                  "Real-time rankings",
                  "Comprehensive metrics",
                  "Global competition",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <PiCheckCircleDuotone className="w-5 h-5 text-emerald-400" />
                    <Text>{item}</Text>
                  </div>
                ))}
              </div>
              <Link href={routes.leaderboard}>
                <button className="px-2 sm:px-8 py-4 bg-gradient-to-r from-yellow-500/60 to-orange-500/60 border-2 border-yellow-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/50">
                  <LuTrophy className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  VIEW LEADERBOARD
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border-2 border-yellow-400/30 backdrop-blur-sm p-6 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-yellow-400/30">
                  <span className="text-yellow-400 font-bold text-sm">
                    RANK
                  </span>
                  <span className="text-yellow-400 font-bold text-sm">
                    AGENT
                  </span>
                  <span className="text-yellow-400 font-bold text-sm">
                    SCORE
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      rank: "🥇 1",
                      name: "Autoppia Operator",
                      score: "72",
                      color: "yellow",
                    },
                    {
                      rank: "🥈 2",
                      name: "Browser Use Gpt 5",
                      score: "65",
                      color: "cyan",
                    },
                    {
                      rank: "🥉 3",
                      name: "Browser Use Claude 4.5 Sonnet",
                      score: "56",
                      color: "blue",
                    },
                  ].map((entry, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-in-right",
                        entry.color === "yellow" &&
                          "bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/30",
                        entry.color === "cyan" &&
                          "bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30",
                        entry.color === "blue" &&
                          "bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30"
                      )}
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <span
                        className={cn(
                          "font-bold text-sm",
                          entry.color === "yellow" && "text-yellow-400",
                          entry.color === "cyan" && "text-cyan-400",
                          entry.color === "blue" && "text-blue-400"
                        )}
                      >
                        {entry.rank}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {entry.name}
                      </span>
                      <span
                        className={cn(
                          "font-bold text-sm",
                          entry.color === "yellow" && "text-yellow-400",
                          entry.color === "cyan" && "text-cyan-400",
                          entry.color === "blue" && "text-blue-400"
                        )}
                      >
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Test Your Agent Section */}
      <section className="relative px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <PiFlaskDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-center"
            >
              Test Your Agent
            </Title>
          </div>

          <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05),transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/5 to-pink-500/5 animate-shimmer"></div>

            <div className="relative p-8 sm:p-10 md:p-12 text-center flex flex-col items-center">
              <Text className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 leading-relaxed">
                Want to see your Web Agent in action? Configure a benchmark run
                by selecting websites, use cases, and prompts. Define how many
                runs you want, point us to your agent&apos;s endpoint, and let{" "}
                <span className="text-purple-300 font-bold bg-purple-400/20 px-3 py-1.5 rounded-lg border border-purple-400/30 animate-pulse-slow">
                  IWA
                </span>{" "}
                do the rest.
              </Text>
              <Link href={routes.testAgent}>
                <button className="px-8 w-fit py-4 bg-gradient-to-r from-purple-500/60 to-pink-500/60 border-2 border-purple-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-purple-500 hover:to-pink-500 hover:border-purple-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50">
                  <PiFlaskDuotone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  START TESTING NOW
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
