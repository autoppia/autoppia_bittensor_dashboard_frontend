const DEFAULT_ASSET_BASE =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ??
  "https://infinitewebarena.autoppia.com";

const DEFAULT_ALLOWED_IMAGE_HOSTS = [
  "infinitewebarena.autoppia.com",
  "dev-infinitewebarena.autoppia.com",
  "autoppia-subnet.s3.eu-west-1.amazonaws.com", // S3 bucket for validators/miners/gifs
  "autoppia-subnet.s3.amazonaws.com", // S3 default region URL
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

const allowedHosts = new Set<string>(
  [
    ...DEFAULT_ALLOWED_IMAGE_HOSTS,
    ...parseHosts(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS),
    defaultAssetHost,
  ].filter(Boolean)
);

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
  return cleaned ? `/${cleaned}` : "/";
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

  if (
    candidate.startsWith("https://github.com/") &&
    candidate.includes("/blob/")
  ) {
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
        // Block access to backups folder for security
        if (parsed.pathname.startsWith("/backups/")) {
          return "";
        }
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

  // Skip rewriting when we already have a relative path or data URI
  if (value.startsWith("/") || value.startsWith("data:")) {
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
    // noop
  }

  // Any other absolute URL should be considered invalid for frontend assets.
  return "";
};

export function resolveAssetUrl(
  src?: string | null,
  fallback: string = "/images/autoppia-logo.png"
): string {
  const normalizedFallback = rewriteToLocalAsset(sanitizeUrl(fallback));
  const normalizedSrc = rewriteToLocalAsset(sanitizeUrl(src));
  return normalizedSrc || normalizedFallback || "/images/autoppia-logo.png";
}
