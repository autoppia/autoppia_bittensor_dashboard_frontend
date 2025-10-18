"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { websitesData } from "@/data/websites-data";
import Image from "next/image";
import Link from "next/link";
import { Title, Text, Button } from "rizzui";
import {
  PiArrowLeftBold,
  PiGlobeBold,
  PiRocketLaunchBold,
  PiCheckCircleDuotone,
  PiLightbulbDuotone,
} from "react-icons/pi";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const websiteSlug = params?.name as string;
  const website = websitesData.find((w) => w.slug === websiteSlug);

  // ✅ Show all use cases initially
  const [useCases, setUseCases] = useState(website?.useCases || []);
  const [loading, setLoading] = useState(false);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 255, b: 255 };
  };

  const rgb = hexToRgb(website?.color || "#00FFFF");
  const colorWithOpacity10 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const colorWithOpacity20 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
  const colorBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

  // ✅ Refresh tasks from API and update useCases state
  const handleRefresh = async () => {
    if (!website) return;
    setLoading(true);

    try {
      const response = await fetch(
        "http://84.247.180.192:5080/generate-tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projects: [website.slug],
            num_of_runs: 2,
            selective_use_cases: [],
            prompts_per_use_case: 1,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      // Handle the API response structure
      let projectData;
      if (data.generated_tasks && Array.isArray(data.generated_tasks)) {
        // API returns { generated_tasks: [...] }
        projectData = data.generated_tasks.find(
          (item: any) => item.project_id === website.slug
        );
      } else if (Array.isArray(data)) {
        // Direct array response
        projectData = data.find(
          (item: any) => item.project_id === website.slug
        );
      } else if (data && typeof data === "object") {
        // Single object response
        projectData = data;
      }

      console.log("Project Data:", projectData); // Debug log

      if (projectData && projectData.tasks) {
        console.log("Tasks found:", projectData.tasks); // Debug log

        // Convert API response to useCases format
        const newUseCases = Object.entries(projectData.tasks).map(
          ([useCaseName, prompts]) => ({
            name: useCaseName
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            examplePrompt: Array.isArray(prompts) ? prompts : [prompts],
          })
        );

        console.log("New Use Cases:", newUseCases); // Debug log

        // Update all use cases from API
        setUseCases(newUseCases);
        console.log("Updated use cases to:", newUseCases); // Debug log
      } else {
        console.log("No project data or tasks found"); // Debug log
      }
    } catch (err) {
      console.error("❌ Failed to refresh data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Title className="text-2xl mb-4">Website Not Found</Title>
        <Button onClick={() => router.push("/websites")}>
          <PiArrowLeftBold className="me-2" />
          Back to Websites
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="text"
          onClick={() => router.push("/websites")}
          className="mb-6 hover:bg-white/5 transition-all duration-300 group"
        >
          <PiArrowLeftBold className="me-2 group-hover:-translate-x-1 transition-transform" />
          Back to All Websites
        </Button>

        <div className="relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-3xl overflow-hidden mb-12 backdrop-blur-sm transition-all duration-300 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12">
            <div
              className="relative aspect-video rounded-2xl overflow-hidden border-2 shadow-2xl group"
              style={{ borderColor: colorBorder }}
            >
              <Image
                src={website.image}
                alt={website.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className="px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm border-2"
                    style={{
                      backgroundColor: colorWithOpacity20,
                      borderColor: colorBorder,
                      color: website.color,
                    }}
                  >
                    {website.origin}
                  </div>
                  {!website.isComingSoon && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                      <PiCheckCircleDuotone className="w-4 h-4 text-emerald-400" />
                      <Text className="text-xs font-bold text-emerald-300">
                        Active
                      </Text>
                    </div>
                  )}
                </div>

                <Title
                  as="h1"
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${website.color}, ${colorWithOpacity10})`,
                  }}
                >
                  {website.name}
                </Title>
                <Text className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {website.description || "No description available."}
                </Text>
              </div>

              {!website.isComingSoon && website.href !== "#" && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex-1"
                  >
                    <Button
                      size="lg"
                      className="w-full text-white group-hover/btn:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-2"
                      style={{
                        backgroundColor: website.color,
                        borderColor: website.color,
                      }}
                    >
                      <PiGlobeBold className="me-2 h-5 w-5 text-white group-hover/btn:rotate-12 transition-transform" />
                      Visit Website
                      <FaExternalLinkAlt className="ms-2 h-4 w-4 text-white" />
                    </Button>
                  </Link>
                  <a
                    href={`https://github.com/autoppia/${website.name.toLocaleLowerCase()}_webs_demo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/github"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-black hover:bg-black/50 text-white border-2 border-black/50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-gray-500/50"
                    >
                      <FaGithub className="me-2 h-5 w-5 group-hover/github:rotate-12 transition-transform" />
                      View Demo
                    </Button>
                  </a>
                </div>
              )}

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl border-2 backdrop-blur-sm"
                style={{
                  backgroundColor: colorWithOpacity10,
                  borderColor: colorBorder,
                }}
              >
                <div className="gap-4 sm:gap-0 items-center text-center flex flex-row sm:flex-col">
                  <Text
                    className="text-3xl font-bold mb-1"
                    style={{ color: website.color }}
                  >
                    {website.useCases.length}
                  </Text>
                  <Text className="text-xs text-white font-medium">
                    Use Cases
                  </Text>
                </div>
                <div className="gap-4 sm:gap-0 items-center text-center flex flex-row sm:flex-col">
                  <Text
                    className="text-3xl font-bold mb-1"
                    style={{ color: website.color }}
                  >
                    {website.avgDifficulty}/10
                  </Text>
                  <Text className="text-xs text-white font-medium">
                    Avg Difficulty
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8 w-full">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${website.color}, ${colorWithOpacity10})`,
                  }}
                >
                  <PiRocketLaunchBold className="h-7 w-7 text-white" />
                </div>
                <Title
                  as="h2"
                  className="text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${website.color}, ${colorWithOpacity10})`,
                  }}
                >
                  Use Cases
                </Title>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-bold transition-all"
                style={{
                  backgroundImage: `linear-gradient(to right, ${website.color}, ${colorWithOpacity10})`,
                }}
              >
                <FiRefreshCcw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {useCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="group/card relative rounded-2xl border-2 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                  style={{
                    backgroundColor: colorWithOpacity10,
                    borderColor: colorBorder,
                  }}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: website.color }}
                      >
                        {index + 1}
                      </div>
                      <Title
                        as="h3"
                        className="text-xl font-bold text-gray-100 mb-1"
                      >
                        {useCase.name}
                      </Title>
                    </div>

                    <div className="space-y-2">
                      <Text className="text-sm font-semibold text-white flex items-center gap-2">
                        <PiLightbulbDuotone className="w-5 h-5" />
                        Example Prompts:
                      </Text>

                      {useCase.examplePrompt?.map((prompt, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl text-sm italic border backdrop-blur-sm"
                          style={{
                            backgroundColor: colorWithOpacity10,
                            borderColor: colorBorder,
                            color: "#D1D5DB",
                          }}
                        >
                          &quot;{prompt}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text className="text-white text-lg">No use cases found.</Text>
          )}
        </div>
      </div>
    </div>
  );
}
