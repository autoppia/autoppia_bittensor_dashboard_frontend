"use client";

import { Title, Text } from "rizzui/typography";
import { Button } from "rizzui";
import Link from "next/link";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import { WebsiteItem } from "./cardItem";
import { LuArrowRight, LuTrophy, LuFileText } from "react-icons/lu";
import { PiFlask } from "react-icons/pi";
import cn from "@core/utils/class-names";
import { FaArrowRight } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto px-2">
          <Title
            as="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"
          >
            The Synthetic Benchmark for Web Agents
          </Title>
          <Text className="text-base sm:text-lg md:text-xl lg:text-2xl text-cyan-300 my-8 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] px-2">
            Infinity Web Arena (IWA) is the most advanced synthetic benchmark,
            designed to rigorously test and evaluate Web Agents across dynamic,
            ever-changing web environments.
          </Text>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-2">
            <Link href={routes.testAgent}>
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "font-semibold border-2 bg-transparent border-blue-500/50 text-blue-300 hover:text-white",
                  "hover:border-blue-400 hover:bg-blue-500/20 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-blue-500/30"
                )}
              >
                <PiFlask className="mr-2" />
                Test Your Agent
              </Button>
            </Link>
            <Link href={routes.overview}>
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "font-semibold border-2 border-yellow-500/50 text-yellow-300 hover:text-white",
                  "hover:border-yellow-400 hover:bg-yellow-500/20 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-yellow-500/30"
                )}
              >
                <LuTrophy className="mr-2" />
                Check the Leaderboard
              </Button>
            </Link>
            <a
              href="https://github.com/autoppia"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "font-semibold border-2 border-cyan-500/50 text-cyan-300 hover:text-white",
                  "hover:border-cyan-400 hover:bg-cyan-500/20 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-cyan-500/30"
                )}
              >
                <LuFileText className="mr-2" />
                Read the Paper
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto">
          <Title
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)] px-2"
          >
            What is IWA?
          </Title>

          <div className="group relative p-4 sm:p-6 md:p-8 rounded-lg bg-black border border-cyan-400/30 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500">
            {/* Cyberpunk Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

            <div className="relative">
              <Text className="text-base sm:text-lg text-cyan-300 mb-6 leading-relaxed font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
                Infinity Web Arena (IWA) is a{" "}
                <span className="text-yellow-400 font-semibold">
                  synthetic benchmark
                </span>{" "}
                for Web Agents. Unlike static human-curated datasets, IWA
                dynamically generates synthetic websites, tasks, and validation
                tests. This ensures
                <span className="text-cyan-400 font-semibold">
                  {" "}
                  infinite scalability
                </span>
                , no dataset leakage, and realistic performance evaluation.
              </Text>
              <a
                href="https://github.com/autoppia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-yellow-300 hover:text-white font-semibold transition-all duration-300 hover:translate-x-2 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
              >
                👉 Read the Paper <LuArrowRight className="ml-2" />
              </a>
            </div>

            {/* Cyberpunk Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto">
          <Title
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)] px-2"
          >
            How It Works
          </Title>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg bg-black border border-cyan-400/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-lg shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                1
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                >
                  Synthetic Task Generation
                </Title>
                <Text className="text-sm sm:text-base text-cyan-300 font-mono">
                  IWA continuously creates new, dynamic tasks.
                </Text>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg bg-black border border-blue-400/30 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-lg shadow-blue-500/50 drop-shadow-[0_0_8px_rgba(59,130,246,1)]">
                2
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                >
                  Agent Execution in Real Browsers
                </Title>
                <Text className="text-sm sm:text-base text-cyan-300 font-mono">
                  Your Web Agent interacts with real DOMs, dynamic UIs, and
                  realistic workflows.
                </Text>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg bg-black border border-cyan-400/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-lg shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                3
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                >
                  Automated Synthetic Validation
                </Title>
                <Text className="text-sm sm:text-base text-cyan-300 font-mono">
                  Success is verified through predefined conditions across
                  frontend and backend, ensuring unambiguous scoring.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)]">
            Check Our Web Projects
          </h2>
          <p className="text-lg text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
            IWA includes{" "}
            <span className="text-yellow-400 font-bold">
              {websitesData.length} synthetic websites
            </span>{" "}
            covering e-commerce, cinema, bug tracking, social media, and more.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {websitesData.map((website, index) => (
            <div key={index} className="transition-transform duration-300">
              <WebsiteItem website={website} />
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/websites">
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "font-semibold border-2 border-cyan-500/50 text-cyan-300 hover:text-white",
                "hover:border-cyan-400 hover:bg-cyan-500/20 transition-all duration-300",
                "hover:shadow-lg hover:shadow-cyan-500/30 group"
              )}
            >
              See All {websitesData.length} Projects{" "}
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto">
          <Title
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)] px-2"
          >
            Test Your Agent
          </Title>

          <div className="group relative text-center p-4 sm:p-6 md:p-8 rounded-lg bg-black border border-cyan-400/30 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500">
            {/* Cyberpunk Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

            <div className="relative">
              <Text className="text-base sm:text-lg text-cyan-300 mb-6 sm:mb-8 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
                {`Want to see your Web Agent in action? Configure a benchmark run by
                selecting websites, use cases, and prompts. Define how many runs you
                want, point us to your agent's IP/port, and let `}
                <span className="text-yellow-400 font-semibold">IWA</span>
                {` do the rest.`}
              </Text>
              <Link href={routes.agent_run}>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "font-semibold border-2 bg-transparent border-cyan-500/50 text-cyan-300 hover:text-white",
                    "hover:border-cyan-400 hover:bg-cyan-500/20 transition-all duration-300",
                    "hover:shadow-lg hover:shadow-cyan-500/30"
                  )}
                >
                  <PiFlask className="mr-2" />
                  Go to Test Your Agent
                </Button>
              </Link>
            </div>

            {/* Cyberpunk Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-yellow-500/30 mb-16">
        <div className="group relative max-w-6xl mx-auto p-4 sm:p-6 md:p-10 rounded-lg bg-black border border-yellow-400/30 overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/50 hover:border-yellow-400 transition-all duration-500">
          {/* Cyberpunk Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 via-transparent to-orange-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center border-2 border-yellow-400 shadow-2xl shadow-yellow-500/80 flex-shrink-0">
                  <LuTrophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,1)]" />
                </div>
                <Title
                  as="h2"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,1)]"
                >
                  Leaderboard
                </Title>
              </div>
              <Text className="text-base sm:text-lg text-yellow-300 mb-4 sm:mb-6 leading-relaxed font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                Discover which{" "}
                <span className="text-yellow-400 font-semibold">
                  SOTA agents
                </span>{" "}
                are leading the benchmark worldwide. Our leaderboard tracks
                real-time performance across all synthetic tasks, ranking agents
                by accuracy, speed, and overall success rate.
              </Text>
              <Text className="text-sm sm:text-base text-cyan-300 mb-6 sm:mb-8 font-mono">
                ⚡ Real-time rankings
                <br />
                📊 Comprehensive metrics
                <br />
                🏆 Global competition
              </Text>
              <Link href={routes.overview}>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "font-semibold border-2 border-yellow-500/50 text-yellow-300 hover:text-white",
                    "hover:border-yellow-400 hover:bg-yellow-500/20 transition-all duration-300",
                    "hover:shadow-lg hover:shadow-yellow-500/30 group"
                  )}
                >
                  <LuTrophy className="mr-2 group-hover:rotate-12 transition-transform" />
                  View Leaderboard{" "}
                  <LuArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right: Leaderboard Preview/Image */}
            <div className="relative">
              <div className="relative bg-black/50 border border-yellow-400/30 rounded-lg p-3 sm:p-4 md:p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-yellow-400/30">
                  <span className="text-yellow-400 font-semibold font-mono text-xs sm:text-sm">
                    RANK
                  </span>
                  <span className="text-yellow-400 font-semibold font-mono text-xs sm:text-sm">
                    AGENT
                  </span>
                  <span className="text-yellow-400 font-semibold font-mono text-xs sm:text-sm">
                    SCORE
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                    <span className="text-yellow-400 font-bold font-mono text-xs sm:text-sm">
                      🥇 1
                    </span>
                    <span className="text-cyan-300 font-mono text-xs sm:text-sm">
                      Browser-Use GPT-5 Agent
                    </span>
                    <span className="text-yellow-400 font-bold font-mono text-xs sm:text-sm">
                      95.2
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                    <span className="text-cyan-400 font-bold font-mono text-xs sm:text-sm">
                      🥈 2
                    </span>
                    <span className="text-cyan-300 font-mono text-xs sm:text-sm">
                      Autoppia Agent
                    </span>
                    <span className="text-cyan-400 font-bold font-mono text-xs sm:text-sm">
                      92.8
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <span className="text-blue-400 font-bold font-mono text-xs sm:text-sm">
                      🥉 3
                    </span>
                    <span className="text-cyan-300 font-mono text-xs sm:text-sm">
                      OpenAI CUA Agent
                    </span>
                    <span className="text-blue-400 font-bold font-mono text-xs sm:text-sm">
                      89.5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cyberpunk Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"></div>
        </div>
      </section>
    </div>
  );
}
