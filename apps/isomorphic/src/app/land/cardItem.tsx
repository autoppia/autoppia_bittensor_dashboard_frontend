import cn from "@core/utils/class-names";
import Image from "next/image";
import Link from "next/link";
import type { WebsiteDataType } from "@/data/websites-data";
import { FaArrowRight } from "react-icons/fa";

interface WebsiteItemProps {
  website: WebsiteDataType;
}

export function WebsiteItem({ website }: WebsiteItemProps) {
  return (
    <Link
      href={website.isComingSoon ? "#" : website.href}
      target="_blank"
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-lg border-2 border-cyan-500/30 bg-background/50 backdrop-blur-sm",
        "transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/10",
        "hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1",
        website.isComingSoon && "pointer-events-none"
      )}
    >
      {website.image && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={website.image || "/placeholder.svg"}
            alt={website.name}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-105"
          />

          {!website.isComingSoon && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-cyan-400 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span>Explore Project</span>
                <FaArrowRight className="w-5 h-5" />
              </div>
            </div>
          )}

          {website.isComingSoon && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,255,0.8)] animate-pulse">
                  Coming Soon
                </div>
                <div className="text-sm text-cyan-300/70 font-mono">
                  Stay tuned for updates
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center p-4 sm:p-5 flex-1">
        <h3 className="text-base sm:text-lg font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] group-hover:text-cyan-200 transition-colors text-center">
          {website.name}
        </h3>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-yellow-500/5" />
      </div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
    </Link>
  );
}
