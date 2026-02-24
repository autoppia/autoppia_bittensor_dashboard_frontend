"use client";

import { useState } from "react";
import { Title, Text, Button } from "rizzui";
import { websitesData } from "@/data/websites-data";
import WebsiteItem from "./website-item";
import {
  PiGlobeDuotone,
  PiRocketLaunchDuotone,
  PiClockDuotone,
  PiSortAscendingBold,
  PiSortDescendingBold,
} from "react-icons/pi";

type SortOption = "difficulty-asc" | "difficulty-desc" | "name";

// Map slug to web number for ordering (web_1_autocinema -> 1)
const slugToWebNumber: Record<string, number> = {
  autocinema: 1,
  autobooks: 2,
  autozone: 3,
  autodining: 4,
  autocrm: 5,
  automail: 6,
  autodelivery: 7,
  autolodge: 8,
  autoconnect: 9,
  autowork: 10,
  autocalendar: 11,
  autolist: 12,
  autodrive: 13,
  autohealth: 14,
};

function getWebNumber(slug: string): number {
  return slugToWebNumber[slug] || 999; // Put unknown webs at the end
}

export default function Websites() {
  const [sortBy, setSortBy] = useState<SortOption>("difficulty-asc");

  const activeWebsites = websitesData.filter((w) => !w.isComingSoon);
  const comingSoonWebsites = websitesData.filter((w) => w.isComingSoon);

  const sortedActiveWebsites = [...activeWebsites].sort((a, b) => {
    if (sortBy === "difficulty-asc") {
      // First sort by web number, then by difficulty
      const webNumDiff = getWebNumber(a.slug) - getWebNumber(b.slug);
      return webNumDiff !== 0 ? webNumDiff : a.avgDifficulty - b.avgDifficulty;
    }
    if (sortBy === "difficulty-desc") {
      // First sort by web number, then by difficulty
      const webNumDiff = getWebNumber(a.slug) - getWebNumber(b.slug);
      return webNumDiff !== 0 ? webNumDiff : b.avgDifficulty - a.avgDifficulty;
    }
    // Sort by web number for name sort too
    return getWebNumber(a.slug) - getWebNumber(b.slug);
  });

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-3xl p-8 sm:p-12 mb-12 backdrop-blur-sm transition-all duration-300 shadow-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative z-10 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <PiGlobeDuotone className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <Title
                as="h1"
                className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Evaluation Sandbox
              </Title>
            </div>
            <Text className="text-base sm:text-lg text-cyan-300 max-w-3xl mx-auto mb-6">
              Explore our collection of synthetic websites designed for AI agent
              testing and validation
            </Text>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <Text className="text-sm font-semibold text-emerald-300">
                  {activeWebsites.length} Websites
                </Text>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <Text className="text-sm font-semibold text-purple-300">
                  {comingSoonWebsites.length} Coming Soon
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Title
                as="h2"
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent"
              >
                Active Websites
              </Title>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === "difficulty-asc" ? "solid" : "outline"}
                size="sm"
                onClick={() => setSortBy("difficulty-asc")}
                className="gap-1.5"
              >
                <PiSortAscendingBold className="w-4 h-4" />
                Easy First
              </Button>
              <Button
                variant={sortBy === "difficulty-desc" ? "solid" : "outline"}
                size="sm"
                onClick={() => setSortBy("difficulty-desc")}
                className="gap-1.5"
              >
                <PiSortDescendingBold className="w-4 h-4" />
                Hard First
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedActiveWebsites.map((website, index) => (
              <WebsiteItem key={index} website={website} />
            ))}
          </div>
        </div>

        {comingSoonWebsites.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                <PiClockDuotone className="w-6 h-6 text-white" />
              </div>
              <Title
                as="h2"
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
              >
                Coming Soon
              </Title>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {comingSoonWebsites.map((website, index) => (
                <WebsiteItem key={index} website={website} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
