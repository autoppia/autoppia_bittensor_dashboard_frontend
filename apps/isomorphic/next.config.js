/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  // Increase timeout for chunk loading
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ['@core/components', '@core/utils'],
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
        protocol: 'https',
        hostname: 'taostats.io',
        port: '',
        pathname: '/favicon.ico',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/land",
        permanent: true,
      },
    ];
  },
};
