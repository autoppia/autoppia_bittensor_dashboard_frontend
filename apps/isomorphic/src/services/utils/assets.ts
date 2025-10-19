const DEFAULT_ASSET_BASE =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ??
  "https://dev-infinitewebarena.autoppia.com";

export function resolveAssetUrl(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
): string {
  const candidate = typeof src === "string" ? src.trim() : "";
  if (!candidate) {
    return fallback;
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
