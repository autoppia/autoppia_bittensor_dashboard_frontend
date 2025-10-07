"use client";

import { Title, Text } from "rizzui/typography";
import { Button } from "rizzui";
import Link from "next/link";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import WebsiteItem from "../websites/website-item";
import { LuArrowRight, LuTrophy, LuFileText } from "react-icons/lu";
import { PiFlask } from "react-icons/pi";
import cn from "@core/utils/class-names";

export default function LandingPage() {
  const featuredProjects = websitesData.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Title
            as="h1"
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"
          >
            The Synthetic Benchmark for Web Agents
          </Title>
          <Text className="text-xl md:text-2xl text-cyan-300 mb-8 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
            Infinity Web Arena (IWA) is the most advanced synthetic benchmark,
            designed to rigorously test and evaluate Web Agents across dynamic,
            ever-changing web environments.
          </Text>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={routes.testAgent}>
              <Button
                size="lg"
                className={cn(
                  "font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400",
                  "shadow-lg shadow-blue-500/50 hover:shadow-blue-400/70 transition-all duration-300",
                  "border border-blue-400/50 hover:border-blue-300"
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

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="group relative max-w-4xl mx-auto p-8 rounded-lg bg-black border border-cyan-400/30 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500">
          {/* Cyberpunk Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative">
            <Title
              as="h2"
              className="text-3xl md:text-4xl font-bold mb-6 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)]"
            >
              What is IWA?
            </Title>
            <Text className="text-lg text-cyan-300 mb-6 leading-relaxed font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
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
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto">
          <Title
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-8 text-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)]"
          >
            How It Works
          </Title>
          <div className="space-y-6">
            <div className="flex gap-4 p-6 rounded-lg bg-black border border-cyan-400/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                1
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold mb-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                >
                  Synthetic Task Generation
                </Title>
                <Text className="text-cyan-300 font-mono">
                  IWA continuously creates new, dynamic tasks.
                </Text>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-lg bg-black border border-blue-400/30 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/50 drop-shadow-[0_0_8px_rgba(59,130,246,1)]">
                2
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold mb-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                >
                  Agent Execution in Real Browsers
                </Title>
                <Text className="text-cyan-300 font-mono">
                  Your Web Agent interacts with real DOMs, dynamic UIs, and
                  realistic workflows.
                </Text>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-lg bg-black border border-cyan-400/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(0,255,255,1)]">
                3
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold mb-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                >
                  Automated Synthetic Validation
                </Title>
                <Text className="text-cyan-300 font-mono">
                  Success is verified through predefined conditions across
                  frontend and backend, ensuring unambiguous scoring.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="text-center mb-12">
          <Title
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-4 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)]"
          >
            Check Our Web Projects
          </Title>
          <Text className="text-lg text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
            IWA includes{" "}
            <span className="text-yellow-400 font-bold">
              15 synthetic websites
            </span>{" "}
            covering e-commerce, cinema, bug tracking, social media, and more.
          </Text>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredProjects.map((website, index) => (
            <div key={index} className="transition-transform duration-300">
              <WebsiteItem website={website} />
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href={routes.websites}>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "font-semibold border-2 border-cyan-500/50 text-cyan-300 hover:text-white",
                "hover:border-cyan-400 hover:bg-cyan-500/20 transition-all duration-300",
                "hover:shadow-lg hover:shadow-cyan-500/30 group"
              )}
            >
              See All 15 Projects{" "}
              <LuArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="group relative max-w-4xl mx-auto text-center p-10 rounded-lg bg-black border border-cyan-400/30 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 hover:border-cyan-400 transition-all duration-500">
          {/* Cyberpunk Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative">
            <Title
              as="h2"
              className="text-3xl md:text-4xl font-bold mb-6 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,1)]"
            >
              Test Your Agent
            </Title>
            <Text className="text-lg text-cyan-300 mb-8 font-mono drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              {`Want to see your Web Agent in action? Configure a benchmark run by
              selecting websites, use cases, and prompts. Define how many runs you
              want, point us to your agent's IP/port, and let `}
              <span className="text-yellow-400 font-semibold">IWA</span>
              {` do the rest.`}
            </Text>
            <Link href={routes.agent_run}>
              <Button
                size="lg"
                className={cn(
                  "font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400",
                  "shadow-lg shadow-blue-500/50 hover:shadow-blue-400/70 transition-all duration-300",
                  "border border-blue-400/50 hover:border-blue-300"
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
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-yellow-500/30 mb-16">
        <div className="group relative max-w-6xl mx-auto p-10 rounded-lg bg-black border border-yellow-400/30 overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/50 hover:border-yellow-400 transition-all duration-500">
          {/* Cyberpunk Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 via-transparent to-orange-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border-2 border-yellow-400 shadow-2xl shadow-yellow-500/80">
                  <LuTrophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,1)]" />
                </div>
                <Title
                  as="h2"
                  className="text-3xl md:text-4xl font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,1)]"
                >
                  Leaderboard
                </Title>
              </div>
              <Text className="text-lg text-yellow-300 mb-6 leading-relaxed font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                Discover which{" "}
                <span className="text-yellow-400 font-semibold">
                  SOTA agents
                </span>{" "}
                are leading the benchmark worldwide. Our leaderboard tracks
                real-time performance across all synthetic tasks, ranking agents
                by accuracy, speed, and overall success rate.
              </Text>
              <Text className="text-base text-cyan-300 mb-8 font-mono">
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
              <div className="relative bg-black/50 border border-yellow-400/30 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-yellow-400/30">
                  <span className="text-yellow-400 font-semibold font-mono">
                    RANK
                  </span>
                  <span className="text-yellow-400 font-semibold font-mono">
                    AGENT
                  </span>
                  <span className="text-yellow-400 font-semibold font-mono">
                    SCORE
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                    <span className="text-yellow-400 font-bold font-mono">
                      🥇 1
                    </span>
                    <span className="text-cyan-300 font-mono">GPT-4 Agent</span>
                    <span className="text-yellow-400 font-bold font-mono">
                      95.2
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                    <span className="text-cyan-400 font-bold font-mono">
                      🥈 2
                    </span>
                    <span className="text-cyan-300 font-mono">
                      Claude Agent
                    </span>
                    <span className="text-cyan-400 font-bold font-mono">
                      92.8
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <span className="text-blue-400 font-bold font-mono">
                      🥉 3
                    </span>
                    <span className="text-cyan-300 font-mono">Custom Bot</span>
                    <span className="text-blue-400 font-bold font-mono">
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
