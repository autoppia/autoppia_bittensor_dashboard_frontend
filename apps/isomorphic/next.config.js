const { URL } = require("url");

const DEFAULT_ALLOWED_IMAGE_HOSTS = [
  "infinitewebarena.autoppia.com",
  "dev-infinitewebarena.autoppia.com",
];

const defaultAssetBase =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  "https://infinitewebarena.autoppia.com";

let defaultAssetHost;
try {
  defaultAssetHost = new URL(defaultAssetBase).hostname;
} catch (error) {
  defaultAssetHost = undefined;
}

const envAllowedHosts = (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const allowedImageHosts = Array.from(
  new Set(
    [
      ...DEFAULT_ALLOWED_IMAGE_HOSTS,
      ...envAllowedHosts,
      defaultAssetHost && defaultAssetHost.toLowerCase(),
    ].filter(Boolean)
  )
);

/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  // Increase timeout for chunk loading
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ["@core/components", "@core/utils"],
  },
  turbopack: {
    // Disable Turbopack development overlay
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Fix for react-icons module resolution
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Ensure proper module resolution for react-icons
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Fix chunk loading timeout issues in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              ...config.optimization.splitChunks?.cacheGroups?.default,
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/images-validator/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/images-validators/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/images-miner/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/images-miners/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/gifs/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/dev/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.eu-west-1.amazonaws.com",
        pathname: "/production/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.amazonaws.com",
        pathname: "/images-validator/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.amazonaws.com",
        pathname: "/images-validators/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.amazonaws.com",
        pathname: "/images-miner/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.amazonaws.com",
        pathname: "/images-miners/**",
      },
      {
        protocol: "https",
        hostname: "autoppia-subnet.s3.amazonaws.com",
        pathname: "/gifs/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      },
      {
        source: "/land",
        destination: "/home",
        permanent: false,
      },
      // Legacy routes without /subnet36 prefix -> keep old links working
      {
        source: "/agents/:path*",
        destination: "/subnet36/agents/:path*",
        permanent: false,
      },
      {
        source: "/agent-run/:path*",
        destination: "/subnet36/agent-run/:path*",
        permanent: false,
      },
      {
        source: "/evaluations/:path*",
        destination: "/subnet36/tasks/:path*",
        permanent: false,
      },
      {
        source: "/tasks/:path*",
        destination: "/subnet36/evaluations/:path*",
        permanent: false,
      },
      {
        source: "/rounds/:path*",
        destination: "/subnet36/rounds/:path*",
        permanent: false,
      },
      {
        source: "/overview",
        destination: "/subnet36/overview",
        permanent: false,
      },
    ];
  },
};
