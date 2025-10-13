"use client";

import { useParams, useRouter } from "next/navigation";
import { websitesData } from "@/data/websites-data";
import Image from "next/image";
import Link from "next/link";
import { Title, Text, Button } from "rizzui";
import cn from "@core/utils/class-names";
import {
  PiArrowLeftBold,
  PiGlobeBold,
  PiRocketLaunchBold,
  PiCheckCircleDuotone,
  PiLightbulbDuotone,
} from "react-icons/pi";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const websiteSlug = params?.name as string;

  const website = websitesData.find((w) => w.slug === websiteSlug);

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

  const rgb = hexToRgb(website.color);
  const colorWithOpacity10 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const colorWithOpacity20 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
  const colorBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

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
                className="grid grid-cols-3 gap-4 p-6 rounded-2xl border-2 backdrop-blur-sm"
                style={{
                  backgroundColor: colorWithOpacity10,
                  borderColor: colorBorder,
                }}
              >
                <div className="text-center">
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
                <div className="text-center">
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
                <div className="text-center">
                  <Text
                    className="text-3xl font-bold mb-1"
                    style={{ color: website.color }}
                  >
                    {website.completionRate}%
                  </Text>
                  <Text className="text-xs text-white font-medium">
                    Completion Rate
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
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

          {website.useCases && website.useCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {website.useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="group/card relative rounded-2xl border-2 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                  style={{
                    backgroundColor: colorWithOpacity10,
                    borderColor: colorBorder,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = website.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colorBorder;
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${colorWithOpacity20}, transparent 70%)`,
                    }}
                  ></div>

                  <div className="relative p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover/card:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: website.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Title
                          as="h3"
                          className="text-xl font-bold text-gray-100 mb-1"
                        >
                          {useCase.name}
                        </Title>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PiLightbulbDuotone
                          className="w-5 h-5"
                          style={{ color: website.color }}
                        />
                        <Text className="text-sm font-semibold text-white">
                          Example Prompts:
                        </Text>
                      </div>
                      <div className="space-y-2">
                        {useCase.examplePrompt.map((prompt, promptIndex) => (
                          <div
                            key={promptIndex}
                            className="p-4 rounded-xl text-sm italic leading-relaxed border backdrop-blur-sm"
                            style={{
                              backgroundColor: colorWithOpacity10,
                              borderColor: colorBorder,
                              color: "#D1D5DB",
                            }}
                          >
                            {`"${prompt}"`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-12 rounded-2xl border-2 text-center backdrop-blur-sm"
              style={{
                backgroundColor: colorWithOpacity10,
                borderColor: colorBorder,
              }}
            >
              <Text className="text-white text-lg">
                Use cases are being developed for this website. Check back soon!
              </Text>
            </div>
          )}
        </div>
        {website?.taskExamples?.length ? (
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${website.color}, ${colorWithOpacity10})`,
                }}
              >
                <PiCheckCircleDuotone className="h-7 w-7 text-white" />
              </div>
              <Title
                as="h2"
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${website.color}, ${colorWithOpacity10})`,
                }}
              >
                Task Examples
              </Title>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {website.taskExamples.map((ex, index) => (
                <div
                  key={ex.title}
                  className="relative rounded-2xl border-2 p-4 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                  style={{
                    backgroundColor: colorWithOpacity10,
                    borderColor: colorBorder,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = website.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colorBorder;
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${colorWithOpacity20}, transparent 70%)`,
                    }}
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover/card:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: website.color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Title
                        as="h3"
                        className="text-xl font-bold text-gray-100 mb-1"
                      >
                        {ex.title}
                      </Title>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <PiLightbulbDuotone
                        className="w-5 h-5"
                        style={{ color: website.color }}
                      />
                      <Text className="text-sm font-semibold text-white">
                        Example Prompt:
                      </Text>
                    </div>
                    <div
                      className="p-4 rounded-xl text-sm italic leading-relaxed border backdrop-blur-sm"
                      style={{
                        backgroundColor: colorWithOpacity10,
                        borderColor: colorBorder,
                        color: "#D1D5DB",
                      }}
                    >
                      {`"${ex.prompt}"`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming soon note under Task Examples */}
          </div>
        ) : null}
        {/* {!website.isComingSoon && website.href !== "#" && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
            <Link
              href={website.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta"
            >
              <Button
                size="xl"
                className="group-hover/cta:scale-105 transition-all duration-300 text-white shadow-2xl border-2 px-8 py-4"
                style={{
                  backgroundColor: website.color,
                  borderColor: website.color,
                }}
              >
                <PiGlobeBold className="me-3 h-6 w-6 group-hover/cta:rotate-12 transition-transform" />
                <span className="text-lg font-bold">Launch {website.name}</span>
                <FaExternalLinkAlt className="ms-3 h-5 w-5 transition-transform group-hover/cta:translate-x-1" />
              </Button>
            </Link>
            <a
              href="https://github.com/autoppia"
              target="_blank"
              rel="noopener noreferrer"
              className="group/github-cta"
              style={{
                backgroundColor: website.color,
                borderColor: website.color,
              }}
            >
              <Button
                size="xl"
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-2 border-gray-700 hover:border-gray-500 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-gray-500/50 px-8 py-4"
              >
                <FaGithub className="me-3 h-6 w-6 group-hover/github-cta:rotate-12 transition-transform" />
                <span className="text-lg font-bold">View on GitHub</span>
              </Button>
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
}
