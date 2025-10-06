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
          <Text className="text-xl md:text-2xl text-gray-300 mb-8">
            Infinity Web Arena (IWA) is the most advanced synthetic benchmark,
            designed to rigorously test and evaluate Web Agents across dynamic,
            ever-changing web environments.
          </Text>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={routes.testAgent}>
              <Button
                size="lg"
                className={cn(
                  "font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
                  "shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300",
                  "border border-cyan-400/50 hover:border-cyan-300 hover:scale-105"
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
                  "font-semibold border-2 border-yellow-500/50 text-yellow-400 hover:text-yellow-300",
                  "hover:border-yellow-400 hover:bg-yellow-500/10 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
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
                  "font-semibold border-2 border-cyan-500/50 text-cyan-400 hover:text-cyan-300",
                  "hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
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
        <div className="max-w-4xl mx-auto p-8 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/20">
          <Title
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-6 text-cyan-400"
          >
            What is IWA?
          </Title>
          <Text className="text-lg text-gray-300 mb-6 leading-relaxed">
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
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-semibold transition-all duration-300 hover:translate-x-2"
          >
            👉 Read the Paper <LuArrowRight className="ml-2" />
          </a>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto">
          <Title
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-8 text-center text-cyan-400"
          >
            How It Works
          </Title>
          <div className="space-y-6">
            <div className="flex gap-4 p-6 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-transparent hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold mb-2 text-yellow-400"
                >
                  Synthetic Task Generation
                </Title>
                <Text className="text-gray-300">
                  IWA continuously creates new, dynamic tasks.
                </Text>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-lg border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold mb-2 text-yellow-400"
                >
                  Agent Execution in Real Browsers
                </Title>
                <Text className="text-gray-300">
                  Your Web Agent interacts with real DOMs, dynamic UIs, and
                  realistic workflows.
                </Text>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-transparent hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold mb-2 text-yellow-400"
                >
                  Automated Synthetic Validation
                </Title>
                <Text className="text-gray-300">
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
            className="text-3xl md:text-4xl font-bold mb-4 text-cyan-400"
          >
            Check Our Web Projects
          </Title>
          <Text className="text-lg text-gray-300">
            IWA includes{" "}
            <span className="text-yellow-400 font-bold">
              15 synthetic websites
            </span>{" "}
            covering e-commerce, cinema, bug tracking, social media, and more.
          </Text>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredProjects.map((website, index) => (
            <div
              key={index}
              className="hover:scale-105 transition-transform duration-300"
            >
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
                "font-semibold border-2 border-cyan-500/50 text-cyan-400 hover:text-cyan-300",
                "hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300",
                "hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 group"
              )}
            >
              See All 15 Projects{" "}
              <LuArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto text-center p-10 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/30">
          <Title
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-6 text-cyan-400"
          >
            Test Your Agent
          </Title>
          <Text className="text-lg text-gray-300 mb-8">
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
                "font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400",
                "shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300",
                "border border-cyan-400/50 hover:border-cyan-300 hover:scale-110"
              )}
            >
              <PiFlask className="mr-2" />
              Go to Test Your Agent
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-yellow-500/30 mb-16">
        <div className="max-w-4xl mx-auto text-center p-10 rounded-lg border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/30">
          <Title
            as="h2"
            className="text-3xl md:text-4xl font-bold mb-6 text-yellow-400"
          >
            Leaderboard
          </Title>
          <Text className="text-lg text-gray-100 mb-8 leading-relaxed">
            Discover which{" "}
            <span className="text-yellow-400 font-semibold">SOTA agents</span>{" "}
            are leading the benchmark worldwide.
          </Text>
          <Link href={routes.overview}>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "font-semibold border-2 border-yellow-500/50 text-yellow-400 hover:text-yellow-300",
                "hover:border-yellow-400 hover:bg-yellow-500/10 transition-all duration-300",
                "hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-110 group"
              )}
            >
              <LuTrophy className="mr-2 group-hover:rotate-12 transition-transform" />
              View Leaderboard{" "}
              <LuArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
