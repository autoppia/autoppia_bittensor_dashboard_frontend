"use client";

import { useState, useEffect } from "react";
import { Title, Text } from "rizzui/typography";
import { Button } from "rizzui";
import Link from "next/link";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import { WebsiteItem } from "./cardItem";
import { LuTrophy, LuFileText, LuNetwork } from "react-icons/lu";
import {
  PiFlaskDuotone,
  PiRocketLaunchDuotone,
  PiCheckCircleDuotone,
  PiGearDuotone,
  PiTargetDuotone,
  PiSparkle,
  PiLightningDuotone,
} from "react-icons/pi";
import cn from "@core/utils/class-names";
import { FaArrowRight, FaGithub } from "react-icons/fa";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "Infinity Web Arena";
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-20 md:py-32 overflow-hidden">
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
            <Link href={routes.testAgent} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25">
                <PiFlaskDuotone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                TEST YOUR AGENT
                <PiLightningDuotone className="h-5 w-5 group-hover:animate-bounce" />
              </button>
            </Link>
            <Link href={routes.overview} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/25">
                <LuTrophy className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                VIEW LEADERBOARD
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a
              href="https://github.com/autoppia"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25">
                <LuFileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                READ THE PAPER
              </button>
            </a>
          </div>

          {/* Stats Counter - cleaner design */}
          <div
            className={cn(
              "grid grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 max-w-3xl mx-auto transition-all duration-1000 delay-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            )}
          >
            {[
              {
                value: websitesData.length,
                label: "Websites",
                gradient: "from-cyan-400 to-blue-500",
                glow: "group-hover:shadow-cyan-400/20",
              },
              {
                value: "1000+",
                label: "Tasks",
                gradient: "from-yellow-400 to-orange-500",
                glow: "group-hover:shadow-yellow-400/20",
              },
              {
                value: (
                  <span className="inline-block scale-150 align-baseline text-purple-400">
                    ∞
                  </span>
                ),
                label: "Scalability",
                gradient: "from-purple-400 to-pink-500",
                glow: "group-hover:shadow-purple-400/20",
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
                    "text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2",
                    stat.gradient
                  )}
                >
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is IWA Section */}
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <PiTargetDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center"
            >
              What is IWA?
            </Title>
          </div>

          <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-shimmer"></div>

            <div className="relative p-8 sm:p-10 md:p-12 flex flex-col items-center">
              <Text className="text-base sm:text-lg md:text-xl text-cyan-100 mb-6">
                Infinite Web Arena (IWA) is a{" "}
                <span className="text-yellow-300 font-bold bg-yellow-400/20 px-3 py-1.5 rounded-lg border border-yellow-400/30 animate-pulse-slow">
                  synthetic benchmark
                </span>{" "}
                for Web Agents. Unlike static human-curated datasets, IWA
                dynamically generates synthetic websites, tasks, and validation
                tests. This ensures{" "}
                <span className="text-cyan-300 font-bold bg-cyan-400/20 px-3 py-1.5 rounded-lg border border-cyan-400/30 animate-pulse-slow">
                  infinite scalability
                </span>
                , no overfitting, and realistic performance evaluation.
              </Text>

              <div className="flex flex-col sm:flex-row gap-6">
                <a
                  href="https://autoppia.com/papers/infinite-web-arena.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/40 hover:border-cyan-300 rounded-xl text-cyan-200 hover:text-cyan-100 font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 group/link"
                >
                  <span className="text-lg">Read the Paper</span>
                  <FaArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://github.com/autoppia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 px-6 py-3 bg-gradient-to-r from-black/10 to-black border-2 rounded-xl text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black-800/50 group/link"
                >
                  <FaGithub className="h-5 w-5" />
                  <span className="text-lg">View on GitHub</span>
                  <FaArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
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
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
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
          <span className="text-yellow-300 font-bold bg-yellow-400/20 px-3 py-1.5 rounded-lg border border-yellow-400/30">
            {websitesData.length} synthetic websites
          </span>{" "}
          covering e-commerce, dining, CRM, email, delivery, lodging, and
          professional networking.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {websitesData.map((website, index) => (
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
              SEE ALL {websitesData.length} PROJECTS
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
      {/* About Bittensor */}
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <LuNetwork className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent text-center"
            >
              About Bittensor
            </Title>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_70%)]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 animate-shimmer" />

            <div className="relative p-8 sm:p-10 md:p-12 space-y-6">
              <Text className="text-base sm:text-lg md:text-xl text-cyan-100 leading-relaxed">
                <span className="font-semibold text-cyan-300">Bittensor</span>{" "}
                is an open network that rewards machine intelligence services.
                Miners (model providers) compete by serving useful inference,
                and validators measure quality to allocate incentives.
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(34,211,238,0.08)",
                    borderColor: "rgba(34,211,238,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PiTargetDuotone className="w-5 h-5 text-cyan-300" />
                    <span className="text-white font-semibold">
                      Subnet36: Web Agents
                    </span>
                  </div>
                  <Text className="text-cyan-100 text-sm leading-relaxed">
                    We operate <span className="text-cyan-300">subnet36</span>,
                    focused on evaluating and routing
                    <span className="text-cyan-300"> web agents</span> by real
                    task performance.
                  </Text>
                </div>

                <div
                  className="p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(34,211,238,0.08)",
                    borderColor: "rgba(34,211,238,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LuTrophy className="w-5 h-5 text-cyan-300" />
                    <span className="text-white font-semibold">
                      Top Miner: Autoppia Agent
                    </span>
                  </div>
                  <Text className="text-cyan-100 text-sm leading-relaxed">
                    The current leader is the{" "}
                    <span className="text-cyan-300">Autoppia Agent</span>,
                    selected via{" "}
                    <span className="text-cyan-300">dynamic routing</span> to
                    the highest-scoring miner.
                  </Text>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href={routes.overview} className="w-full sm:w-auto">
                  <button className="px-8 py-4 bg-gradient-to-r from-cyan-500/60 to-teal-500/60 border-2 border-cyan-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-cyan-500 hover:to-teal-500 hover:border-cyan-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50">
                    <LuTrophy className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    VIEW SUBNET LEADERBOARD
                  </button>
                </Link>
                <a
                  href="https://autoppia.com/papers/infinite-web-arena.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-2 border-teal-400/40 hover:border-teal-300 rounded-xl text-teal-200 hover:text-teal-100 font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-teal-500/30 group/link"
                >
                  <span className="text-lg">Read the IWA Paper</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why Bittensor */}
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 justify-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <PiLightningDuotone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <Title
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-center"
            >
              Why Bittensor
            </Title>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_70%)]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/5 to-pink-500/5 animate-shimmer" />

            <div className="relative p-8 sm:p-10 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Incentives */}
                <div
                  className="p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(168,85,247,0.08)",
                    borderColor: "rgba(168,85,247,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PiTargetDuotone className="w-5 h-5 text-pink-300" />
                    <span className="text-white font-semibold">
                      Aligned Incentives
                    </span>
                  </div>
                  <Text className="text-purple-100 text-sm leading-relaxed">
                    We <span className="text-pink-300">incentivize miners</span>{" "}
                    to build the best web agents with rewards tied to{" "}
                    <span className="text-pink-300">
                      measured task performance
                    </span>{" "}
                    on our subnet.
                  </Text>
                </div>

                {/* Anti-overfitting via IWA */}
                <div
                  className="p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(168,85,247,0.08)",
                    borderColor: "rgba(168,85,247,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PiFlaskDuotone className="w-5 h-5 text-pink-300" />
                    <span className="text-white font-semibold">
                      IWA: Anti-Overfitting
                    </span>
                  </div>
                  <Text className="text-purple-100 text-sm leading-relaxed">
                    <span className="text-pink-300">Infinity Web Arena</span>{" "}
                    feeds the subnet with synthetic, ever-changing tasks and
                    sites—preventing memorization and pushing
                    <span className="text-pink-300"> generalization</span>.
                  </Text>
                </div>

                {/* Dynamic routing to best miner */}
                <div
                  className="p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(168,85,247,0.08)",
                    borderColor: "rgba(168,85,247,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LuTrophy className="w-5 h-5 text-pink-300" />
                    <span className="text-white font-semibold">
                      Dynamic Routing
                    </span>
                  </div>
                  <Text className="text-purple-100 text-sm leading-relaxed">
                    Requests route to the{" "}
                    <span className="text-pink-300">top-scoring miner</span> in
                    real time— today that’s the{" "}
                    <span className="text-pink-300">Autoppia Agent</span>.
                  </Text>
                </div>

                {/* Clear, machine-checkable scoring */}
                <div
                  className="p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(168,85,247,0.08)",
                    borderColor: "rgba(168,85,247,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PiLightningDuotone className="w-5 h-5 text-pink-300" />
                    <span className="text-white font-semibold">
                      Unambiguous Rewards
                    </span>
                  </div>
                  <Text className="text-purple-100 text-sm leading-relaxed">
                    Scoring uses{" "}
                    <span className="text-pink-300">
                      machine-checkable goals
                    </span>{" "}
                    across UI and backend effects, keeping rewards objective and
                    reproducible.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16 mb-16">
        <div className="relative rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl border-2 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12">
            <div>
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
              <Text className="text-base sm:text-lg text-orange-100 mb-6 leading-relaxed">
                Discover which{" "}
                <span className="text-yellow-300 font-bold bg-yellow-400/20 px-3 py-1.5 rounded-lg border border-yellow-400/30">
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
              <Link href={routes.overview}>
                <button className="px-8 py-4 bg-gradient-to-r from-yellow-500/60 to-orange-500/60 border-2 border-yellow-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/50">
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
                      name: "Autoppia Agent",
                      score: "95.2",
                      color: "yellow",
                    },
                    {
                      rank: "🥈 2",
                      name: "Browser-Use GPT-5",
                      score: "92.8",
                      color: "cyan",
                    },
                    {
                      rank: "🥉 3",
                      name: "OpenAI CUA Agent",
                      score: "89.5",
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
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16">
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
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
