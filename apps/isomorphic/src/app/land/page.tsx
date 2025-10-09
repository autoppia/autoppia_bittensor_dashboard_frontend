"use client";

import { useState, useEffect } from "react";
import { Title, Text } from "rizzui/typography";
import { Button } from "rizzui";
import Link from "next/link";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import { WebsiteItem } from "./cardItem";
import { LuTrophy, LuFileText } from "react-icons/lu";
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
import { FaArrowRight } from "react-icons/fa";

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
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-gradient"></div>
        <div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
            transition: "all 0.3s ease-out",
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:max-w-[1400px] 2xl:mx-auto w-full py-16 md:py-24">
        <div
          className={cn(
            "relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-3xl p-10 sm:p-16 backdrop-blur-xl transition-all duration-1000 shadow-2xl overflow-hidden group",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl animate-border-flow"></div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`,
                }}
              ></div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Animated Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-2xl animate-bounce-slow">
                  <PiSparkle className="w-10 h-10 text-white animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Typing Animation Title */}
            <Title
              as="h1"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent min-h-[1.2em] px-2"
            >
              {displayedText}
              <span className="animate-blink">|</span>
            </Title>

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
                synthetic benchmark designed to rigorously test and evaluate Web
                Agents across dynamic, ever-changing web environments.
              </Text>
            </div>

            {/* Animated CTA Buttons */}
            <div
              className={cn(
                "flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center mt-10 transition-all duration-1000 delay-700 px-4",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              )}
            >
              <Link href={routes.testAgent} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 border-2 border-blue-500/60 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm group hover:from-blue-500 hover:to-cyan-500 hover:border-blue-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50">
                  <PiFlaskDuotone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  TEST YOUR AGENT
                  <PiLightningDuotone className="h-5 w-5 group-hover:animate-bounce" />
                </button>
              </Link>
              <Link href={routes.overview} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-yellow-500/60 to-orange-500/60 border-2 border-yellow-500/60 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm group hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/50">
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
                <button className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-purple-500/60 to-pink-500/60 border-2 border-purple-500/60 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm group hover:from-purple-500 hover:to-pink-500 hover:border-purple-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50">
                  <LuFileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  READ THE PAPER
                </button>
              </a>
            </div>

            {/* Stats Counter */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-2xl mx-auto px-4">
              {[
                {
                  value: websitesData.length,
                  label: "Websites",
                  color: "cyan",
                },
                { value: "1000+", label: "Tasks", color: "yellow" },
                { value: "∞", label: "Scalability", color: "purple" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 sm:p-6 rounded-xl backdrop-blur-sm border-2 transition-all duration-500 hover:scale-110 hover:shadow-xl",
                    stat.color === "cyan" &&
                      "border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-cyan-500/30",
                    stat.color === "yellow" &&
                      "border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-yellow-500/30",
                    stat.color === "purple" &&
                      "border-purple-500/30 hover:border-purple-400/50 hover:shadow-purple-500/30"
                  )}
                  style={{
                    animationDelay: `${idx * 200}ms`,
                  }}
                >
                  <div
                    className={cn(
                      "text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      stat.color === "cyan" && "from-cyan-400 to-blue-500",
                      stat.color === "yellow" &&
                        "from-yellow-400 to-orange-500",
                      stat.color === "purple" && "from-purple-400 to-pink-500"
                    )}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={cn(
                      "text-xs sm:text-sm mt-1 font-bold",
                      stat.color === "cyan" && "text-cyan-300",
                      stat.color === "yellow" && "text-yellow-300",
                      stat.color === "purple" && "text-purple-300"
                    )}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
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

            <div className="relative p-8 sm:p-10 md:p-12">
              <Text className="text-base sm:text-lg md:text-xl text-cyan-100 mb-6 leading-relaxed">
                Infinity Web Arena (IWA) is a{" "}
                <span className="text-yellow-300 font-bold bg-yellow-400/20 px-3 py-1.5 rounded-lg border border-yellow-400/30 animate-pulse-slow">
                  synthetic benchmark
                </span>{" "}
                for Web Agents. Unlike static human-curated datasets, IWA
                dynamically generates synthetic websites, tasks, and validation
                tests. This ensures{" "}
                <span className="text-cyan-300 font-bold bg-cyan-400/20 px-3 py-1.5 rounded-lg border border-cyan-400/30 animate-pulse-slow">
                  infinite scalability
                </span>
                , no dataset leakage, and realistic performance evaluation.
              </Text>
              <a
                href="https://github.com/autoppia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/40 hover:border-yellow-300 rounded-xl text-yellow-200 hover:text-yellow-100 font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30 group/link"
              >
                <span className="text-lg">Read the Paper</span>
                <FaArrowRight className="group-hover/link:translate-x-1 transition-transform" />
              </a>
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
                title: "Agent Execution in Real Browsers",
                desc: "Your Web Agent interacts with real DOMs, dynamic UIs, and realistic workflows.",
                color: "from-blue-400 to-purple-500",
                borderColor: "border-blue-500/30 hover:border-blue-400/50",
                shadowColor: "hover:shadow-blue-500/30",
              },
              {
                num: 3,
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

            <div className="relative p-8 sm:p-10 md:p-12 text-center">
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
                <button className="px-8 py-4 bg-gradient-to-r from-purple-500/60 to-pink-500/60 border-2 border-purple-500/60 rounded-xl text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm group hover:from-purple-500 hover:to-pink-500 hover:border-purple-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50">
                  <PiFlaskDuotone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  START TESTING NOW
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
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
                      name: "Browser-Use GPT-5",
                      score: "95.2",
                      color: "yellow",
                    },
                    {
                      rank: "🥈 2",
                      name: "Autoppia Agent",
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

      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-30px, 30px) rotate(-120deg);
          }
          66% {
            transform: translate(20px, -20px) rotate(-240deg);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, 20px) scale(1.1);
          }
        }

        @keyframes particle {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }

        @keyframes bounce-x {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes border-flow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-gradient {
          animation: gradient 15s ease infinite;
          background-size: 400% 400%;
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
        .animate-particle {
          animation: particle linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-blink {
          animation: blink 1s step-start infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
          background-size: 200% 100%;
        }
        .animate-bounce-x {
          animation: bounce-x 2s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-border-flow {
          animation: border-flow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
