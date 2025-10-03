"use client";

import { Title, Text } from "rizzui/typography";
import { Button } from "rizzui";
import Link from "next/link";
import { routes } from "@/config/routes";
import { websitesData } from "@/data/websites-data";
import WebsiteItem from "../websites/website-item";
import { LuArrowRight, LuTrophy, LuFileText } from "react-icons/lu";
import { PiFlask } from "react-icons/pi";

export default function LandingPage() {
  const featuredProjects = websitesData.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Title
            as="h1"
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            The Synthetic Benchmark for Web Agents
          </Title>
          <Text className="text-xl md:text-2xl mb-8">
            Infinity Web Arena (IWA) is the most advanced synthetic benchmark,
            designed to rigorously test and evaluate Web Agents across dynamic,
            ever-changing web environments.
          </Text>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={routes.testAgent}>
              <Button size="lg" className="font-semibold">
                {/* <LuFlask className="mr-2" /> */}
                Test Your Agent
              </Button>
            </Link>
            <Link href={routes.overview}>
              <Button size="lg" variant="outline" className="font-semibold">
                <LuTrophy className="mr-2" />
                Check the Leaderboard
              </Button>
            </Link>
            <a
              href="https://github.com/autoppia"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="font-semibold">
                <LuFileText className="mr-2" />
                Read the Paper
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <Title as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            What is IWA?
          </Title>
          <Text className="text-lg text-gray-600 mb-6 leading-relaxed">
            Infinity Web Arena (IWA) is a synthetic benchmark for Web Agents.
            Unlike static human-curated datasets, IWA dynamically generates
            synthetic websites, tasks, and validation tests. This ensures
            infinite scalability, no dataset leakage, and realistic performance
            evaluation.
          </Text>
          <a
            href="https://github.com/autoppia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold"
          >
            👉 Read the Paper <LuArrowRight className="ml-2" />
          </a>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <Title as="h2" className="text-3xl md:text-4xl font-bold mb-8">
            How It Works
          </Title>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <Title as="h3" className="text-xl font-semibold mb-2">
                  Synthetic Task Generation
                </Title>
                <Text className="text-gray-600">
                  IWA continuously creates new, dynamic tasks.
                </Text>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <Title as="h3" className="text-xl font-semibold mb-2">
                  Agent Execution in Real Browsers
                </Title>
                <Text className="text-gray-600">
                  Your Web Agent interacts with real DOMs, dynamic UIs, and
                  realistic workflows.
                </Text>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <Title as="h3" className="text-xl font-semibold mb-2">
                  Automated Synthetic Validation
                </Title>
                <Text className="text-gray-600">
                  Success is verified through predefined conditions across
                  frontend and backend, ensuring unambiguous scoring.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <Title as="h2" className="text-3xl md:text-4xl font-bold mb-4">
            Check Our Web Projects
          </Title>
          <Text className="text-lg text-gray-600">
            IWA includes 15 synthetic websites covering e-commerce, cinema, bug
            tracking, social media, and more.
          </Text>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredProjects.map((website, index) => (
            <WebsiteItem key={index} website={website} />
          ))}
        </div>
        <div className="text-center">
          <Link href={routes.websites}>
            <Button size="lg" variant="outline" className="font-semibold">
              See All 15 Projects <LuArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <Title as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            Test Your Agent
          </Title>
          <Text className="text-lg text-gray-600 mb-8">
            Want to see your Web Agent in action? Configure a benchmark run by
            selecting websites, use cases, and prompts. Define how many runs you
            want, point us to your agent's IP/port, and let IWA do the rest.
          </Text>
          <Link href={routes.agent_run}>
            <Button size="lg" className="font-semibold">
              Go to Test Your Agent <LuArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto w-full py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <Title as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            Leaderboard
          </Title>
          <Text className="text-lg text-gray-600 mb-8">
            Discover which SOTA agents are leading the benchmark worldwide.
          </Text>
          <Link href={routes.overview}>
            <Button size="lg" variant="outline" className="font-semibold">
              <LuTrophy className="mr-2" />
              View Leaderboard <LuArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
