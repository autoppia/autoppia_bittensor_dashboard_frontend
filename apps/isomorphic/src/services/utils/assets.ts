const DEFAULT_ASSET_BASE =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ??
  "https://infinitewebarena.autoppia.com";

const DEFAULT_ALLOWED_IMAGE_HOSTS = [
  "infinitewebarena.autoppia.com",
  "dev-infinitewebarena.autoppia.com",
];

const parseHosts = (value?: string | null): string[] =>
  value
    ?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) ?? [];

let defaultAssetHost = "";
try {
  defaultAssetHost = new URL(DEFAULT_ASSET_BASE).hostname.toLowerCase();
} catch (error) {
  defaultAssetHost = "";
}

const allowedHosts = new Set<string>([
  ...DEFAULT_ALLOWED_IMAGE_HOSTS,
  ...parseHosts(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS),
  defaultAssetHost,
].filter(Boolean));

const isAllowedHost = (hostname: string | null): boolean => {
  if (!hostname) {
    return false;
  }
  const lower = hostname.toLowerCase();
  if (allowedHosts.has(lower)) {
    return true;
  }
  for (const host of allowedHosts) {
    if (host.startsWith("*.")) {
      const suffix = host.slice(1);
      if (lower.endsWith(suffix)) {
        return true;
      }
    }
  }
  return false;
};

const normalizeRelativePath = (value: string): string => {
  const cleaned = value.replace(/^\/+/, "");
  if (!cleaned) {
    return DEFAULT_ASSET_BASE;
  }
  if (DEFAULT_ASSET_BASE) {
    return `${DEFAULT_ASSET_BASE}/${cleaned}`;
  }
  return `/${cleaned}`;
};

const sanitizeUrl = (value?: string | null): string => {
  if (!value) {
    return "";
  }
  const candidate = value.trim();
  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("data:")) {
    return candidate.startsWith("data:image/") ? candidate : "";
  }

  if (candidate.startsWith("https://github.com/") && candidate.includes("/blob/")) {
    const rewritten = candidate
      .replace("https://github.com/", "https://raw.githubusercontent.com/")
      .replace("/blob/", "/");
    return sanitizeUrl(rewritten);
  }

  if (candidate.startsWith("//")) {
    return sanitizeUrl(`https:${candidate}`);
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    try {
      const parsed = new URL(candidate);
      if (isAllowedHost(parsed.hostname)) {
        return parsed.toString();
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  if (candidate.startsWith("/")) {
    return normalizeRelativePath(candidate);
  }

  return normalizeRelativePath(candidate);
};

const rewriteToLocalAsset = (value: string): string => {
  if (!value) {
    return value;
  }

  // Skip rewriting when we don't have an asset base (or the URL is already relative)
  if (!DEFAULT_ASSET_BASE || value.startsWith("/")) {
    return value;
  }

  try {
    const baseUrl = new URL(DEFAULT_ASSET_BASE);
    const candidateUrl = new URL(value);
    if (
      candidateUrl.hostname.toLowerCase() === baseUrl.hostname.toLowerCase() &&
      candidateUrl.protocol === baseUrl.protocol
    ) {
      const path = candidateUrl.pathname || "/";
      return path + candidateUrl.search;
    }
  } catch (error) {
    if (value.startsWith(DEFAULT_ASSET_BASE)) {
      const remainder = value.slice(DEFAULT_ASSET_BASE.length) || "/";
      return remainder.startsWith("/") ? remainder : `/${remainder}`;
    }
  }

  return value;
};

export function resolveAssetUrl(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
): string {
  const normalizedFallback = rewriteToLocalAsset(sanitizeUrl(fallback));
  const normalizedSrc = rewriteToLocalAsset(sanitizeUrl(src));
  return normalizedSrc || normalizedFallback;
}
