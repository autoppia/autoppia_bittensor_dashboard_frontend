import cn from "@core/utils/class-names";
import Image from "next/image";
import Link from "next/link";
import type { WebsiteDataType } from "@/data/websites-data";
import { PiEyeDuotone } from "react-icons/pi";

interface WebsiteItemProps {
  website: WebsiteDataType;
}

export function WebsiteItem({ website }: WebsiteItemProps) {
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
      href={website.isComingSoon ? "#" : `/websites/${website.slug}`}
      className={cn(
        "group relative block h-full",
        website.isComingSoon && "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "relative h-full rounded-2xl overflow-hidden transition-all duration-500",
          "backdrop-blur-sm shadow-lg hover:shadow-2xl border-2",
          website.isComingSoon
            ? "bg-gray-500/10 border-gray-500/30 opacity-60"
            : "hover:scale-[1.02] hover:-translate-y-1"
        )}
        style={{
          backgroundColor: website.isComingSoon ? undefined : colorWithOpacity,
          borderColor: website.isComingSoon ? undefined : colorBorder,
        }}
        onMouseEnter={(e) => {
          if (!website.isComingSoon) {
            e.currentTarget.style.borderColor = colorBorderHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!website.isComingSoon) {
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

        {website.image && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={website.image || "/placeholder.svg"}
              alt={website.name}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                website.isComingSoon && "grayscale blur-sm"
              )}
            />

            {!website.isComingSoon && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                <div
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-white backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl"
                  style={{
                    backgroundColor: colorWithOpacity,
                    borderColor: website.color,
                  }}
                >
                  <PiEyeDuotone className="w-5 h-5" />
                  <span>Explore Project</span>
                </div>
              </div>
            )}

            {website.isComingSoon && (
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-gray-300 drop-shadow-lg animate-pulse">
                    Coming Soon
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    Stay tuned for updates
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative flex items-center justify-center p-4 sm:p-5 flex-1">
          <h3
            className="text-base sm:text-lg font-bold drop-shadow-lg group-hover:scale-105 transition-transform text-center"
            style={{ color: website.isComingSoon ? "#9CA3AF" : website.color }}
          >
            {website.name}
          </h3>
        </div>

        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </Link>
  );
}
