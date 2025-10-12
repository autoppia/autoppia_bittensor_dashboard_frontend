/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core"],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
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
