const DEFAULT_ASSET_BASE =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ??
  "https://leaderboard.autoppia.com";

export function resolveAssetUrl(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
): string {
  const candidate = typeof src === "string" ? src.trim() : "";
  if (!candidate) {
    return fallback;
  }

  // Rewrite common GitHub blob URLs to raw content URLs
  // e.g., https://github.com/org/repo/blob/branch/path -> https://raw.githubusercontent.com/org/repo/branch/path
  if (candidate.startsWith("https://github.com/") && candidate.includes("/blob/")) {
    const rewritten = candidate
      .replace("https://github.com/", "https://raw.githubusercontent.com/")
      .replace("/blob/", "/");
    return rewritten;
  }

  if (
    candidate.startsWith("http://") ||
    candidate.startsWith("https://") ||
    candidate.startsWith("data:")
  ) {
    return candidate;
  }

  if (candidate.startsWith("//")) {
    return `https:${candidate}`;
  }

  if (candidate.startsWith("/")) {
    return `${DEFAULT_ASSET_BASE}${candidate}`;
  }

  return `${DEFAULT_ASSET_BASE}/${candidate.replace(/^\/+/, "")}`;
}
