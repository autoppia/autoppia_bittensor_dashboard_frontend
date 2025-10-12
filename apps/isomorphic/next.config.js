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
