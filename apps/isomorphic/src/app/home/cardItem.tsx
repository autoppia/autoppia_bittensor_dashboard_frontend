"use client";

import Image from "next/image";
import Link from "next/link";
import { Text } from "rizzui";
import { WebsiteDataType } from "@/data/websites-data";
import { PiClockDuotone, PiCheckCircleDuotone } from "react-icons/pi";
import cn from "@core/utils/class-names";

interface WebsiteItemProps {
  website: WebsiteDataType;
}

export function WebsiteItem({ website }: WebsiteItemProps) {
  const isComingSoon = website.isComingSoon;

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
  const colorWithOpacity = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const colorBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
  const colorBorderHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;

  return (
    <Link
      href={isComingSoon ? "#" : `/websites/${website.slug}`}
      className={cn(
        "group relative block h-full",
        isComingSoon && "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "relative h-full rounded-2xl overflow-hidden transition-all duration-500",
          "backdrop-blur-sm shadow-lg hover:shadow-2xl",
          "border-2 hover:scale-[1.02]",
          isComingSoon
            ? "bg-gray-500/10 border-gray-500/30 opacity-70"
            : "hover:-translate-y-1"
        )}
        style={{
          backgroundColor: isComingSoon ? undefined : colorWithOpacity,
          borderColor: isComingSoon ? undefined : colorBorder,
        }}
        onMouseEnter={(e) => {
          if (!isComingSoon) {
            e.currentTarget.style.borderColor = colorBorderHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!isComingSoon) {
            e.currentTarget.style.borderColor = colorBorder;
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colorWithOpacity}, transparent 70%)`,
          }}
        ></div>

        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border"
              style={{
                backgroundColor: isComingSoon
                  ? "rgba(107, 114, 128, 0.2)"
                  : colorWithOpacity,
                borderColor: isComingSoon
                  ? "rgba(107, 114, 128, 0.3)"
                  : colorBorder,
                color: isComingSoon ? "#9CA3AF" : website.color,
              }}
            >
              {website.origin}
            </div>
            {!isComingSoon ? (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <PiCheckCircleDuotone className="w-4 h-4" />
                <span>Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                <PiClockDuotone className="w-4 h-4" />
                <span>Soon</span>
              </div>
            )}
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border-2 border-white/10">
            <Image
              src={website.image}
              alt={website.name}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                isComingSoon && "grayscale blur-[2px]"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {isComingSoon && (
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent flex items-center justify-center">
                <div className="bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-600">
                  <Text className="text-xs font-bold text-gray-300">
                    Coming Soon
                  </Text>
                </div>
              </div>
            )}

            {!isComingSoon && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                <div
                  className="flex items-center px-6 py-3 rounded-xl font-bold text-white backdrop-blur-sm border-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl"
                  style={{
                    backgroundColor: colorWithOpacity,
                    borderColor: website.color,
                  }}
                >
                  <span>Explore</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3
              className="text-xl font-bold transition-colors duration-300 group-hover:scale-105 transform origin-left"
              style={{ color: isComingSoon ? "#9CA3AF" : website.color }}
            >
              {website.name}
            </h3>

            {!isComingSoon && website.description && (
              <Text className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                {website.description}
              </Text>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: isComingSoon ? "#9CA3AF" : website.color }}
                  >
                    {website.useCases.length}
                  </Text>
                  <Text className="text-xs text-gray-600">Use Cases</Text>
                </div>
                <div className="text-center">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: isComingSoon ? "#9CA3AF" : website.color }}
                  >
                    {website.avgDifficulty}/10
                  </Text>
                  <Text className="text-xs text-gray-600">Difficulty</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </Link>
  );
}
